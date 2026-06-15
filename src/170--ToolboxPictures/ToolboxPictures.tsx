import { useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { useEffect, useMemo } from "react";
import type { ToolBox } from "../Contexts/ToolBoxesContext/ToolBoxesContext";


const ToolboxPictures = () => {


const { toolboxId } = useParams();

const { fetchToolboxPictures, toolboxPictures, toolBoxes } = useToolBoxes();


useEffect(() => {
    if (toolboxId) {
        fetchToolboxPictures(Number(toolboxId));
    }
}, [fetchToolboxPictures, toolboxId]);


useEffect(() => {
    console.log(toolboxPictures);
}, [toolboxPictures]);


const selectedToolbox = useMemo(() => {

if (!toolBoxes || !toolboxId) return null;

  return toolBoxes.find((toolbox : ToolBox) => toolbox.id === Number(toolboxId));
}, [toolBoxes, toolboxId]);


  return (
    <article className="w-full flex flex-col items-center">
        <h2>Fotos de la caja {selectedToolbox?.code}</h2>
    <div className="mt-4 md:grid md:grid-cols-3 flex flex-col  items-center gap-2 gap-y-10 w-[min(750px,calc(100%-1rem))]" >
      {toolboxPictures.map((picture) => (
        <>
       
        <div key={picture.id} className="  mx-auto mt-0 mb-auto border border-b border-black/10 bg-[#f4fdf1] rounded-xl shadow-2xl">
        
        <div className="flex flex-col gap-3 relative">
          <p className="flex flex-col justify-center min-h-20 text-center text-[1.1em] font-bold max-w-[98%]">{picture.description}</p>        
          <img src={picture.signed_url} alt={picture.description || ""} />
          </div>
          
        </div>
        </>
        
      ))}

    </div>
</article>
  )
  
}

export default ToolboxPictures
