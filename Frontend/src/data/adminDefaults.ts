import { SystemPermissions,VerificationApplicant } from '../types';

export const DEFAULT_SYSTEM_PERMISSIONS: SystemPermissions = {
  enableGroupChat: true,
  enableHomestayBooking: true,
  enableCloudVault: true,
  enablePublicReviews: true,
  enableSocialCommunityStream: true,
  enableAiConcierge: true,
  allowOnlyVerifiedGuidesToMessage: false,
  allowOnlyVerifiedHostsToAcceptBookings: false,
  requireLoginForReviews: true,
  maintenanceMode: false
};

export const INITIAL_VERIFICATION_APPLICANTS: VerificationApplicant[] = [
  {
    id: 'app-host-01',
    userId: 'user-turing',
    fullName: 'Arturo "Mang Turing" Fabregas',
    email: 'turing.homestay@sibale.ph',
    phone: '+63 918 334 9912',
    appliedRole: 'host',
    businessOrTitleName: 'Dampali Sunset Hill Homestay',
    barangay: 'Brgy. San Pedro',
    accreditationNumber: 'MTO-CONC-2026-H04',
    documentType: 'Barangay Business Clearance & DOT Eco-Homestay Inspection Certificate',
    documentSummary: '4 Air-conditioned native rooms, solar backup, verified water filtration, safety fire extinguishers in place.',
    status: 'PENDING',
    submittedAt: '2026-08-18',
    experienceYears: 6,
    maxCapacityOrGuests: 12,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Long-time resident near Dampali Cove. Kitchen serves authentic Asi seafood breakfast.'
  },
  {
    id: 'app-guide-02',
    userId: 'user-corazon',
    fullName: 'Corazon "Ate Cora" Mortel',
    email: 'cora.guiding@sibale.ph',
    phone: '+63 929 556 1289',
    appliedRole: 'guide',
    businessOrTitleName: 'Bantay Dagat & Coral Reef Nature Guide',
    barangay: 'Brgy. Poblacion',
    accreditationNumber: 'DOT-MIMAROPA-TG-8821',
    documentType: 'DOT Regional Tour Guide License & Philippine Coast Guard Water Safety Certification',
    documentSummary: 'Certified Lifesaver, CPR First Aider, Speaks Tagalog, English, and native Asi/Bantoanon dialect.',
    status: 'PENDING',
    submittedAt: '2026-08-19',
    experienceYears: 8,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    notes: 'Lead guide for Mt. Tingarac Summit Trail and Bachawan Coral Snorkeling.'
  },
  {
    id: 'app-guide-03',
    userId: 'user-ronnie',
    fullName: 'Captain Ronnie Festin (Bantay Dagat)',
    email: 'ronnie.guide@sibale.gov.ph',
    phone: '+63 917 882 4511',
    appliedRole: 'guide',
    businessOrTitleName: 'Marine Sanctuary Boat Captain & Dive Guide',
    barangay: 'Brgy. Bachawan',
    accreditationNumber: 'PCG-BFAR-GUIDE-009',
    documentType: 'Philippine Coast Guard Marine Safety & Boat Navigation License',
    documentSummary: '15 years navigating Maestro de Campo waters. Licensed motor banca skipper.',
    status: 'APPROVED',
    submittedAt: '2026-06-10',
    reviewedAt: '2026-06-12',
    experienceYears: 15,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Official guide for sea cave expeditions and turtle observation.'
  },
  {
    id: 'app-host-04',
    userId: 'user-rosita',
    fullName: 'Rosita "Nanay Rose" Alcantara',
    email: 'nanayrose.bachawan@gmail.com',
    phone: '+63 945 119 7780',
    appliedRole: 'host',
    businessOrTitleName: 'Bachawan Beachfront Native Cottage',
    barangay: 'Brgy. Bachawan',
    accreditationNumber: 'MTO-CONC-2026-H01',
    documentType: 'Municipal Mayor\'s Permit & Sanitary Inspection Certificate',
    documentSummary: 'Traditional bamboo & nipa cottages directly in front of the white sand beach.',
    status: 'APPROVED',
    submittedAt: '2026-05-15',
    reviewedAt: '2026-05-16',
    experienceYears: 10,
    maxCapacityOrGuests: 16,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    notes: 'Direct beach access, communal grilling station, hammock lounge.'
  }
];

export const SIBALE_COORDINATE_PRESETS = [
  { name: 'Brgy. Poblacion (Town Center & Port)', lat: 12.9231, lng: 121.7089 },
  { name: 'Brgy. Bachawan (White Sand Beach)', lat: 12.9284, lng: 121.7152 },
  { name: 'Brgy. San Pedro (Dampali Cove)', lat: 12.9351, lng: 121.7220 },
  { name: 'Mt. Tingarac Summit (Central Ridge)', lat: 12.9195, lng: 121.7110 },
  { name: 'Brgy. Sampungan (North Coast Cliffs)', lat: 12.9420, lng: 121.7050 },
  { name: 'Brgy. Dos Hermanas (East Cove)', lat: 12.9120, lng: 121.7280 }
];

export const CURATED_ATTRACTION_IMAGES = [
  { label: 'Tropical Beach Cove', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cliffside Lagoon', url: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Spanish Stone Watchtower', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mountain Summit View', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Coral Reef Snorkeling', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Island Cave & Cliffs', url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&auto=format&fit=crop&q=80' },
  { label: 'Coconut Grove Path', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80' }
];

export const CURATED_ACCOMMODATION_IMAGES = [
  { label: 'Native Bamboo Villa', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80' },
  { label: 'Beachfront Cottage', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cozy Homestay Room', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sunset Ocean View Inn', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80' },
  { label: 'Hillside Eco-Lodge', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80' }
];
