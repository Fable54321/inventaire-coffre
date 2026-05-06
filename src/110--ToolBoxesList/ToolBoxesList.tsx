import { Link } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import toolbox_icon from "../assets/images/toolbox.png";
import { ChevronRight } from "lucide-react";

const ToolBoxesList = () => {

  const { toolBoxes, loading, error } = useToolBoxes();

  
  return (
    <div className="w-full ">
      <div className="relative w-[min(750px,99%)] mx-auto my-2">
        <div className="h-0.5 w-20 bg-linear-to-l from-primary to-transparent absolute left-15 top-1/2 -translate-y-1/2"></div>
        <div className="h-0.5 w-20 bg-linear-to-r from-primary to-transparent absolute right-15 top-1/2 -translate-y-1/2"></div>
      <h2 className="font-bold font-[inter] text-[1.6em] text-secondary text-center" >Lista de cajas de herramientas</h2>
      <div></div>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <ul className="flex flex-col gap-2 mt-5 w-[min(750px,99%)] mx-auto">
        {toolBoxes.map((toolbox) => (
          <li key={toolbox.id} className="">
            <Link to={`/toolbox/${toolbox.id}`} className="flex gap-10 items-center bg-[#f4fdf1] rounded-lg p-4 relative" style={{ boxShadow: "-2px 2px 24px 0px rgba(0,0,0,0.4)" }}>
              <div className="p-1 px-2 rounded-lg bg-primary">
                <img src={toolbox_icon} alt="Toolbox" className="w-10 h-10" />
              </div>
              <p className="font-bold text-secondary text-[1.7em] border-2 border-secondary/50 border-t-0 border-b-0 px-7 leading-none">Caja: {toolbox.code}</p>
              <p className="text-[1em] ">Usado por : <p className="text-[1.7em] inline font-bold">{toolbox.name}</p></p>
              <ChevronRight className=" text-secondary absolute right-4 top-1/2 transform -translate-y-1/2" strokeWidth={3} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ToolBoxesList
