import { HikingTrail } from "../types";

export const HIKING_TRAILS: HikingTrail[] = [
  {
    id: "trail-tingarac-summit",
    name: "Mount Tingarac Summit Ridge Trail",
    category: "summit",
    difficulty: "Challenging",
    difficultyColor:
      "from-rose-500 to-amber-500 text-rose-300 border-rose-500/40",
    distanceKm: 3.8,
    elevationGainMeters: 342,
    peakElevationMeters: 356,
    estimatedDuration: "2.5 - 3.0 Hours",
    trailType: "Out & Back",
    barangay: "Brgy. San Vicente & Poblacion",
    description:
      "The premier summit climb of Maestro de Campo (Sibale Island). Climbs through dense tropical coconut canopy and endemic wild flora to reach the highest ridge on the island, featuring sweeping 360-degree vistas across Tablas Strait, Mindoro mountain ranges, and Marinduque.",
    terrainType:
      "Forest soil, loose limestone pebbles, steep ridge switchbacks, exposed peak rock slab.",
    recommendedGuide: true,
    waterAvailability:
      "Natural spring at 1.8km mark (boiling/filtering recommended). Carry min 1.5L.",
    signalCoverage: "Spotty (3G/2G)",
    safetyAdvisory:
      "Start before 6:30 AM to avoid midday heat. Wear sturdy trail shoes with ankle support. Use caution near sheer eastern cliff edges at the summit marker.",
    coordinates: [
      [12.9238, 121.7058],
      [12.925, 121.7085],
      [12.9272, 121.712],
      [12.9305, 121.716],
      [12.933, 121.7195],
      [12.9348, 121.7215],
    ],
    mapSvgPath: "M 210 240 Q 240 220 280 200 T 340 170 T 390 145",
    waypoints: [
      {
        id: "wp-tingarac-1",
        name: "Poblacion Trailhead & Registry",
        lat: 12.9238,
        lng: 121.7058,
        elevationMeters: 14,
        description:
          "Sign in with the Barangay Eco-Tourism desk. Walking stick pickup and local guide meeting point.",
        type: "start",
      },
      {
        id: "wp-tingarac-2",
        name: "San Vicente Coconut Ridge",
        lat: 12.9272,
        lng: 121.712,
        elevationMeters: 115,
        description:
          "First plateau offering views back down toward Concepcion Port and colorful anchored fishing bancas.",
        type: "viewpoint",
      },
      {
        id: "wp-tingarac-3",
        name: "Bawa Mountain Spring Rest Stop",
        lat: 12.9305,
        lng: 121.716,
        elevationMeters: 198,
        description:
          "Cool natural mountain spring beneath wild banana palms. Shaded resting benches available.",
        type: "water_source",
      },
      {
        id: "wp-tingarac-4",
        name: "Old WWII Telegraph Post Ruins",
        lat: 12.933,
        lng: 121.7195,
        elevationMeters: 285,
        description:
          "Historical concrete foundation used for coastal surveillance during the 1940s.",
        type: "ruins",
      },
      {
        id: "wp-tingarac-5",
        name: "Mount Tingarac 360° Summit Marker",
        lat: 12.9348,
        lng: 121.7215,
        elevationMeters: 356,
        description:
          "Highest geological point in Sibale. Panoramic marker plate and flag. Spectacular sea and island horizons.",
        type: "summit",
      },
    ],
    highlights: [
      "Highest Summit in Sibale (356m)",
      "360° Tablas Strait & Mindoro Panorama",
      "Wild Orchid & Endemic Bird Watching",
      "WWII Historic Lookout Ruins",
    ],
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    elevationProfile: [
      { distanceKm: 0.0, elevationMeters: 14, label: "Trailhead" },
      { distanceKm: 0.8, elevationMeters: 65 },
      { distanceKm: 1.4, elevationMeters: 115, label: "Ridge" },
      { distanceKm: 2.1, elevationMeters: 198, label: "Spring" },
      { distanceKm: 2.9, elevationMeters: 285, label: "Telegraph" },
      { distanceKm: 3.8, elevationMeters: 356, label: "Summit Peak" },
    ],
    isPopular: true,
  },
  {
    id: "trail-watchtower-heritage",
    name: "Spanish Watchtower (Baluarte) Coastal Heritage Trail",
    category: "heritage",
    difficulty: "Easy",
    difficultyColor:
      "from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/40",
    distanceKm: 2.1,
    elevationGainMeters: 85,
    peakElevationMeters: 92,
    estimatedDuration: "45 - 60 Minutes",
    trailType: "Point to Point",
    barangay: "Brgy. Poblacion & Bachawan",
    description:
      "A gentle cultural walking path connecting the town center plaza with 18th-century Spanish stone fortress ruins perched on coastal limestone bluffs. Beautiful sunset vantage points over turquoise reefs.",
    terrainType:
      "Cobbled village paths, flat shaded dirt track, stone staircase at watchtower ascent.",
    recommendedGuide: false,
    waterAvailability:
      "Multiple sari-sari stores along first kilometer in Poblacion.",
    signalCoverage: "Good (LTE)",
    safetyAdvisory:
      "Comfortable family trail. Stone steps near the watchtower can be slick when wet after rain.",
    coordinates: [
      [12.9238, 121.7058],
      [12.9231, 121.7089],
      [12.9255, 121.7118],
      [12.9284, 121.7152],
    ],
    mapSvgPath: "M 210 240 Q 230 260 270 265 T 330 250",
    waypoints: [
      {
        id: "wp-watchtower-1",
        name: "St. Joseph Church & Town Plaza",
        lat: 12.9238,
        lng: 121.7058,
        elevationMeters: 8,
        description:
          "Start at the historic church courtyard with municipal heritage markers.",
        type: "start",
      },
      {
        id: "wp-watchtower-2",
        name: "Seaside Coconut Bluff Vista",
        lat: 12.9231,
        lng: 121.7089,
        elevationMeters: 45,
        description:
          "Scenic bench looking south towards Banton and Simara islands in the distance.",
        type: "viewpoint",
      },
      {
        id: "wp-watchtower-3",
        name: "18th-Century Baluarte Stone Ruins",
        lat: 12.9255,
        lng: 121.7118,
        elevationMeters: 92,
        description:
          "Coral stone masonry watchtower built to spot pirate galleons in the 1700s.",
        type: "ruins",
      },
      {
        id: "wp-watchtower-4",
        name: "Bachawan White Sands Descent",
        lat: 12.9284,
        lng: 121.7152,
        elevationMeters: 2,
        description:
          "Trail ends directly at the soft white sands of Bachawan Beach for a refreshing swim.",
        type: "end",
      },
    ],
    highlights: [
      "18th-Century Spanish Coral Stone Fort",
      "Beginner & Family Friendly",
      "Scenic Sunset Overlooks",
      "Direct Connection to Bachawan Beach",
    ],
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
    elevationProfile: [
      { distanceKm: 0.0, elevationMeters: 8, label: "Town Plaza" },
      { distanceKm: 0.6, elevationMeters: 45, label: "Bluff" },
      { distanceKm: 1.3, elevationMeters: 92, label: "Watchtower" },
      { distanceKm: 2.1, elevationMeters: 2, label: "Bachawan Beach" },
    ],
    isPopular: true,
  },
  {
    id: "trail-dampali-cove",
    name: "Dampali Cliff & Secret Sea Cave Trek",
    category: "cave",
    difficulty: "Moderate",
    difficultyColor:
      "from-amber-500 to-cyan-500 text-amber-300 border-amber-500/40",
    distanceKm: 2.7,
    elevationGainMeters: 135,
    peakElevationMeters: 140,
    estimatedDuration: "1.5 - 2.0 Hours",
    trailType: "Out & Back",
    barangay: "Brgy. San Pedro",
    description:
      "An adventurous trek leading over dramatic jagged karst limestone bluffs down into hidden sea caves, natural tidal plunge pools, and private coral coves with crystal-clear turquoise waters.",
    terrainType:
      "Sharp coral limestone, bamboo handrail stairs, wave-washed coastal rocks, tidal sandy paths.",
    recommendedGuide: true,
    waterAvailability: "None on trail. Carry at least 1.0L of hydration.",
    signalCoverage: "No Signal (Offline GPS Required)",
    safetyAdvisory:
      "Wear protective footwear against sharp karst rocks. Check tide tables before entering the sea caves (accessible during low-to-mid tide).",
    coordinates: [
      [12.9284, 121.7152],
      [12.931, 121.718],
      [12.9335, 121.7205],
      [12.9351, 121.722],
    ],
    mapSvgPath: "M 330 250 Q 370 230 400 210 T 430 180",
    waypoints: [
      {
        id: "wp-dampali-1",
        name: "Bachawan North Cove Trailhead",
        lat: 12.9284,
        lng: 121.7152,
        elevationMeters: 4,
        description:
          "Trek departs from the northern end of Bachawan beach through coastal screwpine trees.",
        type: "start",
      },
      {
        id: "wp-dampali-2",
        name: "Dampali Karst Overlook & Sea Arch",
        lat: 12.931,
        lng: 121.718,
        elevationMeters: 95,
        description:
          "Breathtaking bird-eye view of natural underwater limestone arches and coral gardens.",
        type: "viewpoint",
      },
      {
        id: "wp-dampali-3",
        name: "Cliffside Bamboo Staircase",
        lat: 12.9335,
        lng: 121.7205,
        elevationMeters: 140,
        description:
          "Steep engineered wooden stairs descending down the limestone amphitheater.",
        type: "rest_stop",
      },
      {
        id: "wp-dampali-4",
        name: "Swallow & Bat Sea Cave Entrance",
        lat: 12.9351,
        lng: 121.722,
        elevationMeters: 3,
        description:
          "Hidden cave chamber where Pacific swiftlets nest. Crystal clear tidal pool at the base.",
        type: "cave",
      },
    ],
    highlights: [
      "Hidden Karst Sea Caves & Natural Arch",
      "Emerald Marine Sanctuary Plunge Pools",
      "Dramatic Ocean Cliff Scenery",
      "Rare Seabird & Bat Habitat",
    ],
    image:
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&auto=format&fit=crop&q=80",
    elevationProfile: [
      { distanceKm: 0.0, elevationMeters: 4, label: "Beach Entry" },
      { distanceKm: 0.9, elevationMeters: 95, label: "Overlook" },
      { distanceKm: 1.8, elevationMeters: 140, label: "Cliff Stairs" },
      { distanceKm: 2.7, elevationMeters: 3, label: "Sea Caves" },
    ],
    isPopular: true,
  },
  {
    id: "trail-masadsad-terrace",
    name: "Masadsad Terraces & Sunrise Ridge Eco-Trail",
    category: "eco_forest",
    difficulty: "Moderate",
    difficultyColor:
      "from-teal-500 to-emerald-600 text-teal-300 border-teal-500/40",
    distanceKm: 3.5,
    elevationGainMeters: 165,
    peakElevationMeters: 180,
    estimatedDuration: "1.5 - 2.0 Hours",
    trailType: "Loop",
    barangay: "Brgy. Masadsad & San Pedro",
    description:
      "A serene pastoral trek traversing traditional stone-walled agricultural terraces, fruit orchards, giant bamboo groves, and panoramic sunrise ridge pavilions over eastern Sibale.",
    terrainType:
      "Soft clay loam, terrace stone bunds, gentle rolling hills with shaded tree tunnels.",
    recommendedGuide: false,
    waterAvailability:
      "Fresh coconut water and spring taps available in Masadsad village.",
    signalCoverage: "Spotty (3G/2G)",
    safetyAdvisory:
      'Please stay on designated terrace paths to preserve local crops. Greet farmers warmly with "Maayong aga" (Good morning).',
    coordinates: [
      [12.92, 121.71],
      [12.922, 121.714],
      [12.9245, 121.718],
      [12.921, 121.715],
      [12.92, 121.71],
    ],
    mapSvgPath: "M 250 280 Q 300 310 360 290 T 320 250 Z",
    waypoints: [
      {
        id: "wp-masadsad-1",
        name: "Masadsad Barangay Eco-Hall",
        lat: 12.92,
        lng: 121.71,
        elevationMeters: 22,
        description:
          "Orientation board for local agricultural history and organic farm practices.",
        type: "start",
      },
      {
        id: "wp-masadsad-2",
        name: "Stone-Walled Upland Terraces",
        lat: 12.922,
        lng: 121.714,
        elevationMeters: 88,
        description:
          "Centuries-old stone irrigation terraces cultivating sweet taro and highland rice.",
        type: "viewpoint",
      },
      {
        id: "wp-masadsad-3",
        name: "Eastern Sunrise Ridge Pavilion",
        lat: 12.9245,
        lng: 121.718,
        elevationMeters: 180,
        description:
          "Highest viewpoint on the loop with 180° views of the Philippine sea sunrise.",
        type: "viewpoint",
      },
      {
        id: "wp-masadsad-4",
        name: "Giant Bamboo Grove Canopy",
        lat: 12.921,
        lng: 121.715,
        elevationMeters: 95,
        description: "Shaded bamboo tunnel with natural wind song acoustics.",
        type: "rest_stop",
      },
    ],
    highlights: [
      "Historic Stone Agricultural Terraces",
      "Spectacular Eastern Sunrise Lookout",
      "Giant Bamboo Grove Canopy",
      "Authentic Rural Farming Heritage",
    ],
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    elevationProfile: [
      { distanceKm: 0.0, elevationMeters: 22, label: "Eco-Hall" },
      { distanceKm: 1.1, elevationMeters: 88, label: "Terraces" },
      { distanceKm: 2.2, elevationMeters: 180, label: "Sunrise Ridge" },
      { distanceKm: 3.5, elevationMeters: 22, label: "Return Loop" },
    ],
  },
  {
    id: "trail-north-cape",
    name: "North Cape Lighthouse & Dos Hermanas Vista Trail",
    category: "coastal",
    difficulty: "Challenging",
    difficultyColor:
      "from-indigo-500 to-purple-600 text-indigo-300 border-indigo-500/40",
    distanceKm: 4.4,
    elevationGainMeters: 215,
    peakElevationMeters: 228,
    estimatedDuration: "2.0 - 2.5 Hours",
    trailType: "Out & Back",
    barangay: "Brgy. Tuburan & North Coast",
    description:
      "Rugged northern headland expedition following windswept savannah ridges to Sibale's automated navigation lighthouse with dramatic cliff vistas overlooking the Dos Hermanas twin islets.",
    terrainType:
      "Grassy windswept ridge, exposed volcanic gravel, coastal cliff edge trails.",
    recommendedGuide: true,
    waterAvailability:
      "No water sources along headland. Carry 2.0L water per hiker.",
    signalCoverage: "No Signal (Offline GPS Required)",
    safetyAdvisory:
      "High sea winds common along the cape. Keep away from edge margins during gusty conditions. Bring sun protection and hat ties.",
    coordinates: [
      [12.93, 121.7],
      [12.935, 121.702],
      [12.942, 121.705],
      [12.948, 121.708],
    ],
    mapSvgPath: "M 210 180 Q 240 130 280 90 T 320 60",
    waypoints: [
      {
        id: "wp-north-1",
        name: "Tuburan Coastal Marker",
        lat: 12.93,
        lng: 121.7,
        elevationMeters: 12,
        description:
          "Coastal trailhead where habal-habal motorcycle road ends.",
        type: "start",
      },
      {
        id: "wp-north-2",
        name: "Windswept Savannah Saddle",
        lat: 12.935,
        lng: 121.702,
        elevationMeters: 120,
        description:
          "Expansive grassy ridge where sea breeze meets mountain updrafts.",
        type: "viewpoint",
      },
      {
        id: "wp-north-3",
        name: "North Cape Solar Lighthouse Beacon",
        lat: 12.942,
        lng: 121.705,
        elevationMeters: 195,
        description:
          "Solar-powered marine beacon guiding international vessels traversing Tablas Strait.",
        type: "summit",
      },
      {
        id: "wp-north-4",
        name: "Dos Hermanas Twin Islets Vista Point",
        lat: 12.948,
        lng: 121.708,
        elevationMeters: 228,
        description:
          "Northmost cliff outlook framing the legendary twin rocky islets rising from deep blue straits.",
        type: "viewpoint",
      },
    ],
    highlights: [
      "Northern Headland Ocean Panorama",
      "Dos Hermanas Twin Islets Birdseye View",
      "Historic & Solar Marine Lighthouse",
      "Wild Coastal Savannah Ecology",
    ],
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    elevationProfile: [
      { distanceKm: 0.0, elevationMeters: 12, label: "Tuburan" },
      { distanceKm: 1.4, elevationMeters: 120, label: "Savannah" },
      { distanceKm: 3.0, elevationMeters: 195, label: "Lighthouse" },
      { distanceKm: 4.4, elevationMeters: 228, label: "Dos Hermanas Vista" },
    ],
  },
  {
    id: "trail-mangrove-spring",
    name: "Apiton Mangrove Boardwalk & Crystal Spring Eco-Walk",
    category: "eco_forest",
    difficulty: "Easy",
    difficultyColor:
      "from-emerald-500 to-cyan-500 text-emerald-300 border-emerald-500/40",
    distanceKm: 1.6,
    elevationGainMeters: 30,
    peakElevationMeters: 35,
    estimatedDuration: "30 - 45 Minutes",
    trailType: "Loop",
    barangay: "Brgy. Apiton",
    description:
      "An educational nature walk traversing elevated bamboo and hardwood boardwalks through protected ancient mangrove forest to a pristine freshwater spring pool emerging from volcanic bedrock.",
    terrainType:
      "Elevated wooden boardwalk, packed forest trail, natural limestone stepping stones.",
    recommendedGuide: false,
    waterAvailability: "Potable freshwater spring pool at destination.",
    signalCoverage: "Good (LTE)",
    safetyAdvisory:
      "Family and senior accessible walk. Watch your step on wooden planks during high tide moisture.",
    coordinates: [
      [12.915, 121.7],
      [12.917, 121.703],
      [12.919, 121.706],
      [12.915, 121.7],
    ],
    mapSvgPath: "M 180 290 Q 210 320 260 310 T 210 270 Z",
    waypoints: [
      {
        id: "wp-mangrove-1",
        name: "Apiton Sanctuary Nature Center",
        lat: 12.915,
        lng: 121.7,
        elevationMeters: 3,
        description: "Eco-registration desk and mangrove seedling nursery.",
        type: "start",
      },
      {
        id: "wp-mangrove-2",
        name: "Ancient Rhizophora Mangrove Canopy Walk",
        lat: 12.917,
        lng: 121.703,
        elevationMeters: 6,
        description:
          "Shaded wooden pathway suspended above tidal channels teeming with mudskippers and fiddler crabs.",
        type: "viewpoint",
      },
      {
        id: "wp-mangrove-3",
        name: "Bukol Cold Spring Pool",
        lat: 12.919,
        lng: 121.706,
        elevationMeters: 35,
        description:
          "Clear freshwater bathing pool shaded by wild ferns and century-old banyan trees.",
        type: "water_source",
      },
    ],
    highlights: [
      "Elevated Bamboo & Hardwood Boardwalk",
      "Ancient Mangrove Marine Nursery",
      "Freshwater Spring Plunge Pool",
      "All-Ages Eco & Bird Watching Trail",
    ],
    image:
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&auto=format&fit=crop&q=80",
    elevationProfile: [
      { distanceKm: 0.0, elevationMeters: 3, label: "Nature Center" },
      { distanceKm: 0.7, elevationMeters: 6, label: "Boardwalk" },
      { distanceKm: 1.2, elevationMeters: 35, label: "Cold Spring" },
      { distanceKm: 1.6, elevationMeters: 3, label: "Return" },
    ],
  },
];
