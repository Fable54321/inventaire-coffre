import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { Check, CheckCheck, ChevronDown, ChevronsRight, Minus, Plus, ChevronUp, X, ArrowLeftToLine } from "lucide-react";
import StartNewVerificationConfirmModal from "./StartNewVerificationConfirmModal";
import DoneCheckingConfirmModal from "./DoneCheckingConfirmModal";

const ToolboxDetail = () => {
  const { toolboxId } = useParams<{ toolboxId: string }>();
  const {
    toolBoxes,
    toolboxItems,
    toolboxItemsLoading,
    toolboxItemsError,
    fetchToolboxItems,
    updateToolboxItem,
    updateToolboxInventoryStatus,
    uploadToolboxSignature,
  } = useToolBoxes();

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [optimisticCheckedById, setOptimisticCheckedById] = useState<Record<number, boolean>>({});
  const [actualQuantityDraftById, setActualQuantityDraftById] = useState<Record<number, string>>({});
  const [savingActualQuantityById, setSavingActualQuantityById] = useState<Record<number, boolean>>({});
  const [actualQuantityErrorById, setActualQuantityErrorById] = useState<Record<number, string>>({});
  const [doneChecking, setDoneChecking] = useState(false);
  const [showDoneConfirmModal, setShowDoneConfirmModal] = useState(false);
  const [showStartNewConfirmModal, setShowStartNewConfirmModal] = useState(false);
  const [startingNewVerification, setStartingNewVerification] = useState(false);
  const [showNonOkOnly, setShowNonOkOnly] = useState(false);
  const databaseCheckedItems = useMemo(
    () => new Set(toolboxItems.filter((item) => item.is_checked).map((item) => item.item_id)),
    [toolboxItems],
  );





  const getLocalDateString = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


  const checkedItems = useMemo(() => {
    const next = new Set(databaseCheckedItems);

    Object.entries(optimisticCheckedById).forEach(([itemId, isChecked]) => {
      const numericItemId = Number(itemId);

      if (isChecked) {
        next.add(numericItemId);
      } else {
        next.delete(numericItemId);
      }
    });

    return next;
  }, [databaseCheckedItems, optimisticCheckedById]);

  useEffect(() => {
    if (!toolboxId) return;
    const id = Number(toolboxId);
    if (Number.isInteger(id) && id > 0) {
      fetchToolboxItems(id).catch(() => {
        // error is handled by context state
      });
    }
  }, [toolboxId, fetchToolboxItems]);

  const getDraftedActualQuantity = (toolboxItem: typeof toolboxItems[number]) => {
    const draft = actualQuantityDraftById[toolboxItem.item_id];

    if (draft === undefined) {
      return toolboxItem.actual_quantity;
    }

    const trimmedDraft = draft.trim();

    if (trimmedDraft === "") {
      return null;
    }

    const nextQuantity = Number(trimmedDraft);

    return Number.isFinite(nextQuantity) ? nextQuantity : toolboxItem.actual_quantity;
  };

  const updateActualQuantity = async (
    toolboxItem: typeof toolboxItems[number],
    nextQuantityOverride?: number | null,
  ) => {
    if (!toolboxId) return;

    const nextQuantity =
      nextQuantityOverride === undefined ? getDraftedActualQuantity(toolboxItem) : nextQuantityOverride;

    if (nextQuantity !== null && (!Number.isFinite(nextQuantity) || nextQuantity < 0)) {
      setActualQuantityErrorById((prev) => ({
        ...prev,
        [toolboxItem.item_id]: "La cantidad debe ser 0 o más.",
      }));
      return;
    }

    if (nextQuantity === toolboxItem.actual_quantity) {
      setActualQuantityDraftById((prev) => {
        const next = { ...prev };
        delete next[toolboxItem.item_id];
        return next;
      });
      setActualQuantityErrorById((prev) => {
        const next = { ...prev };
        delete next[toolboxItem.item_id];
        return next;
      });
      return;
    }

    // Auto-uncheck if actual quantity is less than expected quantity
    const isQuantityLessThanExpected =
      nextQuantity !== null && toolboxItem.expected_quantity !== null && nextQuantity < toolboxItem.expected_quantity;
    const shouldUncheck = isQuantityLessThanExpected && checkedItems.has(toolboxItem.item_id);
    const nextCheckedState = shouldUncheck ? false : checkedItems.has(toolboxItem.item_id);

    setSavingActualQuantityById((prev) => ({ ...prev, [toolboxItem.item_id]: true }));
    setActualQuantityErrorById((prev) => {
      const next = { ...prev };
      delete next[toolboxItem.item_id];
      return next;
    });

    try {
      await updateToolboxItem(Number(toolboxId), toolboxItem.item_id, {
        actual_quantity: nextQuantity,
        status: toolboxItem.status,
        status_note: toolboxItem.status_note,
        is_checked: nextCheckedState,
      }, {
        trackCheckedChange: false,
      });
      setActualQuantityDraftById((prev) => {
        const next = { ...prev };
        delete next[toolboxItem.item_id];
        return next;
      });
      // Update optimistic state if the item was unchecked
      if (shouldUncheck) {
        setOptimisticCheckedById((prev) => ({
          ...prev,
          [toolboxItem.item_id]: false,
        }));
      }
    } catch (error) {
      setActualQuantityErrorById((prev) => ({
        ...prev,
        [toolboxItem.item_id]: "No se pudo guardar la cantidad.",
      }));
      console.error("Error updating item actual quantity:", error);
    } finally {
      setSavingActualQuantityById((prev) => {
        const next = { ...prev };
        delete next[toolboxItem.item_id];
        return next;
      });
    }
  };

  const adjustActualQuantity = async (toolboxItem: typeof toolboxItems[number], delta: number) => {
    const currentQuantity = getDraftedActualQuantity(toolboxItem) ?? 0;
    const nextQuantity = Math.max(0, currentQuantity + delta);

    setActualQuantityDraftById((prev) => ({
      ...prev,
      [toolboxItem.item_id]: String(nextQuantity),
    }));
    await updateActualQuantity(toolboxItem, nextQuantity);
  };

  const toggleItemChecked = async (itemId: number) => {
    if (!toolboxId) return;
    const toolboxItem = toolboxItems.find((item) => item.item_id === itemId);
    if (!toolboxItem) return;

    const nextChecked = !checkedItems.has(itemId);
    setOptimisticCheckedById((prev) => ({ ...prev, [itemId]: nextChecked }));

    try {
      await updateToolboxItem(Number(toolboxId), itemId, {
        actual_quantity: getDraftedActualQuantity(toolboxItem),
        status: toolboxItem.status,
        status_note: toolboxItem.status_note,
        is_checked: nextChecked,
      });
      setOptimisticCheckedById((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (error) {
      setOptimisticCheckedById((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      console.error('Error updating item checked state:', error);
    }
  };

  const toggleGroupItemsChecked = async (groupItems: typeof toolboxItems[number][]) => {
    if (!toolboxId) return;
    const nextChecked = !isGroupComplete(groupItems);
    const itemsToUpdate = groupItems.filter((item) => checkedItems.has(item.item_id) !== nextChecked);

    if (itemsToUpdate.length === 0) return;

    setOptimisticCheckedById((prev) => {
      const next = { ...prev };
      itemsToUpdate.forEach((item) => {
        next[item.item_id] = nextChecked;
      });
      return next;
    });

    const updateResults = await Promise.allSettled(
      itemsToUpdate.map((item) =>
        updateToolboxItem(Number(toolboxId), item.item_id, {
          actual_quantity: item.actual_quantity,
          status: item.status,
          status_note: item.status_note,
          is_checked: nextChecked,
        }),
      ),
    );

    const failedItemIds = itemsToUpdate
      .filter((_, index) => updateResults[index].status === "rejected")
      .map((item) => item.item_id);
    const successfulItemIds = itemsToUpdate
      .filter((_, index) => updateResults[index].status === "fulfilled")
      .map((item) => item.item_id);

    setOptimisticCheckedById((prev) => {
      const next = { ...prev };

      [...successfulItemIds, ...failedItemIds].forEach((itemId) => {
        delete next[itemId];
      });

      return next;
    });

    if (failedItemIds.length > 0) {
      console.error("Error toggling all group items:", updateResults);
    }
  };




 

  const selectedToolbox = toolboxId
    ? toolBoxes.find((toolbox) => toolbox.id === Number(toolboxId))
    : undefined;

  const itemsWithNonOkStatus = useMemo(
    () =>
      toolboxItems.filter((item) => (item.status ?? "").trim().toLowerCase() !== "ok"),
    [toolboxItems],
  );

  const visibleToolboxItems = showNonOkOnly ? itemsWithNonOkStatus : toolboxItems;

  const groupedItems = useMemo(() => {
    return visibleToolboxItems.reduce((acc, item) => {
      const sectionKey = `${item.section_id}:${item.section_name}`;
      const groupKey = item.group_id != null ? `${sectionKey}:${item.group_id}:${item.group_name}` : `${sectionKey}:no-group`;

      if (!acc[sectionKey]) {
        acc[sectionKey] = {
          sectionName: item.section_name,
          sectionType: item.section_type,
          groups: {},
        };
      }

      const section = acc[sectionKey];
      if (!section.groups[groupKey]) {
        section.groups[groupKey] = {
          groupName: item.group_name || "Sin grupo",
          items: [],
        };
      }

      section.groups[groupKey].items.push(item);
      return acc;
    }, {} as Record<
      string,
      {
        sectionName: string;
        sectionType: string | null;
        groups: Record<string, { groupName: string; items: typeof toolboxItems[number][] }>;
      }
    >);
  }, [visibleToolboxItems]);

  const isGroupComplete = (groupItems: typeof toolboxItems[number][]) =>
    groupItems.every((item) => checkedItems.has(item.item_id));

  const getGroupCheckedCount = (groupItems: typeof toolboxItems[number][]) =>
    groupItems.filter((item) => checkedItems.has(item.item_id)).length;

  const getSectionCheckedCount = (section: typeof groupedItems[string]) =>
    Object.values(section.groups).reduce((acc, group) => acc + getGroupCheckedCount(group.items), 0);

  const getSectionTotalCount = (section: typeof groupedItems[string]) =>
    Object.values(section.groups).reduce((acc, group) => acc + group.items.length, 0);

  const getCheckedCount = () =>
    toolboxItems.filter((item) => checkedItems.has(item.item_id)).length;

  


  const isSectionComplete = (section: typeof groupedItems[string]) =>
    Object.values(section.groups).every((group) =>
      group.items.every((item) => checkedItems.has(item.item_id))
    );

  const allSectionsComplete = useMemo(
    () =>
      toolboxItems.every((item) => checkedItems.has(item.item_id)),
    [toolboxItems, checkedItems]
  );

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const handleDoneChecking = () => {
    if (!doneChecking) {
      setShowDoneConfirmModal(true);
    }
  };

const confirmDoneChecking = async (signatureDataUrl: string) => {
  if (!toolboxId) return;

  try {
    const { signature_key } = await uploadToolboxSignature(Number(toolboxId), signatureDataUrl);

    await updateToolboxInventoryStatus(Number(toolboxId), {
      inventory_done: true,
      verified_at: getLocalDateString(),
      signature_key,
    });

    setDoneChecking(true);
  } catch (error) {
    console.error("Error marking toolbox inventory as done:", error);
  }
};

const startNewVerification = async () => {
  if (!toolboxId || !selectedToolbox) return;

  try {
    setStartingNewVerification(true);
    // Uncheck every checked item
    await Promise.all(
      toolboxItems
        .filter((item) => item.is_checked)
        .map((item) =>
          updateToolboxItem(
            Number(toolboxId),
            item.item_id,
            {
              actual_quantity: item.actual_quantity,
              status: item.status,
              status_note: item.status_note,
              is_checked: false,
            },
            {
              trackCheckedChange: false,
            },
          ),
        ),
    );

    // Reset inventory state BUT keep last verified date
    await updateToolboxInventoryStatus(Number(toolboxId), {
      inventory_done: false,
      verified_at: selectedToolbox.verified_at,
      signature_key: null,
    });

    // Local optimistic reset
    setOptimisticCheckedById({});
    setDoneChecking(false);

    // Refresh items from backend
    await fetchToolboxItems(Number(toolboxId));
    setShowStartNewConfirmModal(false);
  } catch (error) {
    console.error("Error starting new toolbox verification:", error);
  } finally {
    setStartingNewVerification(false);
  }
};

  const cancelDoneChecking = () => {
    setShowDoneConfirmModal(false);
  };

  return (
    <section className="w-full max-w-5xl px-4 py-8">
      <div className=" flex items-center justify-between ">
        <div className="flex flex-col gap-1">
          <h2 className="text-[3em] font-bold text-secondary">
            {selectedToolbox ? `Caja ${selectedToolbox.code}` : "Detalles de la caja"}
          </h2>
          {selectedToolbox && <p className="text-[1.8em] font-bold text-muted">Usado por : {selectedToolbox.name}</p>}
          {selectedToolbox && <p className="text-[1.2em] font-bold text-muted">Última revisión: {selectedToolbox.verified_at ? (selectedToolbox.verified_at).slice(0, 10) : "-" }</p>}
          {selectedToolbox?.inventory_done && (
  <button
    type="button"
    onClick={() => setShowStartNewConfirmModal(true)}
    className="flex items-center justify-center italic gap-2  underline font-bold mx-auto w-full  text-[1.8em] text-secondary hover:cursor-pointer"
  >
    Empezar una nueva revisión
    <ChevronsRight className="text-secondary text-[1.5em] " />
  </button>
)}
          <p className=" text-lg text-slate-600">
            {allSectionsComplete ? "Todas las secciones completadas ✅" : "Marca cada herramienta para seguir el progreso."}
          </p>
          <p className="text-[1.5em] font-bold text-muted">
            recuento total: {getCheckedCount()} / {toolboxItems.length}
          </p>
          <label className="mt-3 flex w-fit items-center gap-3 rounded-md border border-secondary/30 bg-white px-4 py-3 text-[1.15em] font-bold text-secondary shadow-sm hover:cursor-pointer">
            <input
              type="checkbox"
              checked={showNonOkOnly}
              onChange={(event) => setShowNonOkOnly(event.target.checked)}
              className="h-6 w-6 accent-secondary"
            />
            <span>Mostrar solo estado distinto de OK ({itemsWithNonOkStatus.length})</span>
          </label>
        </div> 
        <div className="flex-1 flex flex-col items-center justify-center hover:cursor-pointer">
        
        
        </div>
        <div className="flex-1 flex justify-end">
        <Link to="/" className=" bg-linear-to-t from-red-500 to-red-700 p-2 text-[2em] rounded-lg font-bold font-inter shadow-xl text-white">
          <ArrowLeftToLine size={50} strokeWidth={2} />
        </Link>
        </div>
      </div>

      {!toolboxItemsLoading &&  <button  className="flex items-center justify-center italic gap-2  underline font-bold mx-auto w-full my-18 text-[2.2em] text-secondary hover:cursor-pointer "
        onClick={() => {handleDoneChecking()}}>
          He terminado de revisar esta caja
          <ChevronsRight className="text-secondary text-[2em] " />
        </button>}
 

      {toolboxItemsLoading && <p>Cargando artículos...</p>}
      {toolboxItemsError && <p className="text-red-500">Error : {toolboxItemsError}</p>}
      {!toolboxItemsLoading && !toolboxItemsError && toolboxItems.length === 0 && (
        <p>No se encontraron artículos para esta caja.</p>
      )}
      {!toolboxItemsLoading && !toolboxItemsError && showNonOkOnly && visibleToolboxItems.length === 0 && (
        <p className="text-lg font-semibold text-green-700">No hay herramientas con estado distinto de OK.</p>
      )}

      {!toolboxItemsLoading && !toolboxItemsError &&  Object.entries(groupedItems).map(([sectionKey, section]) => {
        const sectionOpen = openSections.has(sectionKey);
        const sectionComplete = isSectionComplete(section);
        return (

          <div key={sectionKey} className="mb-1 rounded-lg border text-[1.7rem] border-slate-200 bg-white shadow-sm">
            
            <button
              type="button"
              onClick={() => toggleSection(sectionKey)}
              className="flex w-full relative items-center justify-between rounded-t-lg bg-[#f4fdf1] px-4 py-3 text-left font-semibold"
              style={{ boxShadow: "-0px -2px 24px 0px rgba(0,0,0,0.2)" }}
            >
              <div className="relative flex justify-between w-full">
                <div className="flex flex-col gap-2">
                  
                <p className="flex items-center gap-4">
                  <span>Sección: {section.sectionName}</span>
                  <span>({getSectionCheckedCount(section)} / {getSectionTotalCount(section)})</span>
                </p>
                {section.sectionType && <p className="text-sm text-muted">Tipo: {section.sectionType}</p>}
                </div>
                {sectionComplete && <span className="text-green-600 text-[2em] ml-auto mr-20  ">✓</span>}
                
              </div>
              <span className="text-2xl">{sectionOpen ? <ChevronUp /> : <ChevronDown />}</span>
              
            </button>

            {sectionOpen && (
              <div className="space-y-3 p-4 rounded-b-lg" style={{ boxShadow: "0px 12px 24px 0px rgba(0,0,0,0.1)" }}>
                {Object.entries(section.groups).map(([groupKey, group]) => {
                  const groupOpen = openGroups.has(groupKey);
                  const groupComplete = isGroupComplete(group.items);
                  return (
                    <div key={groupKey} className="rounded-lg border border-slate-200 bg-tertiary " >
                      <div className="flex w-full items-center gap-2 px-4 py-3 font-medium relative">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="flex min-w-0 flex-1 items-center justify-between text-left"
                      >

                        <div className="flex min-w-0 flex-1 flex-col gap-2 ">
                        <div className="flex min-w-0 text-[0.8em] items-center gap-2 w-full">
                          <p className="min-w-0 max-w-[70%] flex-1">Grupo: {group.groupName}</p>
                          <p className="shrink-0 whitespace-nowrap">({getGroupCheckedCount(group.items)} / {group.items.length})</p>
                        </div>
                        <div className="flex text-[0.8em] items-center gap-3 ">
                          <p>{groupComplete ? "DESMARCAR TODO EL GRUPO :" : "MARCAR TODO EL GRUPO :"}</p>
                         
                            <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleGroupItemsChecked(group.items);
                        }}
                        title={groupComplete ? "Desmarcar todo el grupo" : "Marcar todo el grupo"}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        
                        {groupComplete ? <X size={24} /> : <CheckCheck size={24} />}
                      </button>
                      </div>
                      
                      </div>
                      {groupComplete && <p className="text-green-600 ml-auto mr-15 text-[1.5em]   ">✓</p>}
                        <span className="text-2xl">{groupOpen ? <ChevronUp /> : <ChevronDown />}</span>
                       
                      </button>
                   
                      </div>
                      
                      {groupOpen && (
                        <div className="space-y-3 px-4 pb-4">
                          {group.items.map((item) => (
                            <div key={item.item_id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm relative">
                              <label className={`absolute top-3 right-3 w-15 h-15 rounded-xl  shadow-[0_4px_6px_rgba(0,0,0,0.1)] border   border-secondary border-b-3 border-t-0 border-l-0 hover:cursor-pointer flex justify-center items-center bg-tertiary `}>
                                {<Check className= {`text-secondary ${checkedItems.has(item.item_id) ? " " : "hidden"}`} size={50}   />}
                                <input
                                  type="checkbox"
                                  checked={checkedItems.has(item.item_id)}
                                  onChange={() => toggleItemChecked(item.item_id)}
                                  className="hidden"
                                />
                                </label>
                                <div className="flex-1">
                                  <p className="font-semibold max-w-[85%]">{item.raw_description}</p>
                                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                    <p>Cantidad esperada: {item.expected_quantity ?? "-"}</p>
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium">Cantidad real</span>
                                      <div className="flex w-fit items-center overflow-hidden rounded-md border border-secondary/50 bg-tertiary shadow-sm">
                                        <button
                                          type="button"
                                          onClick={() => adjustActualQuantity(item, -1)}
                                          disabled={savingActualQuantityById[item.item_id]}
                                          title="Restar cantidad real"
                                          className="flex h-9 w-9 items-center justify-center text-secondary disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          <Minus size={18} />
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          inputMode="numeric"
                                          value={actualQuantityDraftById[item.item_id] ?? item.actual_quantity ?? ""}
                                          onChange={(event) =>
                                            setActualQuantityDraftById((prev) => ({
                                              ...prev,
                                              [item.item_id]: event.target.value,
                                            }))
                                          }
                                          onBlur={() => updateActualQuantity(item)}
                                          onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                              event.currentTarget.blur();
                                            }
                                          }}
                                          disabled={savingActualQuantityById[item.item_id]}
                                          className="h-9 w-16 border-x border-secondary/30 bg-white text-center font-bold text-secondary outline-none disabled:opacity-60"
                                          aria-label="Cantidad real"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => adjustActualQuantity(item, 1)}
                                          disabled={savingActualQuantityById[item.item_id]}
                                          title="Sumar cantidad real"
                                          className="flex h-9 w-9 items-center justify-center text-secondary disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          <Plus size={18} />
                                        </button>
                                      </div>
                                      {actualQuantityErrorById[item.item_id] && (
                                        <span className="text-sm text-red-500">
                                          {actualQuantityErrorById[item.item_id]}
                                        </span>
                                      )}
                                    </div>
                                    <p>Estado: {item.status ?? "-"}</p>
                                    {item.status_note && <p>Nota: {item.status_note}</p>}
                                  </div>
                                </div>
                              
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
       { !toolboxItemsLoading && (
        <button  className="flex items-center justify-center italic gap-2  underline font-bold mx-auto w-full my-18 text-[2.2em] text-secondary hover:cursor-pointer "
          onClick={() => {handleDoneChecking()}}>
            He terminado de revisar esta caja
            <ChevronsRight className="text-secondary text-[2em] " />
          </button>
      )}

      {showDoneConfirmModal && (
        <DoneCheckingConfirmModal
          uncheckedCount={toolboxItems.length - getCheckedCount()}
          onCancel={cancelDoneChecking}
          onConfirm={confirmDoneChecking}
        />
      )}

      {showStartNewConfirmModal && (
        <StartNewVerificationConfirmModal
          checkedCount={getCheckedCount()}
          isStarting={startingNewVerification}
          onCancel={() => setShowStartNewConfirmModal(false)}
          onConfirm={startNewVerification}
        />
      )}
    </section>
  );
};

export default ToolboxDetail;
