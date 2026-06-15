import { X } from "lucide-react";
import { useEffect } from "react";
import type { ToolboxPicture } from "../Contexts/ToolBoxesContext/ToolBoxesContext";

interface SinglePictureProps {
  picture: ToolboxPicture | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  title?: string;
}

const SinglePicture = ({ picture, loading, error, onClose, title }: SinglePictureProps) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <article
        className="relative flex max-h-[92vh] w-[min(900px,98%)] flex-col items-center gap-4 overflow-auto rounded-lg bg-white p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-md bg-red-600 text-white shadow-md"
          aria-label="Cerrar foto"
          title="Cerrar foto"
        >
          <X size={28} />
        </button>

        {title && <h3 className="max-w-[calc(100%-4rem)] text-center text-[1.4em] font-bold text-secondary">{title}</h3>}
        {loading && <p className="py-12 text-[1.4em] font-bold">Cargando...</p>}
        {error && <p className="py-12 text-center text-[1.2em] font-bold text-red-600">{error}</p>}
        {!loading && !error && picture && (
          <img
            className="max-h-[78vh] w-auto max-w-full rounded-md object-contain"
            src={picture.signed_url}
            alt={picture.description || title || "Foto"}
          />
        )}
      </article>
    </div>
  )
}

export default SinglePicture
