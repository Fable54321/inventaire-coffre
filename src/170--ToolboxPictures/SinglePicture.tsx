import { useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { useEffect } from "react";


const SinglePicture = () => {


const { toolboxId, pictureId } = useParams();

const { fetchSinglePicture, selectedPicture, selectedPictureLoading, selectedPictureError } = useToolBoxes();


useEffect(() => {
    if (toolboxId && pictureId) {
        fetchSinglePicture(Number(toolboxId), Number(pictureId));
    }
}, [fetchSinglePicture, toolboxId, pictureId]);

  return (
    <article className="flex flex-col items-center mt-20 gap-4 bg-white py-8 shadow-2xl rounded-xl w-[min(650px,99%)] mx-auto my-4">
        {selectedPictureLoading && <p>Cargando...</p>}
        {selectedPictureError && <p>{selectedPictureError}</p>}
        <img src={selectedPicture?.signed_url} alt="" />
      
    </article>
  )
}

export default SinglePicture
