import { toast } from "../toastStore";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Attraction } from "../types";
import { AttractionsGridSkeleton } from "./Skeletons";

interface AttractionsSectionProps {
  attractions: Attraction[];
  isDarkMode: boolean;
  onOpenReviewModal: (attractionId: string, name: string) => void;
  searchQuery: string;
  isLoading?: boolean;
}

export const AttractionsSection: React.FC<AttractionsSectionProps> = ({
  attractions,
  isDarkMode,
  onOpenReviewModal,
  searchQuery,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalAttraction, setActiveModalAttraction] =
    useState<Attraction | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const filterDrag = useRef<{ startX: number; scrollLeft: number } | null>(null);
  const didDragFilters = useRef(false);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const [filterScroll, setFilterScroll] = useState({ left: false, right: false });

  useEffect(() => {
    const row = filterRowRef.current;
    if (!row) return;
    const updateScroll = () => {
      const left = row.scrollLeft > 1;
      const right = row.scrollWidth - row.clientWidth - row.scrollLeft > 1;
      setFilterScroll((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right },
      );
    };
    const observer = new ResizeObserver(updateScroll);
    observer.observe(row);
    row.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", updateScroll);
    };
  }, [attractions]);

  const scrollFilters = (direction: number) => {
    const row = filterRowRef.current;
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" });
  };

  const handleFilterPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    didDragFilters.current = false;
    filterDrag.current = null;
    const row = event.currentTarget;
    // Touch keeps native scrolling; mouse previews also support dragging.
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      row.scrollWidth <= row.clientWidth
    ) return;
    filterDrag.current = { startX: event.clientX, scrollLeft: row.scrollLeft };
  };

  const handleFilterPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!filterDrag.current || event.buttons !== 1) return;
    const distance = event.clientX - filterDrag.current.startX;
    if (!didDragFilters.current && Math.abs(distance) < 5) return;
    didDragFilters.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.scrollLeft = filterDrag.current.scrollLeft - distance;
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(
      favorites.includes(id)
        ? "Removed from favorites for this visit."
        : "Added to favorites for this visit.",
    );
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const speakAudioGuide = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info(
        "Audio playback is unavailable in this browser. Read the guide text instead.",
      );
    }
  };

  const filteredAttractions = attractions.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Section Header & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
              <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Beaches & Island Landmarks
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Explore documented beaches, coastal formations, and cultural sites
            on Sibale Island, with source links and photo credits.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="relative min-w-0 max-w-full">
          <div
            ref={filterRowRef}
            className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none sm:flex-wrap max-w-full select-none"
            onPointerDown={handleFilterPointerDown}
            onPointerMove={handleFilterPointerMove}
            onPointerUp={() => {
              filterDrag.current = null;
            }}
            onLostPointerCapture={() => {
              filterDrag.current = null;
            }}
            onPointerCancel={() => {
              filterDrag.current = null;
              didDragFilters.current = false;
            }}
            onPointerLeave={() => {
              if (!didDragFilters.current) filterDrag.current = null;
            }}
            onClickCapture={(event) => {
              if (didDragFilters.current && event.detail > 0) {
                event.preventDefault();
                event.stopPropagation();
              }
              didDragFilters.current = false;
            }}>
            {[
              { id: "all", label: "All Places" },
              { id: "beach", label: "White Beaches 🏖️" },
              { id: "landmark", label: "Island Landmarks 🏛️" },
              { id: "culture", label: "Cultural Sites" },
              { id: "sanctuary", label: "Marine Sanctuaries 🤿" },
              { id: "viewpoint", label: "Summits & Views 🏔️" },
            ]
              .filter(
                (cat) =>
                  cat.id === "all" ||
                  attractions.some((item) => item.category === cat.id),
              )
              .map((cat) => (
                <button
                  key={cat.id}
                  aria-pressed={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)]"
                      : "bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15"
                  }`}>
                  {cat.label}
                </button>
              ))}
          </div>
          {filterScroll.left && (
            <button
              type="button"
              aria-label="Scroll filters left"
              onClick={() => scrollFilters(-1)}
              className="absolute left-0 top-0 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-teal-700 shadow-md cursor-pointer dark:border-white/15 dark:bg-slate-900 dark:text-teal-300">
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          {filterScroll.right && (
            <button
              type="button"
              aria-label="Scroll filters right"
              onClick={() => scrollFilters(1)}
              className="absolute right-0 top-0 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-teal-700 shadow-md cursor-pointer dark:border-white/15 dark:bg-slate-900 dark:text-teal-300">
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Attraction Cards or Skeleton Loading State */}
      {isLoading ? (
        <AttractionsGridSkeleton count={6} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveModalAttraction(item)}
                  className="group rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-500/60 hover:shadow-xl cursor-pointer flex flex-col justify-between text-slate-900 dark:text-white shadow-sm">
                  <div>
                    {/* Image Container */}
                    <div className="relative h-52 overflow-hidden bg-slate-900/40">
                      <img
                        src={item.image}
                        alt={item.image === "/assets/portfolio-placeholder.svg" ? `Portfolio placeholder for ${item.name}; not a destination photo` : item.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          if (
                            !event.currentTarget.src.endsWith(
                              "/assets/photo-unavailable.svg",
                            )
                          )
                            event.currentTarget.src =
                              "/assets/photo-unavailable.svg";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#061e2c]/90 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-teal-500 text-slate-950 shadow-sm">
                          {item.category}
                        </span>
                        {item.isPopular && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" /> Top Pick
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        aria-label={`${isFav ? "Remove" : "Add"} ${item.name} ${isFav ? "from" : "to"} favorites`}
                        aria-pressed={isFav}
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-white hover:text-rose-400 transition-colors cursor-pointer border border-white/10">
                        <Heart
                          className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`}
                        />
                      </button>

                      {/* Rating & Fee overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full font-bold border border-white/10">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                          <span className="text-slate-300 font-normal">
                            ({item.reviewCount})
                          </span>
                        </div>

                        <span className="max-w-[65%] text-right bg-teal-950/80 backdrop-blur-md border border-teal-500/40 text-teal-200 px-2.5 py-1 rounded-2xl font-bold text-[11px]">
                          Fees: {item.entryFee}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      {item.photoCredit && (
                        <a
                          href={item.photoCredit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="block text-[10px] text-slate-500 dark:text-slate-400 underline underline-offset-2">
                          Photo: {item.photoCredit.name}
                        </a>
                      )}
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-300 transition-colors leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="truncate">{item.locationName}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Highlights Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.highlights.slice(0, 3).map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 dark:bg-white/10 dark:text-teal-200 dark:border-white/15 backdrop-blur-sm">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-200 dark:border-white/10 mt-4">
                    <span className="max-w-[60%] text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Hours: {item.bestTime}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalAttraction(item);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-white/10 transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAttractions.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-dashed text-slate-400">
              <Compass className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">No attractions match your search.</p>
              <p className="text-xs mt-1">
                Try clearing filters or searching for "Guiwanon" or
                "Lambirongan".
              </p>
            </div>
          )}
        </>
      )}

      {/* Attraction Full Detail Modal */}
      {activeModalAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div
            className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-8 backdrop-blur-2xl ${
              isDarkMode
                ? "bg-[#061e2c]/90 border-white/20 text-slate-100"
                : "bg-white/95 border-slate-200 text-slate-900"
            }`}>
            {/* Modal Close Button */}
            <button
              onClick={() => {
                setActiveModalAttraction(null);
                if (isPlayingAudio) window.speechSynthesis.cancel();
                setIsPlayingAudio(false);
              }}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 backdrop-blur-md text-white hover:bg-slate-900 border border-white/10 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {/* Modal Hero Image */}
            <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-950">
              <img
                src={activeModalAttraction.image}
                alt={activeModalAttraction.image === "/assets/portfolio-placeholder.svg" ? `Portfolio placeholder for ${activeModalAttraction.name}; not a destination photo` : activeModalAttraction.name}
                referrerPolicy="no-referrer"
                onError={(event) => {
                  if (
                    !event.currentTarget.src.endsWith(
                      "/assets/photo-unavailable.svg",
                    )
                  )
                    event.currentTarget.src = "/assets/photo-unavailable.svg";
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061e2c] via-[#061e2c]/40 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(46,196,182,0.4)]">
                    {activeModalAttraction.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {activeModalAttraction.rating} (
                    {activeModalAttraction.reviewCount} reviews)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  {activeModalAttraction.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>
                    {activeModalAttraction.locationName}
                    {activeModalAttraction.coordinateStatus !== "unconfirmed" &&
                      ` · Mapped location ${activeModalAttraction.lat}°N, ${activeModalAttraction.lng}°E`}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Audio Guide Player Feature */}
              {activeModalAttraction.audioGuideText && (
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-teal-500 text-slate-950 font-bold animate-pulse">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-teal-900 dark:text-teal-300">
                        Interactive Audio Tour Guide
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        Listen to historical and cultural trivia read aloud by
                        your browser.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      speakAudioGuide(
                        activeModalAttraction.audioGuideText || "",
                      )
                    }
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      isPlayingAudio
                        ? "bg-rose-600 text-white"
                        : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)]"
                    }`}>
                    {isPlayingAudio ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span>
                      {isPlayingAudio ? "Stop Narrator" : "Play Audio Guide"}
                    </span>
                  </button>
                </div>
              )}

              {/* Description & Overview */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-widest text-teal-800 dark:text-teal-400 mb-2">
                  About this Destination
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {activeModalAttraction.description}
                </p>
              </div>

              {/* Highlights & Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md space-y-2">
                  <span className="font-bold text-teal-800 dark:text-teal-300 block">
                    Key Highlights
                  </span>
                  <div className="space-y-1">
                    {activeModalAttraction.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md space-y-2">
                  <span className="font-bold text-teal-800 dark:text-teal-300 block">
                    Visitor Essentials
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">
                      Environmental Fee:
                    </strong>{" "}
                    {activeModalAttraction.entryFee}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">
                      Access hours:
                    </strong>{" "}
                    {activeModalAttraction.bestTime}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">
                      Location:
                    </strong>{" "}
                    {activeModalAttraction.coordinateStatus === "unconfirmed"
                      ? "Exact site coordinates need local confirmation; no map pin is shown."
                      : "Map location follows the linked geographic source; confirm local access before visiting."}
                  </p>
                </div>
              </div>

              {activeModalAttraction.sources && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 text-xs space-y-2">
                  <h4 className="font-bold">Sources & photo credit</h4>
                  {activeModalAttraction.photoCredit && (
                    <p>
                      {activeModalAttraction.photoCredit.caption}{" "}
                      <a
                        href={activeModalAttraction.photoCredit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline">
                        Photo source: {activeModalAttraction.photoCredit.name}
                      </a>
                    </p>
                  )}
                  <ul className="space-y-1">
                    {activeModalAttraction.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-teal-700 dark:text-teal-300">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="text-slate-500">
                    Sources checked {activeModalAttraction.verifiedAt}. Fees and
                    access details may change.
                  </p>
                </div>
              )}

              {/* Photo Gallery if present */}
              {activeModalAttraction.gallery &&
                activeModalAttraction.gallery.length > 0 && (
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-teal-800 dark:text-teal-400 mb-2">
                      Scenery Gallery
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {activeModalAttraction.gallery.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Gallery"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            if (
                              !event.currentTarget.src.endsWith(
                                "/assets/photo-unavailable.svg",
                              )
                            )
                              event.currentTarget.src =
                                "/assets/photo-unavailable.svg";
                          }}
                          className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-white/15 hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const id = activeModalAttraction.id;
                    const name = activeModalAttraction.name;
                    setActiveModalAttraction(null);
                    onOpenReviewModal(id, name);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15 flex items-center gap-2 cursor-pointer transition-all">
                  <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Write a Traveler Review</span>
                </button>

                <button
                  onClick={() => {
                    toast.info(
                      `${activeModalAttraction.name} map coordinates: ${activeModalAttraction.lat}, ${activeModalAttraction.lng}.`,
                    );
                  }}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)] flex items-center gap-2 cursor-pointer transition-all">
                  <MapPin className="w-4 h-4" />
                  <span>Get GPS Directions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
