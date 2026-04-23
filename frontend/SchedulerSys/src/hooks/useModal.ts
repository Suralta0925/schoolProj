import { useState } from "react";
import { type ModalVariant } from "../components/Modal";

interface ModalState {
  open: boolean;
  variant: ModalVariant;
  title: string;
  description?: string;
  // decision
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;   // ← was missing
  // feedback
  okLabel?: string;
  onOk?: () => void;       // ← was missing
}

const DEFAULT_STATE: ModalState = {
  open: false,
  variant: "info",
  title: "",
};

export function useModal() {
  const [state, setState] = useState<ModalState>(DEFAULT_STATE);

  function show(config: Omit<ModalState, "open">) {
    setState({ ...config, open: true });
  }

  function close() {
    setState((prev) => ({ ...prev, open: false }));
  }

  return { state, show, close };
}