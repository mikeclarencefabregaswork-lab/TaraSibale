import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ModalDialog } from "../src/components/ModalDialog";
import { Popover } from "../src/components/Popover";
import { ThemeControl } from "../src/components/ThemeControl";
import "../src/index.css";

export function OverlayFixture() {
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState(false);
  return <>
    <button onClick={() => setModal(true)}>Open fixture dialog</button>
    {modal && <ModalDialog labelledBy="fixture-title" dismissible={!busy} onClose={() => setModal(false)}>
      <div className="bg-white p-8">
        <h2 id="fixture-title">Fixture form</h2>
        <label>Message<textarea autoFocus /></label>
        <label><input type="checkbox" checked={busy} onChange={event => setBusy(event.target.checked)} />Operation in progress</label>
        <button onClick={() => setModal(false)}>Close fixture</button>
      </div>
    </ModalDialog>}
    <button id="fixture-trigger" style={{ position: "fixed", top: 0, right: 0 }}
      aria-expanded={panel} aria-controls="fixture-panel" onClick={() => setPanel(previous => !previous)}>Open fixture panel</button>
    <Popover id="fixture-panel" triggerId="fixture-trigger" open={panel} onOpenChange={setPanel}
      className="w-72 border bg-white p-4">
      <a href="#fixture">Fixture link</a>
      <ThemeControl value="system" onChange={() => {}} />
    </Popover>
  </>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><OverlayFixture /></StrictMode>);
