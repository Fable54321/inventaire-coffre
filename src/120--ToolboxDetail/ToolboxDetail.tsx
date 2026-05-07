import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { Check } from "lucide-react";

const ToolboxDetail = () => {
  const { toolboxId } = useParams<{ toolboxId: string }>();
  const {
    toolBoxes,
    toolboxItems,
    toolboxItemsLoading,
    toolboxItemsError,
    fetchToolboxItems,
    updateToolboxItem,
  } = useToolBoxes();

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [optimisticCheckedById, setOptimisticCheckedById] = useState<Record<number, boolean>>({});
  const databaseCheckedItems = useMemo(
    () => new Set(toolboxItems.filter((item) => item.is_checked).map((item) => item.item_id)),
    [toolboxItems],
  );
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
    setOptimisticCheckedById((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.entries(next).forEach(([itemId, optimisticChecked]) => {
        if (databaseCheckedItems.has(Number(itemId)) === optimisticChecked) {
          delete next[Number(itemId)];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [databaseCheckedItems]);

  useEffect(() => {
    if (!toolboxId) return;
    const id = Number(toolboxId);
    if (Number.isInteger(id) && id > 0) {
      fetchToolboxItems(id).catch(() => {
        // error is handled by context state
      });
    }
  }, [toolboxId, fetchToolboxItems]);

  const toggleItemChecked = async (itemId: number) => {
    if (!toolboxId) return;
    const toolboxItem = toolboxItems.find((item) => item.item_id === itemId);
    if (!toolboxItem) return;

    const nextChecked = !checkedItems.has(itemId);
    setOptimisticCheckedById((prev) => ({ ...prev, [itemId]: nextChecked }));

    try {
      await updateToolboxItem(Number(toolboxId), itemId, {
        actual_quantity: toolboxItem.actual_quantity,
        status: toolboxItem.status,
        status_note: toolboxItem.status_note,
        is_checked: nextChecked,
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


  useEffect(() => {
    console.log("Toolbox items updated:", toolboxItems);
  },[toolboxItems])

 

  const selectedToolbox = toolboxId
    ? toolBoxes.find((toolbox) => toolbox.id === Number(toolboxId))
    : undefined;

  const groupedItems = useMemo(() => {
    return toolboxItems.reduce((acc, item) => {
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
  }, [toolboxItems]);

  const isGroupComplete = (groupItems: typeof toolboxItems[number][]) =>
    groupItems.every((item) => checkedItems.has(item.item_id));

  const getGroupCheckedCount = (groupItems: typeof toolboxItems[number][]) =>
    groupItems.filter((item) => checkedItems.has(item.item_id)).length;

  const getSectionCheckedCount = (section: typeof groupedItems[string]) =>
    Object.values(section.groups).reduce((acc, group) => acc + getGroupCheckedCount(group.items), 0);

  const getSectionTotalCount = (section: typeof groupedItems[string]) =>
    Object.values(section.groups).reduce((acc, group) => acc + group.items.length, 0);

  const isSectionComplete = (section: typeof groupedItems[string]) =>
    Object.values(section.groups).every((group) =>
      group.items.every((item) => checkedItems.has(item.item_id))
    );

  const allSectionsComplete = useMemo(
    () =>
      Object.values(groupedItems).every((section) =>
        Object.values(section.groups).every((group) =>
          group.items.every((item) => checkedItems.has(item.item_id))
        )
      ),
    [groupedItems, checkedItems]
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

  return (
    <section className="w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">
            {selectedToolbox ? `Caja ${selectedToolbox.code}` : "Detalles de la caja"}
          </h2>
          {selectedToolbox && <p className="text-sm text-muted">Usado por : {selectedToolbox.name}</p>}
          <p className="mt-2 text-sm text-slate-600">
            {allSectionsComplete ? "Todas las secciones completadas ✅" : "Marca cada herramienta para seguir el progreso."}
          </p>
        </div>
        <Link to="/" className="bg-linear-to-t from-red-500 to-red-700 p-2 text-[1.1em] rounded-lg font-bold font-inter shadow-xl text-white">
          volver
        </Link>
      </div>

      {toolboxItemsLoading && <p>Cargando artículos...</p>}
      {toolboxItemsError && <p className="text-red-500">Error : {toolboxItemsError}</p>}
      {!toolboxItemsLoading && !toolboxItemsError && toolboxItems.length === 0 && (
        <p>No se encontraron artículos para esta caja.</p>
      )}

      {!toolboxItemsLoading && !toolboxItemsError &&  Object.entries(groupedItems).map(([sectionKey, section]) => {
        const sectionOpen = openSections.has(sectionKey);
        const sectionComplete = isSectionComplete(section);
        return (
          <div key={sectionKey} className="mb-4 rounded-lg border border-slate-200 bg-white shadow-sm"> 
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
                {sectionComplete && <span className="text-green-600 text-[2em] ml-10 mr-auto ">✓</span>}
                
              </div>
              <span className="text-2xl">{sectionOpen ? "−" : "+"}</span>
              
            </button>

            {sectionOpen && (
              <div className="space-y-3 p-4 rounded-b-lg" style={{ boxShadow: "0px 12px 24px 0px rgba(0,0,0,0.1)" }}>
                {Object.entries(section.groups).map(([groupKey, group]) => {
                  const groupOpen = openGroups.has(groupKey);
                  const groupComplete = isGroupComplete(group.items);
                  return (
                    <div key={groupKey} className="rounded-lg border border-slate-200 bg-tertiary " >
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium relative"
                      >
                        <span className="flex items-center gap-2">
                          <span>Grupo: {group.groupName}</span>
                          <span>({getGroupCheckedCount(group.items)} / {group.items.length})</span>
                        </span>
                         {groupComplete && <span className="text-green-600 ml-10 mr-auto text-[1.5em] ">✓</span>}
                        <span className="text-2xl">{groupOpen ? "−" : "+"}</span>
                       
                      </button>
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
                                  <p className="font-semibold">{item.raw_description}</p>
                                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    <p>Cantidad esperada: {item.expected_quantity ?? "-"}</p>
                                    <p>Cantidad real: {item.actual_quantity ?? "-"}</p>
                                    
                                    <p>Estado: {item.status ?? "-"}</p>
                                    {item.status_note && <p>Nota: {item.status_note}</p>}
                                  </div>
                                  {item.variant_name && <p className="mt-2">Variante: {item.variant_name}</p>}
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
    </section>
  );
};

export default ToolboxDetail;
