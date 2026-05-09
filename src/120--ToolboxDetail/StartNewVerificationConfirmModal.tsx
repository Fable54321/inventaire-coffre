import { AlertTriangle } from "lucide-react";

interface StartNewVerificationConfirmModalProps {
  checkedCount: number;
  isStarting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const StartNewVerificationConfirmModal = ({
  checkedCount,
  isStarting,
  onCancel,
  onConfirm,
}: StartNewVerificationConfirmModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-200">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="mt-1 shrink-0 text-amber-600" size={32} />
          <div>
            <h3 className="text-2xl font-bold text-secondary">Nueva revision</h3>
            <p className="mt-2 text-lg text-slate-700">
              Empezar una nueva revision va a desmarcar todos los items ya marcados.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-900 font-semibold">Usalo solamente cuando quieras comenzar una revision nueva.</p>
          <p className="text-amber-800 mt-2">
            {checkedCount > 0
              ? `${checkedCount} item${checkedCount !== 1 ? "s" : ""} se desmarcaran.`
              : "No hay items marcados por el momento."}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isStarting}
            className="px-6 py-2 rounded-lg font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isStarting}
            className="px-6 py-2 rounded-lg font-semibold bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStarting ? "Preparando..." : "Empezar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartNewVerificationConfirmModal;
