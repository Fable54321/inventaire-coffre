import { useState } from "react";
import Signature from "./Signature";

interface DoneCheckingConfirmModalProps {
  uncheckedCount: number;
  onCancel: () => void;
  onConfirm: (signatureDataUrl: string) => void | Promise<void>;
}

const DoneCheckingConfirmModal = ({
  uncheckedCount,
  onCancel,
  onConfirm,
}: DoneCheckingConfirmModalProps) => {


const [firstStepConfirmed, setFirstStepConfirmed] = useState(false);
const [signatureDataUrl, setSignatureDataUrl] = useState("");


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-200">
        {!firstStepConfirmed &&
          <>
          <h3 className="text-2xl font-bold text-secondary mb-4">Confirmar revision</h3>
        <p className="text-lg text-slate-700 mb-6">Estas seguro de que has terminado de revisar esta caja?</p>

        {uncheckedCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-900 font-semibold mb-2">Herramientas sin marcar</p>
            <p className="text-amber-800">
              Tienes <span className="font-bold">{uncheckedCount}</span> herramienta
              {uncheckedCount !== 1 ? "s" : ""} sin marcar.
            </p>
            <p className="text-amber-800 mt-2">
              Confirmas que estas herramientas no estan olvidadas sino que realmente faltan?
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() =>setFirstStepConfirmed(true)}
            className="px-6 py-2 rounded-lg font-semibold bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-md"
          >
            Confirmar
          </button>
         
          
        </div>
         </>
}
{
  firstStepConfirmed &&
  <Signature
    onConfirm={onConfirm}
    onCancel={onCancel}
    signatureDataUrl={signatureDataUrl}
    setSignatureDataUrl={setSignatureDataUrl}
  />
}
      </div>
    </div>
  );
};

export default DoneCheckingConfirmModal;
