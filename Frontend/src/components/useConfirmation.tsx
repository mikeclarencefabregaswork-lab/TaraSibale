import { useEffect, useRef, useState } from "react";
import { ModalDialog } from "./ModalDialog";
import { SurfacePresence } from "./SurfacePresence";

/** App-owned confirmations share the same animation and keyboard behavior. */
export function useConfirmation() {
  const [message, setMessage] = useState<string | null>(null);
  const pending = useRef<((confirmed: boolean) => void) | null>(null);
  useEffect(() => () => { pending.current?.(false); pending.current = null; }, []);
  const finish = (confirmed: boolean) => {
    const resolve = pending.current;
    pending.current = null;
    resolve?.(confirmed);
    setMessage(null);
  };
  const confirm = (text: string) => new Promise<boolean>(resolve => {
    pending.current?.(false);
    pending.current = resolve;
    setMessage(text);
  });
  const dialog = <SurfacePresence>{message && <ModalDialog label="Confirm removal" maxWidth="28rem" onClose={() => finish(false)}>
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 dark:border-white/15 dark:bg-[#0b2d40] dark:text-white">
      <h2 className="text-lg font-bold">Confirm removal</h2>
      <p className="mt-3 text-sm">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" autoFocus onClick={() => finish(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 dark:border-white/20">Cancel</button>
        <button type="button" onClick={() => finish(true)} className="min-h-11 rounded-xl bg-rose-600 px-4 font-bold text-white">Remove</button>
      </div>
    </div>
  </ModalDialog>}</SurfacePresence>;
  return { confirm, dialog };
}
