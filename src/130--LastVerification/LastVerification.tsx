import { useParams } from "react-router-dom";
import { useToolBoxes } from "../Contexts/ToolBoxesContext/UseToolBoxes";
import { useEffect } from "react";


const LastVerification = () => {

  const { toolboxId } = useParams<{ toolboxId: string }>();
  const { fetchVerification, currentVerification, toolBoxes, verificationLoading } = useToolBoxes();


  const currentToolbox = toolBoxes.find(toolbox => toolbox.id === Number(toolboxId));

  

  useEffect(() => {
    if (toolboxId) {
      fetchVerification(Number(toolboxId));
    }
  }, [fetchVerification, toolboxId]);


  useEffect(() => {console.log(currentVerification)},[currentVerification])

  return (

  



    <article className="flex flex-col items-center mt-20 gap-4 bg-white py-8 shadow-2xl rounded-xl w-[min(650px,99%)] mx-auto my-4">
        {currentToolbox && (
            <div>
          <h2 className="font-bold font-[inter] text-[2em] text-secondary text-center" >Ultima Revisión de la caja : {currentToolbox.code}</h2>
          <h2 className="font-bold font-[inter] text-[2em] text-secondary text-center" >usado por: {currentToolbox.name}</h2>
          </div>
        )}
        {verificationLoading && <p>Cargando...</p>}
      {currentVerification && (
        <>
        <p className=" text-[1.7em]">Verificado el: {currentVerification.verified_at?.slice(0, 10)}</p>
        <p className=" text-[1.7em]">herramientas totales: {currentVerification.checked_items} / {currentVerification.total_items}</p>
          {currentVerification.signature_url && (
            <img className="bg-white border border-gray-400" src={currentVerification.signature_url} alt="signature" />
          )}
        </>
      )}
    </article>
  )
}

export default LastVerification
