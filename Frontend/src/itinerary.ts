import type { Attraction, FerryRoute, ItineraryDay, ItineraryItem } from "./types";

interface GenerateOptions {
  numDays: number;
  chosenAttractions: Attraction[];
  arrivalFerry?: FerryRoute;
  departureFerry?: FerryRoute;
  itineraryId: string;
}

function ferryTimeMinutes(time: string | undefined): number | undefined {
  const match = time?.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i);
  if (!match) return undefined;
  return (Number(match[1]) % 12) * 60 + Number(match[2]) + (match[3].toUpperCase() === "PM" ? 720 : 0);
}

function clockTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function generateItinerary({ numDays, chosenAttractions, arrivalFerry, departureFerry, itineraryId }: GenerateOptions): ItineraryDay[] {
  let dayTripVisitFits = false;
  if (numDays === 1) {
    const inboundDeparture = ferryTimeMinutes(arrivalFerry?.departureTime);
    const inboundArrival = ferryTimeMinutes(arrivalFerry?.arrivalTime);
    const outboundDeparture = ferryTimeMinutes(departureFerry?.departureTime);
    const outboundArrival = ferryTimeMinutes(departureFerry?.arrivalTime);
    if (
      inboundDeparture === undefined || inboundArrival === undefined ||
      outboundDeparture === undefined || outboundArrival === undefined ||
      inboundArrival <= inboundDeparture || outboundArrival <= outboundDeparture ||
      outboundDeparture - inboundArrival < 30
    ) {
      throw new Error("Choose valid same-day ferries with a return at least 30 minutes after island arrival, or select a multi-day trip. Check the ferry times with the operator.");
    }
    dayTripVisitFits = inboundArrival + 120 + 30 <= outboundDeparture;
  }

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

      if (numDays > 1) {
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
      }

      // Day trips need a full visit plus the return ferry boarding buffer.
      if (attractionPool.length > 0 && (numDays > 1 || dayTripVisitFits)) {
        const item1 = attractionPool.shift()!;
        dayItems.push({
          id: `item-att-${item1.id}-${itineraryId}`,
          title: item1.name,
          category: item1.category,
          time: numDays === 1 ? arrivalFerry!.arrivalTime : "02:00 PM",
          duration: "2 hours",
          location: item1.locationName,
          notes: item1.description,
          image: item1.image,
          attractionId: item1.id,
          cost: item1.entryFee,
          badge: item1.category.toUpperCase(),
        });
      }

      if (numDays > 1) {
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
      }
    } else if (dayIdx === numDays) {
      // Keep sightseeing and checkout ahead of the return ferry boarding window.
      const departureMinutes = ferryTimeMinutes(departureFerry?.departureTime) ?? 660;
      const marketFits = departureMinutes >= 630; // 09:00 + one hour + boarding.
      if (departureMinutes < 60) {
        throw new Error("Choose a later return ferry to allow 30 minutes for checkout and 30 minutes for boarding on the final day.");
      }
      const checkoutMinutes = marketFits ? 540 : departureMinutes - 60;
      if (attractionPool.length > 0 && 390 + 120 <= checkoutMinutes) {
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
        title: marketFits ? "Local Market Souvenirs & Homestay Check-Out" : "Homestay Check-Out & Port Boarding",
        category: "culture",
        time: clockTime(checkoutMinutes),
        duration: marketFits ? "1 hour" : "30 minutes",
        location: marketFits ? "Public Market & Town Plaza" : "Homestay & Concepcion Port",
        notes: marketFits
          ? "Buy dried fish (tuyo), woven pandan mats, and pack travel bags."
          : "Check out and reach the port at least 30 minutes before departure.",
        badge: marketFits ? "Shopping" : "Check-Out",
      });
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

    if (dayIdx === numDays) {
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
    }

    generatedDays.push({
      dayNumber: dayIdx,
      title:
        numDays === 1
          ? "Day 1: Island Day Trip & Farewell Voyage"
          : dayIdx === 1
            ? "Day 1: Island Arrival & Warm Welcome"
            : dayIdx === numDays
              ? `Day ${dayIdx}: Morning Splendor & Farewell Voyage`
              : `Day ${dayIdx}: Deep Coast & Highland Exploration`,
      items: dayItems,
    });
  }

  return generatedDays;
}

export function moveItineraryItem(prevDays: ItineraryDay[], sourceDayNum: number, itemId: string, targetDayNumber: number, targetIndex: number): ItineraryDay[] {
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
      const sourceIndex = day.items.findIndex((item) => item.id === itemId);
      const filtered = day.items.filter((i) => i.id !== itemId);
      const insertionIndex = targetIndex - (sourceIndex < targetIndex ? 1 : 0);
      const adjustedIndex = Math.min(
        Math.max(0, insertionIndex),
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
}

export function findAlternativeFerry(ferryRoutes: FerryRoute[], ferry: FerryRoute): FerryRoute | undefined {
  return ferryRoutes.find((route) =>
    route.id !== ferry.id &&
    route.origin === ferry.origin &&
    route.destination === ferry.destination &&
    (route.status === "ON_TIME" || route.status === "SCHEDULED"),
  );
}
