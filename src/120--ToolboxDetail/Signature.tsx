
import { Check, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas"


type SignatureProps = {
    onConfirm: () => void
    onCancel: () => void
    setSecondStepConfirmed: React.Dispatch<React.SetStateAction<boolean>>
    signatureDataUrl: string
    setSignatureDataUrl: React.Dispatch<React.SetStateAction<string>>
}



const Signature = ({ onConfirm, onCancel, setSecondStepConfirmed, signatureDataUrl, setSignatureDataUrl }: SignatureProps) => {


const [ isVerificationConfirmed, setIsVerificationConfirmed ] = useState(false);
const signatureRef = useRef<SignatureCanvas | null>(null);
const canvasProps = useMemo(
  () => ({
    width: 360,
    height: 150,
    className: "border border-secondary border-r-gray-300 border-t-gray-300 border-l-2 border-b-3 rounded-lg bg-tertiary w-[360px] max-w-full h-[150px] touch-none",
  }),
  [],
);
const canConfirm = isVerificationConfirmed && signatureDataUrl !== "";

const saveSignature = useCallback(() => {
  const signaturePad = signatureRef.current;

  if (!signaturePad || signaturePad.isEmpty()) {
    setSignatureDataUrl("");
    return;
  }

  setSignatureDataUrl(signaturePad.toDataURL());
}, [setSignatureDataUrl]);

useEffect(() => {
  const signaturePad = signatureRef.current;

  if (!signaturePad || !signatureDataUrl || !signaturePad.isEmpty()) return;

  signaturePad.fromDataURL(signatureDataUrl);
}, [signatureDataUrl]);

const clearSignature = () => {
  signatureRef.current?.clear();
  setSignatureDataUrl("");
};

const currentDateString = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col items-center gap-4">
        <div className=" flex flex-col items-center">
        <h3 className="text-2xl text-center font-bold text-secondary " >
Confirmo que terminé de revisar la caja fuerte el:</h3>
<p className="font-bold text-[1.3em] text-secondary">{currentDateString}</p>
</div>
<div className="flex flex-col items-center">
<p>(
Marque la casilla e introduzca sus iniciales.
)</p>

           <label className={` w-15 h-15 rounded-xl  shadow-[0_4px_6px_rgba(0,0,0,0.1)] border mt-2  border-secondary border-b-3 border-t-gray-100 border-r-gray-300 hover:cursor-pointer flex justify-center items-center bg-tertiary `}>
                                {<Check className= {`text-secondary ${isVerificationConfirmed ? " " : "hidden"}`} size={50}   />}
                                <input
                                  type="checkbox"
                                  checked={isVerificationConfirmed}
                                  onChange={() => setIsVerificationConfirmed(!isVerificationConfirmed)}
                                  className="hidden"
                                />
                                </label>
 </div>
 <div className="flex flex-col gap-2">
      <div className="relative">
        <SignatureCanvas
          ref={signatureRef}
          penColor="blue"
          clearOnResize={false}
          canvasProps={canvasProps}
          onEnd={saveSignature}
        />
        <button
          type="button"
          onClick={clearSignature}
          title="Limpiar firma"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-red-600 shadow-md hover:bg-white"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>
      <button
        type="button"
        disabled={!canConfirm}
        onClick={() => {
          setSecondStepConfirmed(true);
          onConfirm();
        }}
        className="px-6 py-2 text-[2em] rounded-lg font-semibold bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        Confirmar
      </button>
        
      <button type="button" onClick={onCancel} className="px-6 py-2 text-[2em] rounded-lg font-semibold bg-tertiary text-secondary hover:bg-tertiary/90 transition-colors shadow-md">
    anulador
      </button>
</div>

    </div>
  )
}

export default Signature
