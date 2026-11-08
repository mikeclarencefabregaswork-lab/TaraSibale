import assert from "node:assert/strict";
import { test } from "node:test";
import { generateItinerary, moveItineraryItem, findAlternativeFerry } from "../src/itinerary.ts";
import { FERRY_ROUTES } from "../src/data/concepcionData.ts";
import type { Attraction, FerryRoute, ItineraryDay } from "../src/types.ts";

const arrival: FerryRoute = {
  id: "arrival", origin: "Pinamalayan", destination: "Concepcion", boatName: "Arrival boat",
  departureTime: "08:30 AM", arrivalTime: "10:15 AM", fare: "₱200", frequency: "Daily",
  status: "ON_TIME", notes: "",
};
const departure: FerryRoute = { ...arrival, id: "departure", origin: "Concepcion", destination: "Pinamalayan", boatName: "Return boat", departureTime: "04:00 PM", arrivalTime: "05:45 PM" };
const attractions: Attraction[] = ["beach", "heritage", "viewpoint"].map((id) => ({
  id, name: id, category: "beach", image: "", description: "Visit", rating: 4, reviewCount: 2,
  locationName: "Sibale", lat: 12.9, lng: 121.7, highlights: [], entryFee: "Free", bestTime: "Morning",
}));
function generate(numDays: number) {
  return generateItinerary({ numDays, chosenAttractions: attractions, arrivalFerry: arrival, departureFerry: departure, itineraryId: "test" });
}

test("a one-day itinerary includes arrival and return ferries", () => {
  const days = generate(1);
  assert.equal(days.length, 1);
  assert.deepEqual(days[0].items.filter((item) => item.isFerry).map((item) => item.ferryId), ["arrival", "departure"]);
});

test("a one-day itinerary has no overnight check-in or sunset dinner", () => {
  const items = generate(1)[0].items;
  assert.equal(items.some((item) => item.category === "stay"), false);
  assert.equal(items.some((item) => /check-in|check-out|sunset|dinner/i.test(item.title)), false);
  assert.equal(items.some((item) => item.attractionId === "beach"), true);
});

test("multi-day trips preserve arrival, exploration and farewell activities", () => {
  const days = generate(3);
  assert.deepEqual(days.map((day) => day.dayNumber), [1, 2, 3]);
  assert.deepEqual(days[0].items.map((item) => item.ferryId || item.attractionId || item.badge), ["arrival", "Check-In", "beach", "Relaxation"]);
  assert.deepEqual(days[1].items.map((item) => item.attractionId), ["heritage", "viewpoint"]);
  assert.deepEqual(days[2].items.map((item) => item.ferryId || item.badge), ["Shopping", "departure"]);
  assert.deepEqual(attractions.map((item) => item.id), ["beach", "heritage", "viewpoint"]);
});

function days(): ItineraryDay[] {
  return [{ dayNumber: 1, title: "First day", items: ["A", "B", "C"].map((id) => ({ id, title: id, category: "culture", time: "", duration: "", location: "" })) }, { dayNumber: 2, title: "Second day", items: [] }];
}

test("dropping an earlier activity before a later activity keeps the target after it", () => {
  const original = days();
  assert.deepEqual(moveItineraryItem(original, 1, "A", 1, 2)[0].items.map((item) => item.id), ["B", "A", "C"]);
  assert.deepEqual(original[0].items.map((item) => item.id), ["A", "B", "C"]);
});

test("dropping before itself, backwards, at the end or across days preserves all activities", () => {
  for (const [id, target, expected] of [["B", 1, ["A", "B", "C"]], ["C", 0, ["C", "A", "B"]], ["A", 3, ["B", "C", "A"]]] as const) {
    assert.deepEqual(moveItineraryItem(days(), 1, id, 1, target)[0].items.map((item) => item.id), expected);
  }
  const moved = moveItineraryItem(days(), 1, "A", 2, 0);
  assert.deepEqual(moved.map((day) => day.items.map((item) => item.id)), [["B", "C"], ["A"]]);
});

