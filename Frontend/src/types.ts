export type CategoryType = 'all' | 'beach' | 'landmark' | 'culture' | 'viewpoint' | 'sanctuary';

export interface Attraction {
  id: string;
  name: string;
  category: 'beach' | 'landmark' | 'culture' | 'viewpoint' | 'sanctuary';
  image: string;
  gallery?: string[];
  description: string;
  rating: number;
  reviewCount: number;
  locationName: string;
  lat: number;
  lng: number;
  highlights: string[];
  entryFee: string;
  bestTime: string;
  audioGuideText?: string;
  isPopular?: boolean;
  coordinateStatus?: 'mapped' | 'unconfirmed';
  coordinateSource?: string;
  verifiedAt?: string;
  sources?: { title: string; url: string }[];
  photoCredit?: { name: string; url: string; caption: string; usage: 'local-preview' | 'open-license' };
  isArchived?: boolean;
}

export type AvailabilityStatus = 'AVAILABLE' | 'FEW_ROOMS' | 'FULLY_BOOKED' | 'MAINTENANCE';

export interface Accommodation {
  id: string;
  name: string;
  type: 'resort' | 'homestay' | 'cottage' | 'inn';
  image: string;
  gallery?: string[];
  pricePerNight: number | null;
  rating: number;
  reviewCount: number;
  location: string;
  amenities: string[];
  roomTypes: string[];
  maxGuests: number | null;
  contactPhone: string;
  coordinates: { lat: number; lng: number } | null;
  description: string;
  isFeatured?: boolean;
  availabilityStatus?: AvailabilityStatus;
  availableRoomsCount?: number;
  hostName?: string;
  isVerifiedPartner?: boolean;
  bookingMode?: 'online' | 'reference-only';
  evidenceLabel?: string;
  verificationNote?: string;
  verifiedAt?: string;
  sources?: { title: string; url: string }[];
  isArchived?: boolean;
}

export interface Review {
  id: string;
  targetId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
  tags: string[];
}

export interface FerryRoute {
  id: string;
  origin: string;
  destination: string;
  boatName: string;
  departureTime: string;
  arrivalTime: string;
  fare: string;
  frequency: string;
  status: 'SCHEDULED' | 'BOARDING' | 'CANCELLED_SEA' | 'ON_TIME' | 'DELAYED';
  notes: string;
  advisoryReason?: string;
  delayDuration?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isGuide?: boolean;
  locationPin?: { name: string; lat: number; lng: number };
}

export interface WeatherInfo {
  location: string;
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
  waveHeight: string;
  uvIndex: number;
  ferryAdvisory: string;
  emergencyHotline: string;
  lastUpdated: string;
}

export interface TrailWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationMeters?: number;
  description: string;
  type: 'start' | 'viewpoint' | 'rest_stop' | 'water_source' | 'summit' | 'ruins' | 'cave' | 'end';
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  label?: string;
}

export interface HikingTrail {
  id: string;
  name: string;
  category: 'summit' | 'coastal' | 'heritage' | 'eco_forest' | 'cave';
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  difficultyColor: string;
  distanceKm: number;
  elevationGainMeters: number;
  peakElevationMeters: number;
  estimatedDuration: string;
  trailType: 'Loop' | 'Out & Back' | 'Point to Point';
  barangay: string;
  description: string;
  terrainType: string;
  recommendedGuide: boolean;
  waterAvailability: string;
  signalCoverage: 'Good (LTE)' | 'Spotty (3G/2G)' | 'No Signal (Offline GPS Required)';
  safetyAdvisory: string;
  coordinates: [number, number][]; // [lat, lng] points for path polyline
  mapSvgPath?: string; // stylized SVG coords (x, y inside 600x400 map viewBox)
  waypoints: TrailWaypoint[];
  highlights: string[];
  image: string;
  elevationProfile: ElevationPoint[];
  isPopular?: boolean;
}

export interface TravelDocument {
  id: string;
  title: string;
  category: 'ticket' | 'id' | 'permit' | 'voucher';
  fileUrl?: string;
  fileData?: string;
  uploadDate: string;
  size: string;
  notes?: string;
}

export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  commentsCount: number;
  location: string;
  timestamp: string;
  userLiked?: boolean;
}

export interface CultureItem {
  id: string;
  title: string;
  category: 'dish' | 'tradition' | 'phrase' | 'event';
  image?: string;
  description: string;
  detailText: string;
  asiPhrase?: string;
  englishTranslation?: string;
  pronunciation?: string;
  photoCredit?: { name: string; url: string; license: string; licenseUrl: string; caption: string };
  dateLabel?: string;
  evidenceLabel?: string;
  scheduleNote?: string;
  verifiedAt?: string;
  sources?: { title: string; url: string }[];
}

export interface BookingRecord {
  id: string;
  accommodationId: string;
  accommodationName: string;
  guestName: string;
  guestEmail: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  roomType: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignedTo?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  shortName: string;
  email: string;
  role: 'traveler' | 'resident' | 'guide' | 'host' | 'admin';
  avatar?: string;
  initials: string;
  badge: string;
  isVerified: boolean;
  joinedDate?: string;
  phone?: string;
  barangay?: string;
  accreditationNo?: string;
}

export interface VerificationApplicant {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  appliedRole: 'host' | 'guide' | 'resident';
  businessOrTitleName: string;
  barangay: string;
  accreditationNumber?: string;
  documentType: string;
  documentSummary: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  experienceYears?: number;
  maxCapacityOrGuests?: number;
  avatar?: string;
}

export interface SystemPermissions {
  enableGroupChat: boolean;
  enableHomestayBooking: boolean;
  enableCloudVault: boolean;
  enablePublicReviews: boolean;
  enableSocialCommunityStream: boolean;
  enableAiConcierge: boolean;
  allowOnlyVerifiedGuidesToMessage: boolean;
  allowOnlyVerifiedHostsToAcceptBookings: boolean;
  requireLoginForReviews: boolean;
  maintenanceMode: boolean;
}

export type NotificationCategory = 'general' | 'personal';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  type: 'weather' | 'ferry' | 'advisory' | 'booking' | 'chat' | 'vault' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
  priority?: 'high' | 'normal' | 'low';
  senderAvatar?: string;
  badgeText?: string;
}

export interface ItineraryItem {
  id: string;
  title: string;
  category: string;
  time: string;
  duration: string;
  location: string;
  notes?: string;
  image?: string;
  isFerry?: boolean;
  ferryId?: string;
  attractionId?: string;
  cost?: string;
  badge?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  dateLabel?: string;
  items: ItineraryItem[];
}

