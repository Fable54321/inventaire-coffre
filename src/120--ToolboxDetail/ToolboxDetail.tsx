import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";

const ToolboxDetail = () => {
  const { toolboxId } = useParams<{ toolboxId: string }>();
  const {
    toolBoxes,
    toolboxItems,
    toolboxItemsLoading,
    toolboxItemsError,
    fetchToolboxItems,
  } = useToolBoxes();

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!toolboxId) return;
    const id = Number(toolboxId);
    if (Number.isInteger(id) && id > 0) {
      fetchToolboxItems(id).catch(() => {
        // error is handled by context state
      });
    }
  }, [toolboxId, fetchToolboxItems]);

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
        </div>
        <Link to="/" className="button-generic text-base">
          Volver a la lista
        </Link>
      </div>

      {toolboxItemsLoading && <p>Cargando artículos...</p>}
      {toolboxItemsError && <p className="text-red-500">Error : {toolboxItemsError}</p>}
      {!toolboxItemsLoading && !toolboxItemsError && toolboxItems.length === 0 && (
        <p>No se encontraron artículos para esta caja.</p>
      )}

      {Object.entries(groupedItems).map(([sectionKey, section]) => {
        const sectionOpen = openSections.has(sectionKey);
        return (
          <div key={sectionKey} className="mb-4 rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection(sectionKey)}
              className="flex w-full items-center justify-between rounded-t-lg bg-slate-100 px-4 py-3 text-left font-semibold"
            >
              <div>
                <p>Sección: {section.sectionName}</p>
                {section.sectionType && <p className="text-sm text-muted">Tipo: {section.sectionType}</p>}
              </div>
              <span className="text-2xl">{sectionOpen ? "−" : "+"}</span>
            </button>

            {sectionOpen && (
              <div className="space-y-3 p-4">
                {Object.entries(section.groups).map(([groupKey, group]) => {
                  const groupOpen = openGroups.has(groupKey);
                  return (
                    <div key={groupKey} className="rounded-lg border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
                      >
                        <span>Grupo: {group.groupName}</span>
                        <span className="text-2xl">{groupOpen ? "−" : "+"}</span>
                      </button>
                      {groupOpen && (
                        <div className="space-y-3 px-4 pb-4">
                          {group.items.map((item) => (
                            <div key={item.item_id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                              <p className="font-semibold">{item.raw_description}</p>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                <p>Cantidad esperada: {item.expected_quantity ?? "-"}</p>
                                <p>Cantidad real: {item.actual_quantity ?? "-"}</p>
                                <p>Estado: {item.status ?? "-"}</p>
                                {item.status_note && <p>Nota: {item.status_note}</p>}
                              </div>
                              {item.variant_name && <p className="mt-2">Variante: {item.variant_name}</p>}
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