test("ferry alternatives require both endpoints and a healthy status", () => {
  const disrupted = { ...arrival, status: "CANCELLED_SEA" as const };
  const wrongOrigin = { ...arrival, id: "wrong-origin", origin: "Romblon" };
  const wrongDestination = { ...arrival, id: "wrong-destination", destination: "Romblon" };
  const delayed = { ...arrival, id: "delayed", status: "DELAYED" as const };
  const cancelled = { ...arrival, id: "cancelled", status: "CANCELLED_SEA" as const };
  const boarding = { ...arrival, id: "boarding", status: "BOARDING" as const };
  const valid = { ...arrival, id: "valid", status: "SCHEDULED" as const };
  assert.equal(findAlternativeFerry([disrupted, wrongOrigin, wrongDestination, departure, delayed, cancelled, boarding, valid], disrupted)?.id, "valid");
  assert.equal(findAlternativeFerry([wrongOrigin, wrongDestination, departure, delayed, cancelled, boarding], disrupted), undefined);
  const outbound = { ...departure, status: "DELAYED" as const };
  assert.equal(findAlternativeFerry([{ ...departure, id: "wrong-port", destination: "Romblon" }, departure], outbound)?.id, undefined);
  assert.equal(findAlternativeFerry([{ ...departure, id: "same-route" }], outbound)?.id, "same-route");
});


test("the catalog's early morning return cannot form a same-day trip", () => {
  assert.throws(() => generateItinerary({ numDays: 1, chosenAttractions: attractions, arrivalFerry: FERRY_ROUTES[0], departureFerry: FERRY_ROUTES[1], itineraryId: "catalog" }), /same-day.*30 minutes.*multi-day/i);
});

test("a noon return omits a two-hour visit that cannot fit before boarding", () => {
  const plan = generateItinerary({ numDays: 1, chosenAttractions: attractions, arrivalFerry: arrival, departureFerry: { ...departure, departureTime: "12:00 PM", arrivalTime: "01:45 PM" }, itineraryId: "noon" });
  assert.deepEqual(plan[0].items.map((item) => item.ferryId), ["arrival", "departure"]);
});

test("a viable day trip schedules its visit after arrival and before the boarding buffer", () => {
  assert.equal(generate(1)[0].items.find((item) => item.attractionId)?.time, "10:15 AM");
  const exactFit = generateItinerary({ numDays: 1, chosenAttractions: attractions, arrivalFerry: arrival, departureFerry: { ...departure, departureTime: "12:45 PM", arrivalTime: "02:30 PM" }, itineraryId: "exact" });
  assert.equal(exactFit[0].items.find((item) => item.attractionId)?.time, "10:15 AM");
});

test("day trips reject missing, invalid and overnight ferry times or an insufficient boarding window", () => {
  for (const [inbound, outbound] of [
    [undefined, departure], [arrival, undefined],
    [{ ...arrival, arrivalTime: "" }, departure],
    [{ ...arrival, departureTime: "25:00" }, departure],
    [arrival, { ...departure, arrivalTime: "unknown" }],
    [arrival, { ...departure, departureTime: "00:15 PM" }],
    [{ ...arrival, departureTime: "11:00 PM", arrivalTime: "01:00 AM" }, departure],
    [arrival, { ...departure, departureTime: "11:00 PM", arrivalTime: "01:00 AM" }],
    [arrival, { ...departure, departureTime: "10:15 AM" }],
    [arrival, { ...departure, departureTime: "10:44 AM" }],
  ] as const) {
    assert.throws(() => generateItinerary({ numDays: 1, chosenAttractions: attractions, arrivalFerry: inbound, departureFerry: outbound, itineraryId: "invalid" }), /same-day.*30 minutes.*multi-day/i);
  }
});

test("an early catalog departure checks out before boarding and skips later sightseeing", () => {
  const plan = generateItinerary({ numDays: 2, chosenAttractions: attractions, arrivalFerry: FERRY_ROUTES[0], departureFerry: FERRY_ROUTES[1], itineraryId: "early" });
  assert.deepEqual(plan[1].items.map((item) => [item.title, item.time]), [
    ["Homestay Check-Out & Port Boarding", "04:30 AM"],
    ["Depart via M/B Prince Sibale", "05:30 AM"],
  ]);
  assert.equal(plan[1].items[0].duration, "30 minutes");
});


test("a final-day departure too near midnight rejects rather than inventing a previous-day checkout", () => {
  assert.throws(() => generateItinerary({ numDays: 2, chosenAttractions: attractions, arrivalFerry: arrival, departureFerry: { ...departure, departureTime: "12:30 AM", arrivalTime: "02:15 AM" }, itineraryId: "midnight" }), /later return ferry.*checkout.*boarding/i);
});
