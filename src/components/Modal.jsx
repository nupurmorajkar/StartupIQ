// import { useEffect } from "react";
// import { CloseIcon } from "./icons";

// export default function Modal({ title, onClose, children, footer }) {
//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && onClose();
//     document.addEventListener("keydown", onKey);
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.removeEventListener("keydown", onKey);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <div
//       className="modal-overlay"
//       onMouseDown={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title}>
//         <div className="modal-grip" />
//         <div className="modal-head">
//           <h2 className="modal-title">{title}</h2>
//           <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
//             <CloseIcon />
//           </button>
//         </div>
//         <div className="modal-body">{children}</div>
//         {footer && <div className="modal-foot">{footer}</div>}
//       </div>
//     </div>
//   );
// }
import { useEffect } from "react";
import { CloseIcon } from "./icons";

export default function Modal({ title, onClose, children, footer, canClose = true }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && canClose && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [canClose, onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && canClose && onClose()}
    >
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-grip" />
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>

          {canClose && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}