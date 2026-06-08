import { Link } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import toolbox_icon from "../assets/images/toolbox.png";
import { ChevronRight } from "lucide-react";

const ToolBoxesList = () => {

  const { toolBoxes, toolboxCheckSummaryById, loading, error } = useToolBoxes();


  type SortMap = Record<string, number>;

  const sortMap : SortMap = {
    "Caja: 26-11": 1,
    "Caja: 26-12": 2,
    "Caja: 26-13": 3,
    "Caja: 26-14": 4,
    "Caja: 26-15": 5,
    "Caja: 26-16": 6,
    "Caja: 26-17": 7,
    "Caja: 26-19": 8,
    "Caja: 26-20": 10,
  }

  



  
  return (
    <div className="w-full ">
      <div className="relative w-[min(750px,99%)] mx-auto my-4">
        <div className="h-0.5 w-20 bg-linear-to-l from-primary to-transparent absolute left-5 top-1/2 -translate-y-1/2"></div>
        <div className="h-0.5 w-20 bg-linear-to-r from-primary to-transparent absolute right-5 top-1/2 -translate-y-1/2"></div>
      <h2 className="font-bold font-[inter] text-[2em] text-secondary text-center" >Lista de cajas de herramientas</h2>
      <div></div>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <ul className="flex flex-col gap-2 mt-5 w-[min(750px,98%)] mx-auto mb-5">
        {toolBoxes
        .sort((a, b) => {
          const nameA = `Caja: ${a.code}`;
          const nameB = `Caja: ${b.code}`;
          return (sortMap[nameA] ?? 999) - (sortMap[nameB] ?? 999);
        })
        .map((toolbox) => (
          <li key={toolbox.id} className="">
            <Link to={`/toolbox/${toolbox.id}`} className="flex flex-col gap-3 items-center bg-[#f4fdf1] rounded-lg p-4 relative" style={{ boxShadow: "-2px 2px 24px 0px rgba(0,0,0,0.4)" }}>
              <div className="flex gap-10 items-center justify-between w-[90%]">
              <div className="p-1 px-2 rounded-lg bg-primary">
                <img src={toolbox_icon} alt="Toolbox" className="w-10 h-10" />
              </div>
              <p className="font-bold text-secondary text-[2.5em] border-2 border-secondary/50 border-t-0 border-b-0 px-7 leading-none">Caja: {toolbox.code}</p>
              <div className="flex flex-col gap-1">
                <p className="text-[1.2em] ">
                  Usado por : 
                </p>
                <p className="text-[2em] inline font-bold">{toolbox.name}</p>
                </div>
                </div>
                <div className="flex justify-around w-full">
                 {toolbox.inventory_done && <Link to={`/verification/${toolbox.id}`} className="flex items-center text-[1.1em] underline font-semibold text-secondary">Última revisión: {toolbox.verified_at ? (toolbox.verified_at).slice(0, 10) : "-" }
                 <ChevronRight className=" text-secondary strokeWidth={3}" size={18}/></Link>} 
                <p className="text-[1.1em] font-semibold text-secondary">
                  Herramientas verificadas :{" "}
                  {toolboxCheckSummaryById[toolbox.id]
                    ? `${toolboxCheckSummaryById[toolbox.id].checked} / ${toolboxCheckSummaryById[toolbox.id].total}`
                    : "-"}
                </p>

                </div>
              <ChevronRight className=" text-secondary absolute right-4 top-1/2 transform -translate-y-1/2" strokeWidth={3} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ToolBoxesList
