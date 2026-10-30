import { toast } from "../toastStore";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  GripVertical,
  MapPin,
  Plus,
  Printer,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useId, useState } from "react";
import {
  Accommodation,
  Attraction,
  FerryRoute,
  ItineraryDay,
  ItineraryItem,
} from "../types";
import { useSavedState } from "../userState";

interface ItineraryPlannerProps {
  attractions: Attraction[];
  ferryRoutes: FerryRoute[];
  accommodations: Accommodation[];
  isDarkMode: boolean;
  onSwapFerry?: (
    affectedDayNumber: number,
    itineraryItemId: string,
    newFerry: FerryRoute,
  ) => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  attractions,
  ferryRoutes,
  isDarkMode,
  onSwapFerry,
}) => {
  const [days, setDays] = useSavedState("itinerary");
  const itineraryId = useId();
  // Trip Duration State (1 to 4 days)
  const [tripDays, setTripDays] = useState<number>(days.length || 3);
  const [selectedArrivalFerryId, setSelectedArrivalFerryId] =
    useState<string>("ferry-1");
  const [selectedDepartureFerryId, setSelectedDepartureFerryId] =
    useState<string>("ferry-2");
  const [selectedAttractionIds, setSelectedAttractionIds] = useState<
    Set<string>
  >(() => {
    // Default pick top popular attractions
    const popular = attractions.filter((a) => a.isPopular).map((a) => a.id);
    return new Set(
      popular.length > 0 ? popular : attractions.slice(0, 5).map((a) => a.id),
    );
  });

  // Itinerary state
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  useEffect(() => {
    if (!copiedNotification) return;
    const timer = window.setTimeout(() => setCopiedNotification(false), 3000);
    return () => window.clearTimeout(timer);
  }, [copiedNotification]);

  // Drag and Drop tracking state
  const [draggedItem, setDraggedItem] = useState<{
    dayNumber: number;
    itemId: string;
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    dayNumber: number;
    index: number;
  } | null>(null);

  // New item modal / quick form
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityTime, setNewActivityTime] = useState("14:00");
  const [newActivityLocation, setNewActivityLocation] =
    useState("Poblacion, Sibale");
  const [newActivityNotes, setNewActivityNotes] = useState("");

  // Ferry options
  const arrivalFerries = useMemo(
    () =>
      ferryRoutes.filter(
        (f) =>
          f.destination.toLowerCase().includes("concepcion") ||
          f.destination.toLowerCase().includes("sibale"),
      ),
    [ferryRoutes],
  );
  const departureFerries = useMemo(
    () =>
      ferryRoutes.filter(
        (f) =>
          f.origin.toLowerCase().includes("concepcion") ||
          f.origin.toLowerCase().includes("sibale"),
      ),
    [ferryRoutes],
  );

  const toggleAttractionSelection = (id: string) => {
    setSelectedAttractionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllAttractions = () => {
    setSelectedAttractionIds(new Set(attractions.map((a) => a.id)));
  };

  const clearSelectedAttractions = () => {
    setSelectedAttractionIds(new Set());
  };

  // Algorithm to auto-generate day-by-day plan
  const handleGenerateItinerary = useCallback(
    (numDays: number = tripDays) => {
      const chosenAttractions = attractions.filter((a) =>
        selectedAttractionIds.has(a.id),
      );
      const arrivalFerry =
        ferryRoutes.find((f) => f.id === selectedArrivalFerryId) ||
        arrivalFerries[0] ||
        ferryRoutes[0];
      const departureFerry =
        ferryRoutes.find((f) => f.id === selectedDepartureFerryId) ||
        departureFerries[0] ||
        ferryRoutes[1];

      const generatedDays: ItineraryDay[] = [];
      const attractionPool = [...chosenAttractions];

      // Time slots helper
      const sunsetSlot = "05:30 PM";

      for (let dayIdx = 1; dayIdx <= numDays; dayIdx++) {
        const dayItems: ItineraryItem[] = [];

        if (dayIdx === 1) {
          // Day 1: Arrival & Orientation
          if (arrivalFerry) {
            dayItems.push({
              id: `item-arr-${itineraryId}-1`,
              title: `Arrive via ${arrivalFerry.boatName}`,
              category: "ferry",
              time: arrivalFerry.departureTime || "08:30 AM",
              duration: "1 hr 45 min crossing",
              location: arrivalFerry.origin + " ➔ " + arrivalFerry.destination,
              notes:
                arrivalFerry.notes ||
                "Boarding at port terminal. Keep ticket and ID ready.",
              isFerry: true,
              ferryId: arrivalFerry.id,
              badge: "Sea Crossing",
              cost: arrivalFerry.fare,
            });
          }

          dayItems.push({
            id: `item-checkin-${itineraryId}-2`,
            title: "Port Registration & Homestay Check-In",
            category: "stay",
            time: "11:00 AM",
            duration: "1 hour",
            location: "Poblacion Port Tourism Desk & Accommodations",
            notes:
              "Pay municipal ecological fee (₱50), arrange habal-habal or tricycle guide.",
            badge: "Check-In",
            cost: "₱50 eco-fee",
          });

          // Add 1-2 afternoon activities
          if (attractionPool.length > 0) {
            const item1 = attractionPool.shift()!;
            dayItems.push({
              id: `item-att-${item1.id}-${itineraryId}`,
              title: item1.name,
              category: item1.category,
              time: "02:00 PM",
              duration: "2 hours",
              location: item1.locationName,
              notes: item1.description,
              image: item1.image,
              attractionId: item1.id,
              cost: item1.entryFee,
              badge: item1.category.toUpperCase(),
            });
          }

          // Sunset activity or town walk
          dayItems.push({
            id: `item-sunset-${itineraryId}-3`,
            title: "Sunset at Poblacion Baywalk & Fresh Seafood Dinner",
            category: "culture",
            time: sunsetSlot,
            duration: "1.5 hours",
            location: "Brgy. Poblacion Bayfront",
            notes:
              "Try fresh grilled tuna, lato (sea grapes), and local Asi delicacies.",
            badge: "Relaxation",
          });
        } else if (dayIdx === numDays) {
          // Final Day: Morning highlight + Departure
          if (attractionPool.length > 0) {
            const morningAttraction = attractionPool.shift()!;
            dayItems.push({
              id: `item-att-${morningAttraction.id}-${itineraryId}`,
              title: morningAttraction.name,
              category: morningAttraction.category,
              time: "06:30 AM",
              duration: "2 hours",
              location: morningAttraction.locationName,
              notes: morningAttraction.description,
              image: morningAttraction.image,
              attractionId: morningAttraction.id,
              cost: morningAttraction.entryFee,
              badge: morningAttraction.category.toUpperCase(),
            });
          }

          dayItems.push({
            id: `item-souvenir-${itineraryId}-4`,
            title: "Local Market Souvenirs & Homestay Check-Out",
            category: "culture",
            time: "09:00 AM",
            duration: "1 hour",
            location: "Public Market & Town Plaza",
            notes:
              "Buy dried fish (tuyo), woven pandan mats, and pack travel bags.",
            badge: "Shopping",
          });

          if (departureFerry) {
            dayItems.push({
              id: `item-dep-${itineraryId}-5`,
              title: `Depart via ${departureFerry.boatName}`,
              category: "ferry",
              time: departureFerry.departureTime || "11:00 AM",
              duration: "Sea voyage home",
              location:
                departureFerry.origin + " ➔ " + departureFerry.destination,
              notes:
                departureFerry.notes ||
                "Arrive at Concepcion Port 30 minutes before departure.",
              isFerry: true,
              ferryId: departureFerry.id,
              badge: "Departure",
              cost: departureFerry.fare,
            });
          }
        } else {
          // Middle Day (Day 2 or Day 3): Full exploration day
          let slotCounter = 0;
          const slots = ["08:00 AM", "11:00 AM", "02:30 PM", "05:00 PM"];

          while (attractionPool.length > 0 && slotCounter < slots.length) {
            const att = attractionPool.shift()!;
            dayItems.push({
              id: `item-att-${att.id}-${itineraryId}-${slotCounter}`,
              title: att.name,
              category: att.category,
              time: slots[slotCounter],
              duration: "2 hours",
              location: att.locationName,
              notes: att.description,
              image: att.image,
              attractionId: att.id,
              cost: att.entryFee,
              badge: att.category.toUpperCase(),
            });
            slotCounter++;
          }

          // If day has fewer than 2 items, add cultural immersive experiences
          if (dayItems.length < 2) {
            dayItems.push({
              id: `item-eco-${itineraryId}-${dayIdx}`,
              title: "Coastal Snorkeling & Coral Garden Discovery",
              category: "beach",
              time: "09:30 AM",
              duration: "2.5 hours",
              location: "East Coast Marine Reserve",
              notes:
                "Rent snorkeling gear from local guide and explore vibrant reef arches.",
              badge: "Snorkeling",
              cost: "₱150 gear rental",
            });
            dayItems.push({
              id: `item-asi-${itineraryId}-${dayIdx}-2`,
              title: "Asi Heritage Walk & Coconut Sugar Making Demo",
              category: "culture",
              time: "03:00 PM",
              duration: "1.5 hours",
              location: "Brgy. Masadya & San Pedro",
              notes:
                "Meet elderly elders sharing indigenous Bantoanon/Asi folklore and crafts.",
              badge: "Culture",
            });
          }
        }

        generatedDays.push({
          dayNumber: dayIdx,
          title:
            dayIdx === 1
              ? "Day 1: Island Arrival & Warm Welcome"
              : dayIdx === numDays
                ? `Day ${dayIdx}: Morning Splendor & Farewell Voyage`
                : `Day ${dayIdx}: Deep Coast & Highland Exploration`,
          items: dayItems,
        });
      }

      setDays(generatedDays);
      setShowConfigDrawer(false);
    },
    [
      tripDays,
      attractions,
      selectedAttractionIds,
      ferryRoutes,
      selectedArrivalFerryId,
      selectedDepartureFerryId,
      arrivalFerries,
      departureFerries,
      setDays,
      itineraryId,
    ],
  );

  useEffect(() => {
    if (!days.length && attractions.length && ferryRoutes.length)
      handleGenerateItinerary(3);
  }, [
    days.length,
    attractions.length,
    ferryRoutes.length,
    handleGenerateItinerary,
  ]);

  // Drag and Drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    dayNumber: number,
    itemId: string,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ dayNumber, itemId }));
    setDraggedItem({ dayNumber, itemId });
  };

  const handleDragOver = (
    e: React.DragEvent,
    dayNumber: number,
    index: number,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (
      !dragOverTarget ||
      dragOverTarget.dayNumber !== dayNumber ||
      dragOverTarget.index !== index
    ) {
      setDragOverTarget({ dayNumber, index });
    }
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetDayNumber: number,
    targetIndex: number,
  ) => {
    e.preventDefault();
    setDragOverTarget(null);

    if (!draggedItem) return;

    const sourceDayNum = draggedItem.dayNumber;
    const itemId = draggedItem.itemId;

    setDays((prevDays) => {
      // Find source item
      const sourceDay = prevDays.find((d) => d.dayNumber === sourceDayNum);
      if (!sourceDay) return prevDays;

      const itemToMove = sourceDay.items.find((i) => i.id === itemId);
      if (!itemToMove) return prevDays;

      return prevDays.map((day) => {
        if (
          day.dayNumber === sourceDayNum &&
          sourceDayNum === targetDayNumber
        ) {
          // Reordering within the exact same day
          const filtered = day.items.filter((i) => i.id !== itemId);
          const adjustedIndex = Math.min(
            Math.max(0, targetIndex),
            filtered.length,
          );
          filtered.splice(adjustedIndex, 0, itemToMove);
          return { ...day, items: filtered };
        } else if (day.dayNumber === sourceDayNum) {
          // Remove from source day
          return { ...day, items: day.items.filter((i) => i.id !== itemId) };
        } else if (day.dayNumber === targetDayNumber) {
          // Insert into target day
          const copy = [...day.items];
          const adjustedIndex = Math.min(Math.max(0, targetIndex), copy.length);
          copy.splice(adjustedIndex, 0, itemToMove);
          return { ...day, items: copy };
        }
        return day;
      });
    });

    setDraggedItem(null);
  };

  // Delete item from itinerary
  const handleDeleteItem = (dayNumber: number, itemId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            items: day.items.filter((i) => i.id !== itemId),
          };
        }
        return day;
      }),
    );
  };

  // Add custom activity
  const handleAddCustomActivity = (dayNumber: number) => {
    if (!newActivityTitle.trim()) return;

    const newItem: ItineraryItem = {
      id: crypto.randomUUID(),
      title: newActivityTitle.trim(),
      category: "custom",
      time: newActivityTime || "12:00 PM",
      duration: "1 hour",
      location: newActivityLocation.trim() || "Sibale Island",
      notes: newActivityNotes.trim() || "Custom planned activity.",
      badge: "CUSTOM",
    };

    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            items: [...day.items, newItem],
          };
        }
        return day;
      }),
    );

    // Reset form
    setNewActivityTitle("");
    setNewActivityNotes("");
    setAddingToDay(null);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Copy text summary to clipboard
  const handleCopySummary = async () => {
    let summary = `🏝️ SIBALE ISLAND TRIP ITINERARY (${days.length} Days)\n\n`;
    days.forEach((day) => {
      summary += `📅 ${day.title.toUpperCase()}\n`;
      day.items.forEach((item, idx) => {
        summary += `  ${idx + 1}. [${item.time}] ${item.title} (${item.location})${item.cost ? ` • ${item.cost}` : ""}\n`;
        if (item.notes) summary += `     Note: ${item.notes}\n`;
      });
      summary += "\n";
    });
    summary += `🚢 Port Hotlines: Concepcion Port Tourism (+63 917 555 0192) • Coast Guard Sub-station (+63 998 123 4567)\n`;
    summary += `Prepared with Tara Sibale! App\n`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedNotification(true);
      toast.success("Itinerary copied to clipboard.");
    } catch {
      toast.error("Unable to copy. Check clipboard permissions and try again.");
    }
  };

  // Calculate quick stats
  const totalStops = days.reduce((acc, d) => acc + d.items.length, 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8 animate-fadeIn">
      {/* Printable Dossier Header (Visible only during window.print) */}
      <div className="hidden print:block p-6 border-b-2 border-slate-900 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-950 uppercase tracking-wider">
              Tara Sibale!
            </h1>
            <p className="text-sm font-semibold text-slate-600">
              Official Travel Itinerary & Island Navigation Pass
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Municipality of Concepcion (Maestro de Campo), Romblon,
              Philippines
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
              {days.length}-DAY EXPEDITION
            </span>
            <p className="text-xs text-slate-500 mt-2">
              Emergency Hotline: +63 917 555 0192
            </p>
          </div>
        </div>
      </div>

      {/* Screen Header & Top Action Toolbar */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Interactive Planner
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {totalStops} Planned Stops across {days.length} Days
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
            Travel Itinerary Builder
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Auto-generate and drag-and-drop activities between days based on
            Sibale ferry arrivals and iconic spots.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowConfigDrawer((prev) => !prev)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
              showConfigDrawer
                ? "bg-teal-600 text-white border-teal-700 shadow-sm"
                : isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm"
            }`}>
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Customize & Auto-Generate</span>
            {showConfigDrawer ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleCopySummary}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-colors ${
              copiedNotification
                ? "bg-emerald-600 text-white border-emerald-700"
                : isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title="Copy Itinerary Text Summary">
            {copiedNotification ? (
              <Check className="w-4 h-4" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {copiedNotification ? "Copied!" : "Share"}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-sm transition-all"
            title="Export Clean Printable PDF / Document">
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Generator & Selection Drawer */}
      {showConfigDrawer && (
        <div
          className={`print:hidden p-6 rounded-2xl border transition-all animate-fadeIn ${
            isDarkMode
              ? "bg-[#0b2d40] border-white/10"
              : "bg-slate-50 border-slate-200"
          }`}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customize Itinerary Generation
              </h2>
            </div>
            <button
              onClick={() => setShowConfigDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trip Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                1. Trip Length
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTripDays(num)}
                    className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                      tripDays === num
                        ? "bg-teal-600 text-white border-teal-700 shadow-sm"
                        : isDarkMode
                          ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}>
                    {num} {num === 1 ? "Day" : "Days"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {tripDays === 1 &&
                  "Express day-trip catching the morning ferry and afternoon return."}
                {tripDays === 2 &&
                  "Weekend escape with one night stay in Poblacion."}
                {tripDays === 3 &&
                  "Recommended! Full island circuit including cliffs and coral reefs."}
                {tripDays === 4 &&
                  "Complete adventure exploring quiet caves, hikes, and all 9 barangays."}
              </p>
            </div>

            {/* Ferry Coordination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                2. Ferry Arrival & Departure
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Arrival Ferry to Sibale:
                  </span>
                  <select
                    value={selectedArrivalFerryId}
                    onChange={(e) => setSelectedArrivalFerryId(e.target.value)}
                    className={`w-full min-h-[40px] px-3 py-1.5 text-xs rounded-xl border font-medium ${
                      isDarkMode
                        ? "bg-slate-800 border-white/10 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}>
                    {arrivalFerries.map((ferry) => (
                      <option key={ferry.id} value={ferry.id}>
                        {ferry.boatName} ({ferry.origin.split(" ")[0]} ➔ Sibale
                        @ {ferry.departureTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Departure Return Boat:
                  </span>
                  <select
                    value={selectedDepartureFerryId}
                    onChange={(e) =>
                      setSelectedDepartureFerryId(e.target.value)
                    }
                    className={`w-full min-h-[40px] px-3 py-1.5 text-xs rounded-xl border font-medium ${
                      isDarkMode
                        ? "bg-slate-800 border-white/10 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}>
                    {departureFerries.map((ferry) => (
                      <option key={ferry.id} value={ferry.id}>
                        {ferry.boatName} (Sibale ➔{" "}
                        {ferry.destination.split(" ")[0]} @{" "}
                        {ferry.departureTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attractions Checklist Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Places to Visit ({selectedAttractionIds.size}/
                  {attractions.length})
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllAttractions}
                    className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline">
                    All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearSelectedAttractions}
                    className="text-[10px] font-bold text-slate-400 hover:underline">
                    Clear
                  </button>
                </div>
              </div>

              <div
                className={`max-h-40 overflow-y-auto rounded-xl p-2 border space-y-1 ${
                  isDarkMode
                    ? "bg-slate-800/80 border-white/10"
                    : "bg-white border-slate-200"
                }`}>
                {attractions.map((att) => {
                  const isChecked = selectedAttractionIds.has(att.id);
                  return (
                    <label
                      key={att.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-500/10 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAttractionSelection(att.id)}
                        className="rounded border-slate-400 text-teal-600 focus:ring-teal-500"
                      />
                      <span
                        className={`truncate flex-1 ${isChecked ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500"}`}>
                        {att.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {att.category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generator Action */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Auto-generation respects boat schedules and groups nearby sights
                smoothly.
              </span>
            </div>
            <button
              onClick={() => handleGenerateItinerary(tripDays)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all">
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate {tripDays}-Day Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Reorder instructions badge for users */}
      <div className="print:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs">
        <GripVertical className="w-4 h-4 shrink-0 text-teal-500" />
        <span>
          <strong>Pro-tip:</strong> Grab the dotted handle{" "}
          <span className="font-mono bg-teal-500/20 px-1 py-0.5 rounded">
            ⋮⋮
          </span>{" "}
          on any card to drag and reorder stops within a day or move activities
          between different days!
        </span>
      </div>

      {/* Day by Day Plan Container */}
      <div className="space-y-8">
        {days.map((day) => {
          const dayItems = day.items;
          const isTargetDay = dragOverTarget?.dayNumber === day.dayNumber;

          return (
            <div
              key={day.dayNumber}
              className={`rounded-2xl border transition-all ${
                isDarkMode
                  ? "bg-slate-900/60 border-white/10 shadow-lg"
                  : "bg-white border-slate-200 shadow-sm"
              }`}>
              {/* Day Section Header */}
              <div
                className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDarkMode
                    ? "border-white/10 bg-slate-800/40"
                    : "border-slate-100 bg-slate-50/70"
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                    {day.dayNumber}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {day.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dayItems.length} activities planned for this day
                    </p>
                  </div>
                </div>

                <div className="print:hidden flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAddingToDay(
                        addingToDay === day.dayNumber ? null : day.dayNumber,
                      );
                      setNewActivityTitle("");
                    }}
                    className={`min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                      addingToDay === day.dayNumber
                        ? "bg-teal-600 text-white border-teal-700"
                        : isDarkMode
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Stop</span>
                  </button>
                </div>
              </div>

              {/* Inline Custom Activity Form */}
              {addingToDay === day.dayNumber && (
                <div className="print:hidden p-4 m-4 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Add New Activity to Day {day.dayNumber}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Early Morning Island Coffee"
                        value={newActivityTitle}
                        onChange={(e) => setNewActivityTitle(e.target.value)}
                        className={`w-full min-h-[38px] px-3 py-1 text-xs rounded-lg border ${
                          isDarkMode
                            ? "bg-slate-800 border-white/10 text-white"
                            : "bg-white border-slate-200"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Time & Location
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={newActivityTime}
                          onChange={(e) => setNewActivityTime(e.target.value)}
                          className={`w-28 min-h-[38px] px-2 py-1 text-xs rounded-lg border ${
                            isDarkMode
                              ? "bg-slate-800 border-white/10 text-white"
                              : "bg-white border-slate-200"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={newActivityLocation}
                          onChange={(e) =>
                            setNewActivityLocation(e.target.value)
                          }
                          className={`flex-1 min-h-[38px] px-2 py-1 text-xs rounded-lg border ${
                            isDarkMode
                              ? "bg-slate-800 border-white/10 text-white"
                              : "bg-white border-slate-200"
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Notes / Reminders
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bring extra cash and dry bag"
                        value={newActivityNotes}
                        onChange={(e) => setNewActivityNotes(e.target.value)}
                        className={`w-full min-h-[38px] px-3 py-1 text-xs rounded-lg border ${
                          isDarkMode
                            ? "bg-slate-800 border-white/10 text-white"
                            : "bg-white border-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setAddingToDay(null)}
                      className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddCustomActivity(day.dayNumber)}
                      className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                      Save Stop
                    </button>
                  </div>
                </div>
              )}

              {/* Day Items List with Drag-and-Drop Dropzones */}
              <div
                className="p-4 sm:p-5 space-y-3 min-h-[120px]"
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dayItems.length === 0) {
                    handleDragOver(e, day.dayNumber, 0);
                  }
                }}
                onDrop={(e) => {
                  if (dayItems.length === 0) {
                    handleDrop(e, day.dayNumber, 0);
                  }
                }}>
                {dayItems.length === 0 ? (
                  <div
                    className={`py-8 text-center border-2 border-dashed rounded-xl ${
                      isTargetDay
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}>
                    <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">
                      No activities scheduled for this day.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Drag an item from another day or click &quot;Add Custom
                      Stop&quot; above.
                    </p>
                  </div>
                ) : (
                  dayItems.map((item, index) => {
                    const isDraggingThis = draggedItem?.itemId === item.id;
                    const isOverSlot =
                      dragOverTarget?.dayNumber === day.dayNumber &&
                      dragOverTarget?.index === index;

                    return (
                      <div key={item.id} className="relative">
                        {/* Drag target indicator line before item */}
                        {isOverSlot && (
                          <div className="h-1.5 w-full bg-teal-500 rounded-full my-1 animate-pulse" />
                        )}

                        <div
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, day.dayNumber, item.id)
                          }
                          onDragOver={(e) =>
                            handleDragOver(e, day.dayNumber, index)
                          }
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day.dayNumber, index)}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 select-none ${
                            isDraggingThis
                              ? "opacity-40 scale-[0.99] border-dashed border-teal-500"
                              : isDarkMode
                                ? "bg-slate-800/80 hover:bg-slate-800 border-white/5"
                                : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                          }`}>
                          {/* Drag Handle */}
                          <div
                            className="print:hidden min-h-[44px] flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-teal-500 transition-colors shrink-0 -ml-1"
                            title="Drag to reorder activity">
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* Image thumbnail if attraction */}
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 rounded-lg object-cover shrink-0 hidden sm:block border border-slate-200 dark:border-slate-700"
                              loading="lazy"
                            />
                          )}

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Category Badge */}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                  item.isFerry
                                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                                    : item.category === "beach"
                                      ? "bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30"
                                      : item.category === "landmark"
                                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                                        : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30"
                                }`}>
                                {item.badge || item.category}
                              </span>

                              {/* Time Tag */}
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-teal-500" />
                                {item.time}
                              </span>

                              {item.cost && (
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  {item.cost}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>

                            {/* Live Maritime Disruption Warning on Ferry Cards */}
                            {(() => {
                              if (!item.isFerry || !item.ferryId) return null;
                              const matchedRoute = ferryRoutes.find(
                                (f) => f.id === item.ferryId,
                              );
                              if (
                                !matchedRoute ||
                                (matchedRoute.status !== "CANCELLED_SEA" &&
                                  matchedRoute.status !== "DELAYED")
                              )
                                return null;

                              const isCancelled =
                                matchedRoute.status === "CANCELLED_SEA";
                              const altRoute = ferryRoutes.find(
                                (f) =>
                                  f.id !== matchedRoute.id &&
                                  (f.status === "ON_TIME" ||
                                    f.status === "SCHEDULED") &&
                                  ((matchedRoute.destination
                                    .toLowerCase()
                                    .includes("concepcion") &&
                                    f.destination
                                      .toLowerCase()
                                      .includes("concepcion")) ||
                                    (matchedRoute.origin
                                      .toLowerCase()
                                      .includes("concepcion") &&
                                      f.origin
                                        .toLowerCase()
                                        .includes("concepcion"))),
                              );

                              return (
                                <div
                                  className={`mt-2 p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                                    isCancelled
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                  }`}>
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <div>
                                      <span className="font-bold">
                                        {isCancelled
                                          ? "Trip Cancelled"
                                          : "Schedule Delayed"}
                                        :
                                      </span>{" "}
                                      <span>
                                        {matchedRoute.advisoryReason ||
                                          "Weather advisory in effect."}
                                      </span>
                                    </div>
                                  </div>

                                  {altRoute && onSwapFerry && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onSwapFerry(
                                          day.dayNumber,
                                          item.id,
                                          altRoute,
                                        )
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 flex items-center gap-1.5 shadow-sm transition-all ${
                                        isCancelled
                                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                                          : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                                      }`}>
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Swap to {altRoute.boatName}</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })()}

                            {item.notes && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 italic">
                                {item.notes}
                              </p>
                            )}
                          </div>

                          {/* Delete Item Button */}
                          <div className="print:hidden shrink-0">
                            <button
                              onClick={() =>
                                handleDeleteItem(day.dayNumber, item.id)
                              }
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Remove activity from day"
                              aria-label={`Remove ${item.title}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Dropzone at the end of the day list to allow dropping as the last item */}
                <div
                  onDragOver={(e) =>
                    handleDragOver(e, day.dayNumber, dayItems.length)
                  }
                  onDrop={(e) => handleDrop(e, day.dayNumber, dayItems.length)}
                  className={`h-4 rounded transition-all ${
                    dragOverTarget?.dayNumber === day.dayNumber &&
                    dragOverTarget?.index === dayItems.length
                      ? "bg-teal-500/20 border-2 border-dashed border-teal-500 h-10 flex items-center justify-center text-teal-500 text-xs font-bold"
                      : ""
                  }`}>
                  {dragOverTarget?.dayNumber === day.dayNumber &&
                    dragOverTarget?.index === dayItems.length && (
                      <span>Drop here at end of Day {day.dayNumber}</span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Useful Island Contact & Packing Tips Footer for Print & Screen */}
      <div
        className={`p-6 rounded-2xl border ${
          isDarkMode
            ? "bg-slate-900/50 border-white/10"
            : "bg-slate-50 border-slate-200"
        }`}>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
          Sibale Island Travel Logistics & Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              🚢 Port Manifest & Boarding
            </h4>
            <p>
              Passenger registration opens 45 mins before boat departure at
              Pinamalayan or Concepcion port terminals. Environmental fee of ₱50
              is payable upon island arrival.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              💵 Cash & Connectivity
            </h4>
            <p>
              Sibale has no bank ATMs. Bring adequate Philippine Peso cash for
              habal-habal rides, seafood, and homestays. Smart LTE is strongest
              in Poblacion and Bachawan.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              📞 Municipal Assistance
            </h4>
            <p>
              Concepcion Police Station: +63 998 598 5849
              <br />
              Rural Health Unit (RHU): +63 917 882 1923
              <br />
              Tourism Desk: +63 917 555 0192
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
