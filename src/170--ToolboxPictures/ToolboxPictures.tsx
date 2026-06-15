import { Link, useNavigate, useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { useEffect, useMemo } from "react";
import type { ToolBox } from "../Contexts/ToolBoxesContext/ToolBoxesContext";
import SinglePicture from "./SinglePicture";


const ToolboxPictures = () => {


const { toolboxId, pictureId } = useParams();
const navigate = useNavigate();

const {
  fetchToolboxPictures,
  fetchSinglePicture,
  selectedPicture,
  selectedPictureLoading,
  selectedPictureError,
  toolboxPictures,
  toolboxPicturesLoading,
  toolboxPicturesError,
  toolBoxes,
} = useToolBoxes();


useEffect(() => {
    if (toolboxId) {
        fetchToolboxPictures(Number(toolboxId));
    }
}, [fetchToolboxPictures, toolboxId]);


useEffect(() => {
    if (toolboxId && pictureId) {
        fetchSinglePicture(Number(toolboxId), Number(pictureId)).catch(() => {
            // error is handled by context state
        });
    }
}, [fetchSinglePicture, toolboxId, pictureId]);


const selectedToolbox = useMemo(() => {

if (!toolBoxes || !toolboxId) return null;

  return toolBoxes.find((toolbox : ToolBox) => toolbox.id === Number(toolboxId));
}, [toolBoxes, toolboxId]);


  return (
    <article className="w-full flex flex-col items-center">
        <h2>Fotos de la caja {selectedToolbox?.code}</h2>
        {toolboxPicturesLoading && <p className="mt-6 text-[1.3em] font-bold">Cargando fotos...</p>}
        {toolboxPicturesError && <p className="mt-6 text-center font-bold text-red-600">{toolboxPicturesError}</p>}
        {!toolboxPicturesLoading && !toolboxPicturesError && toolboxPictures.length === 0 && (
          <p className="mt-6 text-[1.2em] font-bold">No se encontraron fotos para esta caja.</p>
        )}
    <div className="mt-4 md:grid md:grid-cols-3 flex flex-col  items-center gap-2 gap-y-10 w-[min(750px,calc(100%-1rem))]" >
      {toolboxPictures.map((picture) => (
        <Link to={`/toolbox/${toolboxId}/pictures/${picture.id}`} key={picture.id} className="  mx-auto mt-0 mb-auto border border-b border-black/10 bg-[#f4fdf1] rounded-xl shadow-2xl">
        
        <div className="flex flex-col gap-3 relative">
          <p className="flex flex-col justify-center min-h-20 text-center text-[1.1em] font-bold max-w-[98%]">{picture.description}</p>        
          <img src={picture.signed_url} alt={picture.description || ""} />
          </div>
          
        </Link>
        
      ))}

    </div>
    {pictureId && (
      <SinglePicture
        picture={selectedPicture}
        loading={selectedPictureLoading}
        error={selectedPictureError}
        title={selectedPicture?.description || `Foto de la caja ${selectedToolbox?.code ?? ""}`}
        onClose={() => navigate(`/toolbox/${toolboxId}/pictures`)}
      />
    )}
</article>
  )
  
}

export default ToolboxPictures
