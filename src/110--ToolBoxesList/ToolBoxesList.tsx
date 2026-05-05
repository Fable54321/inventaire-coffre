import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";


const ToolBoxesList = () => {

  const { toolBoxes, loading, error } = useToolBoxes();

  
  return (
    <div>
      <h2 className="font-bold font-primary text-[1.8em] text-secondary text-center" >Liste des coffres à outils</h2>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">Erreur: {error}</p>}
      <ul className="flex flex-col gap-2 mt-4">
        {toolBoxes.map((toolbox) => (
          <li key={toolbox.id} className="flex gap-2 button-generic text-[1.5em]">
            <p>Coffre: <span>{toolbox.code}</span></p>
            <p>Utilisé par: <span>{toolbox.name}</span></p>
          </li>
          
        ))}
      </ul>
    </div>
  )
}

export default ToolBoxesList
