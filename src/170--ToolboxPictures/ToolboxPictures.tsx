import { useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { useEffect } from "react";


const ToolboxPictures = () => {


const { toolboxId } = useParams();

const { fetchToolboxPictures, toolboxPictures } = useToolBoxes();


useEffect(() => {
    if (toolboxId) {
        fetchToolboxPictures(Number(toolboxId));
    }
}, [fetchToolboxPictures, toolboxId]);


useEffect(() => {
    console.log(toolboxPictures);
}, [toolboxPictures]);


  return (
    <article className="w-full flex flex-col items-center">
    <div className="grid grid-cols-2 items-center gap-2 w-[min(750px,calc(100%-1rem))]" >
      {toolboxPictures.map((picture) => (
        <>
       
        <div key={picture.id} className="  mx-auto">
        
        <div className="flex flex-col">
          <p>{picture.description}</p>        
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
