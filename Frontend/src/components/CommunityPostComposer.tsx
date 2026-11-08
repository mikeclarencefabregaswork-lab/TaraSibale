import { ImagePlus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { errorText } from "../api";
import { preparePostImage } from "../postImage";
import type { SocialPost, SocialPostDraft } from "../types";
import { AnimatedSurface } from "./SurfacePresence";

interface Props {
  isDarkMode: boolean;
  onAddPost: (draft: SocialPostDraft) => Promise<SocialPost>;
  onClose: () => void;
}

export function CommunityPostComposer({ isDarkMode, onAddPost, onClose }: Props): React.ReactElement {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("Bachawan Beach, Concepcion");
  const [image, setImage] = useState<string>();
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const lifecycle = useRef({ active: true, version: 0 });
  const dialog = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const life = lifecycle.current;
    life.active = true;
    const before = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector("textarea")?.focus();
    return () => { life.active = false; life.version++; before?.focus(); };
  }, []);

  const clearImage = () => {
    lifecycle.current.version++;
    setImage(undefined);
    setFileName("");
    setProcessing(false);
    setError(undefined);
    if (fileInput.current) fileInput.current.value = "";
  };
  const close = () => {
    if (submitting) return;
    clearImage();
    setCaption("");
    setLocation("Bachawan Beach, Concepcion");
    onClose();
  };
  const chooseImage = async (file: File) => {
    const selected = ++lifecycle.current.version;
    setImage(undefined);
    setFileName("");
    setProcessing(true);
    setError(undefined);
    try {
      const data = await preparePostImage(file);
      if (lifecycle.current.active && selected === lifecycle.current.version) { setImage(data); setFileName(file.name); }
    } catch (error) {
      if (lifecycle.current.active && selected === lifecycle.current.version) {
        setError(errorText(error));
        if (fileInput.current) fileInput.current.value = "";
      }
    } finally {
      if (lifecycle.current.active && selected === lifecycle.current.version) setProcessing(false);
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || processing || !caption.trim() || !location.trim()) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await onAddPost({ caption: caption.trim(), location: location.trim(), ...(image ? { image } : {}) });
      if (lifecycle.current.active) {
        clearImage();
        setCaption("");
        onClose();
      }
    } catch (error) {
      if (lifecycle.current.active) setError(errorText(error));
    } finally {
      if (lifecycle.current.active) setSubmitting(false);
    }
  };
  const keyboard = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.stopPropagation(); close(); }
    if (event.key !== "Tab") return;
    const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled])');
    const first = controls?.[0], last = controls?.[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  return <AnimatedSurface className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xl p-4 flex items-start justify-center">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="community-composer-title" onKeyDown={keyboard}
      className={`relative my-auto w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 backdrop-blur-2xl ${isDarkMode ? "bg-[#061e2c]/95 border-white/20 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}>
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <h3 id="community-composer-title" className="font-extrabold text-lg text-slate-900 dark:text-white">Share Your Concepcion Experience</h3>
        <button type="button" onClick={close} disabled={submitting} aria-label="Close post composer" className="shrink-0 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-slate-500/10 disabled:opacity-50"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={submit} className="space-y-4 text-xs">
        {error && <p role="alert" className="rounded-xl bg-rose-100 p-3 text-rose-900">{error}</p>}
        <div>
          <label htmlFor="community-caption" className="block font-bold mb-1">Caption / Story *</label>
          <textarea id="community-caption" required maxLength={4000} rows={3} value={caption} disabled={submitting} onChange={event => setCaption(event.target.value)} placeholder="Share your island moment…" className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label htmlFor="community-location" className="block font-bold mb-1">Location Tag *</label>
          <input id="community-location" required maxLength={200} type="text" value={location} disabled={submitting} onChange={event => setLocation(event.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500" />
        </div>
        <div className="space-y-2">
          <label htmlFor="community-photo" className="flex items-center gap-2 font-bold"><ImagePlus className="w-4 h-4" aria-hidden="true" />Photo (optional)</label>
          <p id="community-photo-help" className="text-slate-600 dark:text-slate-300 leading-relaxed">Choose one JPEG, PNG or WebP up to 5 MiB. Resized to 1600px and saved at up to 1 MiB. Original photo metadata is removed.</p>
          <input ref={fileInput} id="community-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="community-photo-help" disabled={submitting}
            onChange={event => { const file = event.currentTarget.files?.[0]; if (file) void chooseImage(file); }}
            className="block w-full min-w-0 rounded-xl border border-slate-300 dark:border-white/15 p-2 text-slate-700 dark:text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500 file:px-3 file:py-2 file:font-bold file:text-slate-950" />
          {processing && <div className="flex items-center justify-between gap-2"><p role="status">Preparing image…</p><button type="button" onClick={clearImage} className="min-h-11 px-2 underline">Cancel image</button></div>}
          {image && <div className="rounded-xl border border-slate-300 dark:border-white/15 overflow-hidden">
            <img src={image} alt="Selected photo preview" className="w-full max-h-48 object-contain bg-slate-100 dark:bg-slate-950" />
            <div className="flex items-center justify-between gap-2 p-2"><p className="min-w-0 truncate text-slate-600 dark:text-slate-300">{fileName}</p><button type="button" onClick={clearImage} disabled={submitting} className="shrink-0 min-h-11 px-2 font-bold text-rose-700 dark:text-rose-300 disabled:opacity-50">Remove image</button></div>
            <p className="px-3 pb-3 text-slate-600 dark:text-slate-300">Choose another file above to replace this photo.</p>
          </div>}
        </div>
        <div className="pt-2 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={close} disabled={submitting} className="min-h-11 px-4 rounded-xl font-bold hover:bg-slate-500/10 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={submitting || processing} className="min-h-11 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold disabled:opacity-50 disabled:cursor-wait">{submitting ? "Posting…" : processing ? "Preparing image…" : "Post to Community Stream"}</button>
        </div>
      </form>
    </div>
  </AnimatedSurface>;
}
