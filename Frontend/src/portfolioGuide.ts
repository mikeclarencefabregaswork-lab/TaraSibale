import { ACCOMMODATIONS, ATTRACTIONS, CULTURE_ITEMS } from "./data/concepcionData";

export interface PortfolioGuideAnswer {
  reply: string;
  sources?: { title: string; url: string }[];
  action?: { tab: "explore" | "guide" | "stay" | "travel" | "itinerary"; label: string };
}

const culture = { tab: "guide", label: "Open Culture" } as const;
const explore = { tab: "explore", label: "Open Explore" } as const;
const stays = { tab: "stay", label: "Open Stays" } as const;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function mentions(question: string, name: string): boolean {
  return ` ${question} `.includes(` ${normalize(name)} `);
}

export function answerPortfolioGuide(input: string): PortfolioGuideAnswer {
  const question = normalize(input);
  if (/\b(ferry|ferries|boat|boats|banca|bangka|sail|sailing|pinamalayan|waves?|weather|tides?|barko|alon|biyahe|byahe|panahon)\b/.test(question)) {
    return {
      reply: "Confirm current sailing times and status with the port and ferry operator. For wind and wave estimates, open Sea conditions on Explore. Check PAGASA advisories and confirm sailing clearance with the local Coast Guard.",
      action: { tab: "travel", label: "Open Ferry & Travel Info" },
      sources: [{ title: "PAGASA gale warnings", url: "https://www.pagasa.dost.gov.ph/marine/gale-warning" }],
    };
  }

  if (/\b(fiesta|fiestas|feast|festival|pista|kapistahan)\b/.test(question)) {
    const barangay = CULTURE_ITEMS.find(item => item.category === "fiesta-directory" && item.barangay && mentions(question, item.barangay));
    if (barangay) {
      return {
        reply: `${barangay.barangay} fiesta date and patron saint are to be confirmed. Ask the barangay or local chapel for details.`,
        sources: barangay.sources,
        action: culture,
      };
    }
    const feast = CULTURE_ITEMS.find(item => item.id === "culture-event-immaculate-conception");
    if (feast) return { reply: `${feast.description} Confirm this year’s program with the parish or municipality.`, sources: feast.sources, action: culture };
  }

  const accommodation = ACCOMMODATIONS.find(item => mentions(question, item.name) || mentions(question, item.name.split(" ")[0]));
  if (accommodation || /\b(stay|stays|lodging|lodge|hotel|homestay|accommodation|accommodations|tutuluyan|matutuluyan)\b/.test(question)) {
    return {
      reply: accommodation
        ? accommodation.description
        : `${ACCOMMODATIONS.map(item => item.name).join(" and ")} appear in a 2019 travel report. Current operation, rates and availability are unconfirmed. Check locally before planning a stay.`,
      sources: accommodation?.sources ?? ACCOMMODATIONS[0]?.sources,
      action: stays,
    };
  }

  const phrase = CULTURE_ITEMS.find(item => item.category === "phrase" && item.asiPhrase &&
    (mentions(question, item.asiPhrase) || (item.englishTranslation && mentions(question, item.englishTranslation))));
  if (phrase || /\b(asi|bantoanon|phrasebook|greetings?|dialect|salita)\b/.test(question)) {
    const entry = phrase ?? CULTURE_ITEMS.find(item => item.id === "culture-phrase-asi-calling-at-a-home");
    if (entry) return {
      reply: `${entry.asiPhrase} means “${entry.englishTranslation}” in the published Bantoanon (Asi) phrasebook. ${entry.detailText} Check current Sibale usage with a local speaker.`,
      sources: entry.sources,
      action: culture,
    };
  }

  const dishes = CULTURE_ITEMS.filter(item => item.category === "dish");
  const dish = dishes.find(item => mentions(question, item.title));
  if (dish) return { reply: `${dish.description} ${dish.detailText}`, sources: dish.sources, action: culture };
  if (/\b(food|foods|dishes|dish|eat|seafood|delicacies|pagkain|tuba)\b/.test(question)) {
    const note = mentions(question, "tuba") ? "I don’t have a sourced entry for tuba. " : "";
    return {
      reply: `${note}Culture documents these foods in Sibale’s local trade: ${dishes.map(item => item.title).join(", ")}. Ask producers about current availability.`,
      sources: dishes[0]?.sources,
      action: culture,
    };
  }

  if (/\b(itinerary|itineraries|day trip|trip plan)\b/.test(question)) {
    return {
      reply: "Start a sample itinerary with a documented beach or landmark, then add time for the town and local food. Confirm access and transport before setting out.",
      action: { tab: "itinerary", label: "Open Itinerary" },
    };
  }
  const attraction = ATTRACTIONS.find(item => mentions(question, item.name) || mentions(question, item.name.split(" ")[0]));
  if (attraction) return { reply: `${attraction.name}: ${attraction.description} Confirm access and any fees locally.`, sources: attraction.sources, action: explore };
  if (/\b(beach|beaches|landmarks?|attractions?|places to visit|pasiyalan)\b/.test(question)) {
    const beaches = ATTRACTIONS.filter(item => item.category === "beach").map(item => item.name);
    return { reply: `Documented beach stops on Sibale include ${beaches.join(", ")}. Explore has descriptions and source links for each stop.`, action: explore };
  }
  return { reply: "I can help with Sibale beaches, landmarks, documented stays, local dishes, Asi phrases, fiestas, ferry information and sample itineraries. Try asking about Guiwanon Beach or the town fiesta." };
}
