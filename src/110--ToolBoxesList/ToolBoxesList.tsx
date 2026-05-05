import { Link } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";


const ToolBoxesList = () => {

  const { toolBoxes, loading, error } = useToolBoxes();

  
  return (
    <div>
      <h2 className="font-bold font-primary text-[1.8em] text-secondary text-center" >Lista de cajas de herramientas</h2>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <ul className="flex flex-col gap-2 mt-4">
        {toolBoxes.map((toolbox) => (
          <li key={toolbox.id} className="button-generic text-[1.5em]">
            <Link to={`/toolbox/${toolbox.id}`} className="flex gap-2 items-center">
              <p>Caja: <span>{toolbox.code}</span></p>
              <p>Usado por: <span>{toolbox.name}</span></p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ToolBoxesList
