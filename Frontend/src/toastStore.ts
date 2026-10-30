export type ToastKind = "success" | "error" | "info";
export interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}
let nextId = 0;
let items: ToastMessage[] = [];
const listeners = new Set<() => void>();
export const getToasts = () => items;
export const subscribeToasts = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
function publish(message: string, kind: ToastKind) {
  if (
    !message.trim() ||
    items.some((item) => item.message === message && item.kind === kind)
  )
    return;
  items = [...items, { id: ++nextId, message, kind }].slice(-4);
  listeners.forEach((listener) => listener());
}
export function dismissToast(id: number) {
  items = items.filter((item) => item.id !== id);
  listeners.forEach((listener) => listener());
}
export const toast = {
  success: (message: string) => publish(message, "success"),
  error: (message: string) => publish(message, "error"),
  info: (message: string) => publish(message, "info"),
};
