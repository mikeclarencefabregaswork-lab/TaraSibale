import { AppNotification } from "../types";

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // General Island Notifications
  {
    id: "gen-1",
    category: "general",
    type: "weather",
    title: "PAGASA Marine Weather Bulletin",
    message:
      "Calm to moderate sea conditions across Tablas Strait. Wave height 0.4m–0.8m. Safe for pumpboats and passenger bancas.",
    timestamp: "15 mins ago",
    read: false,
    actionTab: "travel",
    priority: "high",
    badgeText: "PAGASA",
  },
  {
    id: "gen-2",
    category: "general",
    type: "ferry",
    title: "M/B Prince Sibale Daily Schedule",
    message:
      "Daily trip departing Pinamalayan Port at 8:30 AM confirmed on time. Arrive at port terminal by 7:45 AM for manifest inspection.",
    timestamp: "45 mins ago",
    read: false,
    actionTab: "travel",
    priority: "normal",
    badgeText: "Ferry",
  },
  {
    id: "gen-3",
    category: "general",
    type: "advisory",
    title: "MDRRMO & Tourism Office Notice",
    message:
      "Low tide at 1:40 PM today. Optimal window for snorkeling at Sibale Coral Garden & exploring the Spanish Watchtower sandbar.",
    timestamp: "2 hours ago",
    read: true,
    actionTab: "explore",
    priority: "low",
    badgeText: "Eco-Advisory",
  },
  {
    id: "gen-4",
    category: "general",
    type: "vault",
    title: "Heritage Pass Digital Verification",
    message:
      "Offline QR verification now enabled at Concepcion Municipal Hall and Poblacion Tourist Assistance Desk.",
    timestamp: "Yesterday",
    read: true,
    actionTab: "documents",
    priority: "low",
    badgeText: "Registry",
  },

  // Personal Traveler Notifications
  {
    id: "pers-1",
    category: "personal",
    type: "booking",
    title: "Homestay Reservation Confirmed",
    message:
      "Your booking at Sea Breeze Kubo & Homestay (2 Nights) has been confirmed by host Kuya Ronald. Check-in starts at 1:00 PM.",
    timestamp: "10 mins ago",
    read: false,
    actionTab: "stay",
    priority: "high",
    badgeText: "Reservation",
  },
  {
    id: "pers-2",
    category: "personal",
    type: "chat",
    title: "Guide Reply in Travel Group Chat",
    message:
      'Certified Guide Ronald: "The summit trail to Mount Sibale peak is clear and dry today. Bring at least 1.5L of water."',
    timestamp: "35 mins ago",
    read: false,
    actionTab: "group",
    priority: "normal",
    badgeText: "Community Chat",
  },
  {
    id: "pers-3",
    category: "personal",
    type: "vault",
    title: "Offline Island Pass Synced",
    message:
      "Your Sibale QR Traveler Pass and topographic trail map have been successfully cached to your offline device vault.",
    timestamp: "3 hours ago",
    read: true,
    actionTab: "documents",
    priority: "low",
    badgeText: "Offline Vault",
  },
  {
    id: "pers-4",
    category: "personal",
    type: "system",
    title: "Sibale Community Welcome",
    message:
      "Mabuhay! Your traveler account is active. Explore verified homestays, join group chats, and check daily ferry timetables.",
    timestamp: "Yesterday",
    read: true,
    actionTab: "explore",
    priority: "low",
    badgeText: "Account",
  },
];
