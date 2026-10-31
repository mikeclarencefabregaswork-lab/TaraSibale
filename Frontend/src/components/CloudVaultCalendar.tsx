import { PORTFOLIO_MODE } from "../portfolio";
import { PortfolioCollectionNotice } from "./PortfolioNotice";
import { toast } from "../toastStore";
import {
  Calendar,
  Download,
  ExternalLink,
  Eye,
  FileText,
  HardDrive,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { BookingRecord, TravelDocument } from "../types";
import { UserStateContext, useSavedState } from "../userState";

interface CloudVaultCalendarProps {
  isDarkMode: boolean;
  bookings: BookingRecord[];
}

export const CloudVaultCalendar: React.FC<CloudVaultCalendarProps> = ({
  bookings,
}) => {
  const [documents, setDocuments] = useSavedState("documents");
  const userId = useContext(UserStateContext)?.userId;
  const currentOwner = useRef(userId);
  const mounted = useRef(false);
  const pendingReaders = useRef(new Set<FileReader>());
  useEffect(() => {
    currentOwner.current = userId;
    mounted.current = true;
    const readers = pendingReaders.current;
    return () => {
      mounted.current = false;
      for (const reader of readers) {
        if (reader.readyState === FileReader.LOADING) reader.abort();
      }
      readers.clear();
    };
  }, [userId]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<
    "ticket" | "id" | "permit" | "voucher"
  >("ticket");

  const handleUploadDoc = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a document to save.");
      return;
    }
    if (
      !["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(
        file.type,
      )
    ) {
      setError("Choose a PDF, PNG, JPEG or WebP document.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Choose a document smaller than 1 MB.");
      return;
    }
    if (
      documents.length >= 20 ||
      documents.reduce((sum, doc) => sum + (doc.fileData?.length || 0), 0) +
        Math.ceil((file.size * 4) / 3) >
        4000000
    ) {
      setError(
        "The vault supports 20 files and 4 MB of encoded documents. Remove a file before adding more.",
      );
      return;
    }
    const owner = userId;
    const reader = new FileReader();
    pendingReaders.current.add(reader);
    reader.onloadend = () => pendingReaders.current.delete(reader);
    reader.onload = () => {
      if (!mounted.current || currentOwner.current !== owner) return;
      setDocuments((old) => [
        {
          id: crypto.randomUUID(),
          title: docTitle.trim() || file.name,
          category: docCategory,
          fileData: String(reader.result),
          uploadDate: new Date().toISOString().slice(0, 10),
          size: `${Math.ceil(file.size / 1024)} KB`,
          notes:
            "Saved document; account changes sync automatically when signed in.",
        },
        ...old,
      ]);
      setDocTitle("");
      setFile(null);
    };
    reader.onerror = () => {
      if (mounted.current && currentOwner.current === owner)
        setError("Unable to read this document.");
    };
    reader.readAsDataURL(file);
  };
  const downloadDocument = (doc: TravelDocument) => {
    if (
      !doc.fileData ||
      !/^data:(application\/pdf|image\/(png|jpeg|webp));base64,/.test(
        doc.fileData,
      )
    ) {
      setError("No downloadable file is attached to this record.");
      return;
    }
    const link = document.createElement("a");
    link.href = doc.fileData;
    link.download = doc.title;
    link.click();
    toast.info("Document download started.");
  };

  const generateIcsFile = () => {
    if (!bookings.length) {
      setError("Create a booking before exporting your reservation calendar.");
      return;
    }
    const escapeIcs = (value: string) =>
      value
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/[,;]/g, (character) => "\\" + character);
    const events = bookings.map(
      (booking) =>
        `BEGIN:VEVENT\r\nUID:${booking.id}@tarasibale\r\nDTSTAMP:${new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(
            /\.\d+Z/,
            "Z",
          )}\r\nSUMMARY:${escapeIcs(booking.accommodationName)}\r\nDTSTART;VALUE=DATE:${booking.checkIn.replace(/-/g, "")}\r\nDTEND;VALUE=DATE:${booking.checkOut.replace(/-/g, "")}\r\nEND:VEVENT`,
    );
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TaraSibale//Reservations//EN",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Concepcion_Romblon_Itinerary.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Calendar download started.");
  };

  if (PORTFOLIO_MODE) return <PortfolioCollectionNotice kind="documents" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
            <HardDrive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Offline Document Vault & Calendar Sync
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
          Save PDF and image documents. Signed-in accounts sync to the server;
          guests save on this device.
        </p>
      </div>

      {/* Calendar Sync Section */}
      <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Itinerary Calendar Export
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-bold backdrop-blur-md">
            Google Calendar & iCal Compatible
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed">
          Export your Concepcion trip schedule (boat departures, homestay
          check-ins, and guided tours) to your device calendar for automatic
          synchronization across mobile phones & tablets.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generateIcsFile}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(46,196,182,0.4)] flex items-center gap-2 cursor-pointer transition-all">
            <Download className="w-4 h-4" />
            <span>Download .ics Calendar File</span>
          </button>

          <a
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Concepcion Romblon Island Vacation")}&details=${encodeURIComponent("Ferry to Sibale Island & Bachawan Beach Stay")}&location=${encodeURIComponent("Concepcion, Romblon")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-900 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 font-extrabold text-xs shadow-sm backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all">
            <ExternalLink className="w-4 h-4 text-teal-700 dark:text-teal-300" />
            <span>Create Google Calendar Event</span>
          </a>
        </div>
      </div>

      {/* Document Vault Storage */}
      <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Saved Digital Travel Documents
          </h3>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {documents.length} Saved Documents
          </span>
        </div>

        {/* Upload Form */}
        {error && (
          <p role="alert" className="p-3 rounded-xl bg-rose-100 text-rose-900">
            {error}
          </p>
        )}
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          aria-label="Choose document (up to 1 MB)"
          className="block text-sm"
        />
        <form
          onSubmit={handleUploadDoc}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="Document title (e.g. Ferry Boarding Pass.pdf)"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
          />
          <select
            value={docCategory}
            onChange={(e) => setDocCategory(e.target.value as any)}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-teal-500">
            <option value="ticket">Ferry Ticket Pass</option>
            <option value="voucher">Accommodation Voucher</option>
            <option value="id">Government / Tourist ID</option>
            <option value="permit">Barangay / Health Permit</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl shadow-[0_0_12px_rgba(46,196,182,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Save Document to Vault</span>
          </button>
        </form>

        {/* Documents List */}
        <div className="space-y-3 pt-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                  <FileText className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {doc.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300/80 text-[11px] mt-0.5">
                    Uploaded: {doc.uploadDate} • Size: {doc.size} • Category:{" "}
                    {doc.category.toUpperCase()}
                  </p>
                  {doc.notes && (
                    <p className="text-teal-800 dark:text-teal-300 text-[11px] font-semibold italic mt-0.5">
                      ✓ {doc.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDocument(doc)}
                  className="p-2 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 font-bold cursor-pointer transition-all border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15"
                  title="Download saved document">
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
                  }
                  className="p-2 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30 font-bold border border-rose-500/30 cursor-pointer transition-all"
                  title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
