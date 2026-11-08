import type { CultureItem } from "../types";

// PSA confirms these barangay names, not their fiesta dates or patron saints.
export const BARANGAY_FIESTAS: CultureItem[] = [
  "Bachawan",
  "Calabasahan",
  "Dalajican",
  "Masadya",
  "Masudsud",
  "Poblacion",
  "Sampong",
  "San Pedro",
  "San Vicente",
].map((barangay) => ({
  id: `culture-fiesta-directory-${barangay.toLowerCase().replaceAll(" ", "-")}`,
  title: barangay,
  category: "fiesta-directory",
  barangay,
  dateLabel: "To be confirmed",
  patronSaint: null,
  evidenceLabel: "Barangay name documented · fiesta details unconfirmed",
  description: `Fiesta date, patron saint and celebration details for ${barangay} have not yet been confirmed.`,
  detailText: "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
  sources: [{
    title: "PSA · Concepcion barangay names only (not fiesta dates)",
    url: "https://psa.gov.ph/classification/psgc/barangays/1705905000",
  }],
  verifiedAt: "2026-11-09",
}));
