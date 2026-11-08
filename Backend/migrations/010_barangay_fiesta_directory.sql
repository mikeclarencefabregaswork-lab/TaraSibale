-- Add barangay coverage only; fiesta dates and patrons remain unconfirmed.
-- Preserve any existing record with the same id, including later local updates.
WITH entries AS (
  SELECT value AS data FROM jsonb_array_elements($barangays$[
  {
    "id": "culture-fiesta-directory-bachawan",
    "title": "Bachawan",
    "category": "fiesta-directory",
    "barangay": "Bachawan",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Bachawan have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-calabasahan",
    "title": "Calabasahan",
    "category": "fiesta-directory",
    "barangay": "Calabasahan",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Calabasahan have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-dalajican",
    "title": "Dalajican",
    "category": "fiesta-directory",
    "barangay": "Dalajican",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Dalajican have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-masadya",
    "title": "Masadya",
    "category": "fiesta-directory",
    "barangay": "Masadya",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Masadya have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-masudsud",
    "title": "Masudsud",
    "category": "fiesta-directory",
    "barangay": "Masudsud",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Masudsud have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-poblacion",
    "title": "Poblacion",
    "category": "fiesta-directory",
    "barangay": "Poblacion",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Poblacion have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-sampong",
    "title": "Sampong",
    "category": "fiesta-directory",
    "barangay": "Sampong",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for Sampong have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-san-pedro",
    "title": "San Pedro",
    "category": "fiesta-directory",
    "barangay": "San Pedro",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for San Pedro have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  },
  {
    "id": "culture-fiesta-directory-san-vicente",
    "title": "San Vicente",
    "category": "fiesta-directory",
    "barangay": "San Vicente",
    "dateLabel": "To be confirmed",
    "patronSaint": null,
    "evidenceLabel": "Barangay name documented · fiesta details unconfirmed",
    "description": "Fiesta date, patron saint and celebration details for San Vicente have not yet been confirmed.",
    "detailText": "Confirm details with the barangay or local chapel before planning a fiesta visit. The source below establishes the barangay name only.",
    "sources": [
      {
        "title": "PSA · Concepcion barangay names only (not fiesta dates)",
        "url": "https://psa.gov.ph/classification/psgc/barangays/1705905000"
      }
    ],
    "verifiedAt": "2026-11-09"
  }
]$barangays$::jsonb)
)
INSERT INTO resources(id, kind, data)
SELECT data->>'id', 'culture', data FROM entries
ON CONFLICT (id) DO NOTHING;
