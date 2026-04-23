import { Icon } from "@iconify/react";
import "./Modal.css";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type ModalVariant = "decision" | "success" | "error" | "warning" | "info";

export interface ModalProps {
  /** Controls visibility */
  open: boolean;

  /** Visual style of the modal */
  variant: ModalVariant;

  /** Bold headline text */
  title: string;

  /** Supporting description below the title */
  description?: string;

  // ── Decision variant ──
  /** Label for the confirm/primary action button (decision only) */
  confirmLabel?: string;
  /** Label for the cancel button (decision only) */
  cancelLabel?: string;
  /** Called when the confirm button is clicked */
  onConfirm?: () => void;
  /** Called when the cancel button is clicked */
  onCancel?: () => void;

  // ── Feedback variants (success / error / warning / info) ──
  /** Label for the single dismiss button */
  okLabel?: string;
  /** Called when okay/dismiss is clicked */
  onOk?: () => void;
}

// ─────────────────────────────────────────────
// CONFIG MAP
// ─────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ModalVariant,
  { icon: string; iconClass: string; boxClass: string; btnClass: string }
> = {
  decision: {
    icon: "solar:question-circle-bold",
    iconClass: "umodal-icon--decision",
    boxClass: "umodal-box--decision",
    btnClass: "umodal-btn--decision",
  },
  success: {
    icon: "solar:check-circle-bold",
    iconClass: "umodal-icon--success",
    boxClass: "umodal-box--success",
    btnClass: "umodal-btn--success",
  },
  error: {
    icon: "solar:close-circle-bold",
    iconClass: "umodal-icon--error",
    boxClass: "umodal-box--error",
    btnClass: "umodal-btn--error",
  },
  warning: {
    icon: "solar:danger-triangle-bold",
    iconClass: "umodal-icon--warning",
    boxClass: "umodal-box--warning",
    btnClass: "umodal-btn--warning",
  },
  info: {
    icon: "solar:info-circle-bold",
    iconClass: "umodal-icon--info",
    boxClass: "umodal-box--info",
    btnClass: "umodal-btn--info",
  },
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function Modal({
  open,
  variant,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  okLabel = "Okay",
  onOk,
}: ModalProps) {
  if (!open) return null;

  const cfg = VARIANT_CONFIG[variant];
  const isDecision = variant === "decision";

  return (
    // Backdrop — no onClick handler so outside clicks are completely ignored
    <div className="umodal-overlay">
      <div className={`umodal-box ${cfg.boxClass}`}>

        {/* Icon */}
        <div className={`umodal-icon-wrap ${cfg.iconClass}`}>
          <Icon icon={cfg.icon} className="umodal-icon" />
        </div>

        {/* Text */}
        <div className="umodal-text">
          <h2 className="umodal-title">{title}</h2>
          {description && <p className="umodal-desc">{description}</p>}
        </div>

        {/* Actions */}
        <div className={`umodal-actions ${!isDecision ? "umodal-actions--centered" : ""}`}>
          {isDecision ? (
            <>
              <button className="umodal-btn umodal-btn--cancel" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button className={`umodal-btn ${cfg.btnClass}`} onClick={onConfirm}>
                {confirmLabel}
              </button>
            </>
          ) : (
            <button className={`umodal-btn umodal-btn--wide ${cfg.btnClass}`} onClick={onOk}>
              {okLabel}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}