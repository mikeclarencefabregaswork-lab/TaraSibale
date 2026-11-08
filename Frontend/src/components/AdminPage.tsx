import { AnimatedSurface, SurfacePresence } from "./SurfacePresence";
import { toast } from "../toastStore";
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  Edit2,
  FileText,
  Home,
  Key,
  Lock,
  MapPin,
  MessageSquare,
  Palmtree,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { errorText } from "../api";
import {
  CURATED_ACCOMMODATION_IMAGES,
  CURATED_ATTRACTION_IMAGES,
  DEFAULT_SYSTEM_PERMISSIONS,
  SIBALE_COORDINATE_PRESETS,
} from "../data/adminDefaults";
import {
  Accommodation,
  Attraction,
  SystemPermissions,
  UserProfile,
  VerificationApplicant,
} from "../types";

interface AdminPageProps {
  isDarkMode: boolean;
  currentUser: UserProfile | null;
  attractions: Attraction[];
  onUpdateAttractions: (attractions: Attraction[]) => Promise<void>;
  accommodations: Accommodation[];
  onUpdateAccommodations: (accommodations: Accommodation[]) => Promise<void>;
  verificationApplicants: VerificationApplicant[];
  onUpdateVerificationApplicants: (
    applicants: VerificationApplicant[],
  ) => Promise<void>;
  systemPermissions: SystemPermissions;
  onUpdateSystemPermissions: (permissions: SystemPermissions) => Promise<void>;
  onLoginAsAdmin: () => void;
  setActiveTab: (tab: string) => void;
}

export function AdminPage({
  isDarkMode,
  currentUser,
  attractions,
  onUpdateAttractions,
  accommodations,
  onUpdateAccommodations,
  verificationApplicants,
  onUpdateVerificationApplicants,
  systemPermissions,
  onUpdateSystemPermissions,
  onLoginAsAdmin,
}: AdminPageProps) {
  const [adminSubTab, setAdminSubTab] = useState<
    | "overview"
    | "landmarks"
    | "accommodations"
    | "verifications"
    | "permissions"
  >("overview");

  // Landmark Modal & State
  const [isLandmarkModalOpen, setIsLandmarkModalOpen] = useState(false);
  const [editingLandmarkId, setEditingLandmarkId] = useState<string | null>(
    null,
  );
  const [landmarkSearch, setLandmarkSearch] = useState("");
  const [landmarkCategoryFilter, setLandmarkCategoryFilter] =
    useState<string>("all");

  // Landmark Form fields
  const [lmName, setLmName] = useState("");
  const [lmCategory, setLmCategory] = useState<
    "beach" | "landmark" | "culture" | "viewpoint" | "sanctuary"
  >("landmark");
  const [lmImage, setLmImage] = useState("");
  const [lmDescription, setLmDescription] = useState("");
  const [lmLocation, setLmLocation] = useState("");
  const [lmLat, setLmLat] = useState(12.9231);
  const [lmLng, setLmLng] = useState(121.7089);
  const [lmHighlights, setLmHighlights] = useState<string[]>([]);
  const [lmHighlightInput, setLmHighlightInput] = useState("");
  const [lmEntryFee, setLmEntryFee] = useState("Free Entry");
  const [lmBestTime, setLmBestTime] = useState("8:00 AM - 5:00 PM");
  const [lmAudioGuide, setLmAudioGuide] = useState("");
  const [lmIsPopular, setLmIsPopular] = useState(false);

  // Accommodation Modal & State
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [accSearch, setAccSearch] = useState("");
  const [accTypeFilter, setAccTypeFilter] = useState<string>("all");

  // Accommodation Form fields
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<
    "homestay" | "resort" | "cottage" | "inn"
  >("homestay");
  const [accImage, setAccImage] = useState("");
  const [accPrice, setAccPrice] = useState(1200);
  const [accLocation, setAccLocation] = useState("Brgy. Poblacion, Concepcion");
  const [accPhone, setAccPhone] = useState("+63 917 123 4567");
  const [accMaxGuests, setAccMaxGuests] = useState(4);
  const [accDescription, setAccDescription] = useState("");
  const [accLat, setAccLat] = useState(12.9231);
  const [accLng, setAccLng] = useState(121.7089);
  const [accAmenities, setAccAmenities] = useState<string[]>([
    "WiFi",
    "Solar Backup",
    "Native Breakfast",
  ]);
  const [accRoomTypes, setAccRoomTypes] = useState<string[]>([
    "Standard Fan Room",
    "Aircon Deluxe",
  ]);
  const [accIsFeatured, setAccIsFeatured] = useState(false);

  // Verification filter
  const [verifStatusFilter, setVerifStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [verifRoleFilter, setVerifRoleFilter] = useState<
    "ALL" | "host" | "guide"
  >("ALL");
  const [saving, setSaving] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const showNotification = (msg: string) => toast.success(msg);

  // Check admin rights
  const isAdmin = currentUser?.role === "admin";

  // HANDLERS FOR LANDMARKS
  const openNewLandmarkModal = () => {
    setEditingLandmarkId(null);
    setLmName("");
    setLmCategory("landmark");
    setLmImage(CURATED_ATTRACTION_IMAGES[2].url);
    setLmDescription("");
    setLmLocation("Brgy. Poblacion, Concepcion");
    setLmLat(12.9231);
    setLmLng(121.7089);
    setLmHighlights(["Scenic View", "Heritage Site", "Photo Spot"]);
    setLmEntryFee("Free Entry");
    setLmBestTime("7:00 AM - 5:30 PM");
    setLmAudioGuide("Welcome to this historic spot in Sibale Island...");
    setLmIsPopular(false);
    setIsLandmarkModalOpen(true);
  };

  const openEditLandmarkModal = (landmark: Attraction) => {
    setEditingLandmarkId(landmark.id);
    setLmName(landmark.name);
    setLmCategory(landmark.category);
    setLmImage(landmark.image);
    setLmDescription(landmark.description);
    setLmLocation(landmark.locationName);
    setLmLat(landmark.lat);
    setLmLng(landmark.lng);
    setLmHighlights(landmark.highlights || []);
    setLmEntryFee(landmark.entryFee || "Free Entry");
    setLmBestTime(landmark.bestTime || "8:00 AM - 5:00 PM");
    setLmAudioGuide(landmark.audioGuideText || "");
    setLmIsPopular(landmark.isPopular || false);
    setIsLandmarkModalOpen(true);
  };

  const handleSaveLandmark = async (e: React.FormEvent) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      e.preventDefault();
      if (!lmName.trim()) return;

      if (editingLandmarkId) {
        // Edit existing
        const updated = attractions.map((item) => {
          if (item.id === editingLandmarkId) {
            return {
              ...item,
              name: lmName.trim(),
              category: lmCategory,
              image: lmImage || CURATED_ATTRACTION_IMAGES[0].url,
              description: lmDescription.trim(),
              locationName: lmLocation.trim(),
              lat: lmLat,
              lng: lmLng,
              highlights: lmHighlights,
              entryFee: lmEntryFee,
              bestTime: lmBestTime,
              audioGuideText: lmAudioGuide,
              isPopular: lmIsPopular,
            };
          }
          return item;
        });
        await onUpdateAttractions(updated);
        showNotification(`Updated landmark: "${lmName}"`);
      } else {
        // Create new
        const newLandmark: Attraction = {
          id: `attraction-${Date.now()}`,
          name: lmName.trim(),
          category: lmCategory,
          image: lmImage || CURATED_ATTRACTION_IMAGES[0].url,
          gallery: [lmImage || CURATED_ATTRACTION_IMAGES[0].url],
          description: lmDescription.trim(),
          rating: 0,
          reviewCount: 0,
          locationName: lmLocation.trim(),
          lat: lmLat,
          lng: lmLng,
          highlights:
            lmHighlights.length > 0
              ? lmHighlights
              : ["Scenic Sibale Island", "Eco-Tourism"],
          entryFee: lmEntryFee,
          bestTime: lmBestTime,
          audioGuideText: lmAudioGuide,
          isPopular: lmIsPopular,
        };
        await onUpdateAttractions([newLandmark, ...attractions]);
        showNotification(`Successfully added new landmark: "${lmName}"`);
      }
      setIsLandmarkModalOpen(false);
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLandmark = async (id: string, name: string) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      if (
        window.confirm(
          `Are you sure you want to remove "${name}" from Sibale landmarks registry?`,
        )
      ) {
        const filtered = attractions.filter((a) => a.id !== id);
        await onUpdateAttractions(filtered);
        showNotification(`Removed landmark: "${name}"`);
      }
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleAddHighlightTag = () => {
    if (
      lmHighlightInput.trim() &&
      !lmHighlights.includes(lmHighlightInput.trim())
    ) {
      setLmHighlights([...lmHighlights, lmHighlightInput.trim()]);
      setLmHighlightInput("");
    }
  };

  const handleRemoveHighlightTag = (tag: string) => {
    setLmHighlights(lmHighlights.filter((t) => t !== tag));
  };

  // HANDLERS FOR ACCOMMODATIONS
  const openNewAccModal = () => {
    setEditingAccId(null);
    setAccName("");
    setAccType("homestay");
    setAccImage(CURATED_ACCOMMODATION_IMAGES[0].url);
    setAccPrice(1200);
    setAccLocation("Brgy. Poblacion, Concepcion");
    setAccPhone("+63 917 882 1234");
    setAccMaxGuests(4);
    setAccDescription(
      "Authentic local homestay hosted by native island family with home-cooked seafood breakfast and solar power.",
    );
    setAccLat(12.9231);
    setAccLng(121.7089);
    setAccAmenities([
      "WiFi",
      "Solar Backup",
      "Native Breakfast",
      "Island Tour",
    ]);
    setAccRoomTypes(["Standard Fan Room", "Aircon Family Suite"]);
    setAccIsFeatured(false);
    setIsAccModalOpen(true);
  };

  const openEditAccModal = (acc: Accommodation) => {
    setEditingAccId(acc.id);
    setAccName(acc.name);
    setAccType(acc.type);
    setAccImage(acc.image);
    setAccPrice(acc.pricePerNight ?? 0);
    setAccLocation(acc.location);
    setAccPhone(acc.contactPhone);
    setAccMaxGuests(acc.maxGuests || 4);
    setAccDescription(acc.description);
    setAccLat(acc.coordinates?.lat || 12.9231);
    setAccLng(acc.coordinates?.lng || 121.7089);
    setAccAmenities(acc.amenities || []);
    setAccRoomTypes(acc.roomTypes || ["Standard Room"]);
    setAccIsFeatured(acc.isFeatured || false);
    setIsAccModalOpen(true);
  };

  const handleSaveAccommodation = async (e: React.FormEvent) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      e.preventDefault();
      if (!accName.trim()) return;

      if (editingAccId) {
        const updated = accommodations.map((item) => {
          if (item.id === editingAccId) {
            return {
              ...item,
              name: accName.trim(),
              type: accType,
              image: accImage || CURATED_ACCOMMODATION_IMAGES[0].url,
              pricePerNight:
                item.bookingMode === "reference-only"
                  ? item.pricePerNight
                  : Number(accPrice),
              location: accLocation.trim(),
              contactPhone: accPhone.trim(),
              maxGuests:
                item.bookingMode === "reference-only"
                  ? item.maxGuests
                  : Number(accMaxGuests),
              description: accDescription.trim(),
              coordinates:
                item.bookingMode === "reference-only"
                  ? item.coordinates
                  : { lat: accLat, lng: accLng },
              amenities: accAmenities,
              roomTypes: accRoomTypes,
              isFeatured: accIsFeatured,
            };
          }
          return item;
        });
        await onUpdateAccommodations(updated);
        showNotification(`Updated accommodation: "${accName}"`);
      } else {
        const newAcc: Accommodation = {
          id: `stay-${Date.now()}`,
          name: accName.trim(),
          type: accType,
          image: accImage || CURATED_ACCOMMODATION_IMAGES[0].url,
          gallery: [accImage || CURATED_ACCOMMODATION_IMAGES[0].url],
          pricePerNight: Number(accPrice),
          rating: 0,
          reviewCount: 0,
          location: accLocation.trim(),
          contactPhone: accPhone.trim(),
          maxGuests: Number(accMaxGuests),
          description: accDescription.trim(),
          coordinates: { lat: accLat, lng: accLng },
          amenities: accAmenities,
          roomTypes:
            accRoomTypes.length > 0 ? accRoomTypes : ["Standard Guest Room"],
          isFeatured: accIsFeatured,
        };
        await onUpdateAccommodations([newAcc, ...accommodations]);
        showNotification(
          `Successfully registered new accommodation: "${accName}"`,
        );
      }
      setIsAccModalOpen(false);
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccommodation = async (id: string, name: string) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      if (
        window.confirm(
          `Are you sure you want to remove "${name}" from registered accommodations?`,
        )
      ) {
        const filtered = accommodations.filter((a) => a.id !== id);
        await onUpdateAccommodations(filtered);
        showNotification(`Removed accommodation: "${name}"`);
      }
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (accAmenities.includes(amenity)) {
      setAccAmenities(accAmenities.filter((a) => a !== amenity));
    } else {
      setAccAmenities([...accAmenities, amenity]);
    }
  };

  // HANDLERS FOR VERIFICATIONS
  const handleApproveApplicant = async (applicant: VerificationApplicant) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      const updated = verificationApplicants.map((a) => {
        if (a.id === applicant.id) {
          return {
            ...a,
            status: "APPROVED" as const,
            reviewedAt: new Date().toISOString().split("T")[0],
            notes: a.notes
              ? `${a.notes} (Approved by Tourism Admin)`
              : "Approved by Tourism Admin",
          };
        }
        return a;
      });
      await onUpdateVerificationApplicants(updated);
      showNotification(
        `Approved & Certified ${applicant.appliedRole === "host" ? "Homestay Partner Host" : "Tour Guide"}: ${applicant.fullName}`,
      );
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleRejectApplicant = async (applicant: VerificationApplicant) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      const updated = verificationApplicants.map((a) => {
        if (a.id === applicant.id) {
          return {
            ...a,
            status: "REJECTED" as const,
            reviewedAt: new Date().toISOString().split("T")[0],
            notes:
              "Application marked for document resubmission / inspection review.",
          };
        }
        return a;
      });
      await onUpdateVerificationApplicants(updated);
      showNotification(
        `Updated status to REJECTED / RESUBMIT for ${applicant.fullName}`,
      );
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleRevertToPending = async (applicant: VerificationApplicant) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      const updated = verificationApplicants.map((a) => {
        if (a.id === applicant.id) {
          return {
            ...a,
            status: "PENDING" as const,
            reviewedAt: undefined,
          };
        }
        return a;
      });
      await onUpdateVerificationApplicants(updated);
      showNotification(
        `Application returned to PENDING: ${applicant.fullName}`,
      );
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  // SYSTEM PERMISSIONS TOGGLE
  const togglePermission = async (key: keyof SystemPermissions) => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      const updated = {
        ...systemPermissions,
        [key]: !systemPermissions[key],
      };
      await onUpdateSystemPermissions(updated);
      showNotification(
        `System permission updated: ${key} is now ${updated[key] ? "ENABLED" : "DISABLED"}`,
      );
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    if (saving) return;
    setSaving(true);
    setAdminError(null);
    try {
      await onUpdateSystemPermissions(DEFAULT_SYSTEM_PERMISSIONS);
      showNotification(
        "System permissions reset to default recommended state.",
      );
    } catch (error) {
      setAdminError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  // Filtered lists
  const filteredLandmarks = attractions.filter((a) => {
    const matchesCat =
      landmarkCategoryFilter === "all" || a.category === landmarkCategoryFilter;
    const matchesQuery =
      !landmarkSearch.trim() ||
      a.name.toLowerCase().includes(landmarkSearch.toLowerCase()) ||
      a.locationName.toLowerCase().includes(landmarkSearch.toLowerCase()) ||
      a.description.toLowerCase().includes(landmarkSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredAccommodations = accommodations.filter((a) => {
    const matchesType = accTypeFilter === "all" || a.type === accTypeFilter;
    const matchesQuery =
      !accSearch.trim() ||
      a.name.toLowerCase().includes(accSearch.toLowerCase()) ||
      a.location.toLowerCase().includes(accSearch.toLowerCase()) ||
      a.description.toLowerCase().includes(accSearch.toLowerCase());
    return matchesType && matchesQuery;
  });

  const filteredApplicants = verificationApplicants.filter((app) => {
    const matchesStatus =
      verifStatusFilter === "ALL" || app.status === verifStatusFilter;
    const matchesRole =
      verifRoleFilter === "ALL" || app.appliedRole === verifRoleFilter;
    return matchesStatus && matchesRole;
  });

  const pendingCount = verificationApplicants.filter(
    (a) => a.status === "PENDING",
  ).length;
  const approvedCount = verificationApplicants.filter(
    (a) => a.status === "APPROVED",
  ).length;

  if (!isAdmin)
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 space-y-4">
        <h1 className="font-black text-2xl">Administrator access required</h1>
        <p>Sign in with an administrator account to manage island records.</p>
        <button
          onClick={onLoginAsAdmin}
          className="px-5 py-3 rounded-xl bg-teal-500 text-slate-950 font-bold">
          Sign in
        </button>
      </div>
    );
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {adminError && (
        <div role="alert" className="p-4 bg-rose-100 text-rose-900 rounded-xl">
          {adminError}
        </div>
      )}
      {saving && <p role="status">Saving changes…</p>}

      {/* Admin Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 border border-teal-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                MDRRMO & Tourism Administration Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Concepcion (Sibale Island)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Website & Island Registry Management
            </h1>
            <p className="text-sm text-teal-100/80 max-w-2xl leading-relaxed">
              Curate island landmarks, manage homestays, verify certified tour
              guides and homestay hosts, and control platform access
              permissions.
            </p>
          </div>

          {/* Admin Status Pill / Unlock */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center font-black text-teal-300 border border-teal-400/30 shadow-inner">
                {currentUser?.initials || "A"}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  {currentUser?.name || "Administrator"}
                  <Award className="w-3.5 h-3.5 text-teal-400" />
                </p>
                <p className="text-[11px] text-teal-200">
                  {isAdmin
                    ? "Full Tourism Admin Access"
                    : "Administrator sign-in required"}
                </p>
              </div>
            </div>

            {!isAdmin && (
              <button
                type="button"
                onClick={onLoginAsAdmin}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Sign in as administrator</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 backdrop-blur-md">
        {[
          { id: "overview", label: "Dashboard Overview", icon: Activity },
          {
            id: "landmarks",
            label: `Landmarks (${attractions.length})`,
            icon: Palmtree,
          },
          {
            id: "accommodations",
            label: `Accommodations (${accommodations.length})`,
            icon: Home,
          },
          {
            id: "verifications",
            label: `Host & Guide Verifications (${pendingCount} Pending)`,
            icon: ShieldCheck,
            badge: pendingCount > 0 ? pendingCount : undefined,
          },
          {
            id: "permissions",
            label: "Feature Permissions & Access",
            icon: Settings,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-white dark:bg-[#0b2d40] text-teal-800 dark:text-teal-300 shadow-md border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5"
              }`}>
              <Icon
                className={`w-4 h-4 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`}
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW DASHBOARD SUB-TAB */}
      {/* ========================================================================= */}
      {adminSubTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div
              className={`p-5 rounded-3xl border transition-all ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Landmarks
                </span>
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Palmtree className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {attractions.length}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Attractions Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {attractions.filter((a) => a.category === "beach").length}{" "}
                Beaches,{" "}
                {attractions.filter((a) => a.category === "landmark").length}{" "}
                Historical Sites
              </p>
            </div>

            <div
              className={`p-5 rounded-3xl border transition-all ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Accommodations
                </span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {accommodations.length}
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Homestays & Inns
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {accommodations.filter((a) => a.type === "homestay").length}{" "}
                Native Homestays,{" "}
                {accommodations.filter((a) => a.isFeatured).length} Featured
              </p>
            </div>

            <div
              className={`p-5 rounded-3xl border transition-all ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pending Verifications
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Applications Waiting
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {approvedCount} Certified Partners on Island
              </p>
            </div>

            <div
              className={`p-5 rounded-3xl border transition-all ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  System Health
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  Administrator Session
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {
                  Object.entries(systemPermissions).filter(
                    ([key, enabled]) => key.startsWith("enable") && enabled,
                  ).length
                }{" "}
                features enabled
              </p>
            </div>
          </div>

          {/* Quick Action Station */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Admin Quick Action Station
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct shortcuts to modify island inventory and verify
                    applicants.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={openNewLandmarkModal}
                  className="p-4 rounded-2xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-left transition-all cursor-pointer group flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500 text-white shadow-md group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-teal-950 dark:text-teal-200">
                      Add New Landmark
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Publish beach, mountain summit, ruins or cave to map
                    </p>
                  </div>
                </button>

                <button
                  onClick={openNewAccModal}
                  className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition-all cursor-pointer group flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-md group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                      Add Accommodation
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      List new homestay, resort cottage, or native inn
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setAdminSubTab("verifications")}
                  className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all cursor-pointer group flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                      Review Verifications
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {pendingCount} pending applications awaiting inspection
                      review
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setAdminSubTab("permissions")}
                  className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all cursor-pointer group flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-md group-hover:scale-110 transition-transform">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-purple-950 dark:text-purple-200">
                      Access Matrix
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Configure feature access for guides, hosts, and travelers
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Verification Spotlight */}
            <div
              className={`p-6 rounded-3xl border ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-4`}>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                Latest Partner Queue
              </h3>

              <div className="space-y-3">
                {verificationApplicants.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {app.avatar ? (
                          <img
                            src={app.avatar}
                            alt={app.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          app.fullName[0]
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {app.fullName}
                        </p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate">
                          {app.appliedRole === "host"
                            ? "Homestay Partner Host"
                            : "Tour Guide"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        app.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : app.status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setAdminSubTab("verifications")}
                className="w-full py-2 rounded-xl border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-bold hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                <span>View All Verifications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LANDMARKS & ATTRACTIONS SUB-TAB */}
      {/* ========================================================================= */}
      {adminSubTab === "landmarks" && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={landmarkSearch}
                  onChange={(e) => setLandmarkSearch(e.target.value)}
                  placeholder="Search landmarks by name, barangay, or tag..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border transition-colors focus:outline-none focus:border-teal-500 ${
                    isDarkMode
                      ? "bg-[#0b2d40] border-slate-700 text-white placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm"
                  }`}
                />
              </div>

              <select
                value={landmarkCategoryFilter}
                onChange={(e) => setLandmarkCategoryFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-colors focus:outline-none focus:border-teal-500 cursor-pointer ${
                  isDarkMode
                    ? "bg-[#0b2d40] border-slate-700 text-slate-200"
                    : "bg-white border-slate-300 text-slate-800 shadow-sm"
                }`}>
                <option value="all">All Categories</option>
                <option value="beach">🏖️ Beaches & Coves</option>
                <option value="landmark">🏛️ Heritage Landmarks</option>
                <option value="viewpoint">⛰️ Viewpoints & Summits</option>
                <option value="culture">🏺 Culture & Tradition</option>
                <option value="sanctuary">🐠 Marine Sanctuaries</option>
              </select>
            </div>

            <button
              onClick={openNewLandmarkModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-teal-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Add New Landmark</span>
            </button>
          </div>

          {/* Landmarks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLandmarks.map((landmark) => (
              <div
                key={landmark.id}
                className={`rounded-3xl border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${
                  isDarkMode
                    ? "bg-[#0b2d40] border-slate-800 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900 shadow-sm"
                }`}>
                {/* Photo preview */}
                <div className="relative h-48 w-full overflow-hidden group">
                  <img
                    src={landmark.image}
                    alt={landmark.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {landmark.category}
                    </span>
                    {landmark.isPopular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-base leading-snug drop-shadow-md">
                      {landmark.name}
                    </h3>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{landmark.locationName}</span>
                    </p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {landmark.description}
                  </p>

                  <div className="space-y-2.5">
                    {/* Coordinates & Fees */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700/50">
                      <div>
                        <span className="text-slate-400 block font-semibold">
                          Entry Fee
                        </span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">
                          {landmark.entryFee || "Free"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">
                          Best Hours
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {landmark.bestTime || "Daytime"}
                        </span>
                      </div>
                    </div>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {landmark.highlights?.slice(0, 3).map((h, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditLandmarkModal(landmark)}
                      className="flex-1 py-2 px-3 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteLandmark(landmark.id, landmark.name)
                      }
                      className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete landmark">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACCOMMODATIONS & HOMESTAYS SUB-TAB */}
      {/* ========================================================================= */}
      {adminSubTab === "accommodations" && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  placeholder="Search homestays, resorts, contact..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border transition-colors focus:outline-none focus:border-teal-500 ${
                    isDarkMode
                      ? "bg-[#0b2d40] border-slate-700 text-white placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm"
                  }`}
                />
              </div>

              <select
                value={accTypeFilter}
                onChange={(e) => setAccTypeFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-colors focus:outline-none focus:border-teal-500 cursor-pointer ${
                  isDarkMode
                    ? "bg-[#0b2d40] border-slate-700 text-slate-200"
                    : "bg-white border-slate-300 text-slate-800 shadow-sm"
                }`}>
                <option value="all">All Types</option>
                <option value="homestay">🏡 Native Homestays</option>
                <option value="resort">🌴 Beach Resorts</option>
                <option value="cottage">🛖 Bamboo Cottages</option>
                <option value="inn">🏨 Local Inns</option>
              </select>
            </div>

            <button
              onClick={openNewAccModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-teal-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Add Accommodation</span>
            </button>
          </div>

          {/* Accommodations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccommodations.map((acc) => (
              <div
                key={acc.id}
                className={`rounded-3xl border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${
                  isDarkMode
                    ? "bg-[#0b2d40] border-slate-800 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900 shadow-sm"
                }`}>
                {/* Photo preview */}
                <div className="relative h-48 w-full overflow-hidden group">
                  <img
                    src={acc.image}
                    alt={acc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-900/80 backdrop-blur-md text-indigo-200 border border-indigo-500/40">
                      {acc.type}
                    </span>
                    {acc.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Featured Host
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                    <div>
                      <h3 className="font-extrabold text-base leading-snug drop-shadow-md">
                        {acc.name}
                      </h3>
                      <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span>{acc.location}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-teal-300">
                        {acc.pricePerNight === null
                          ? "Rates unconfirmed"
                          : `₱${acc.pricePerNight}`}
                      </span>
                      <span className="text-[10px] text-slate-300 block">
                        / night
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {acc.description}
                  </p>

                  <div className="space-y-2">
                    {/* Host Contact & Capacity */}
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-semibold">
                          {acc.contactPhone || "Inquire at MDRRMO"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {acc.maxGuests === null
                            ? "Capacity unconfirmed"
                            : `Max ${acc.maxGuests} Guests`}
                        </span>
                      </span>
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {acc.amenities?.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditAccModal(acc)}
                      className="flex-1 py-2 px-3 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Homestay</span>
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteAccommodation(acc.id, acc.name)
                      }
                      className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete accommodation">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PARTNER & GUIDE VERIFICATION DESK SUB-TAB */}
      {/* ========================================================================= */}
      {adminSubTab === "verifications" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Filter bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/40 via-slate-900 to-indigo-900/40 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
                <span>
                  Certified Homestay Host & Tour Guide Verification Station
                </span>
              </h2>
              <p className="text-xs text-teal-200/80 mt-1 max-w-2xl">
                Verify DOT accreditation, Barangay clearances, marine safety
                licenses, and award official verified badges to island partners.
              </p>
            </div>

            {/* Helper buttons to generate demo applicants */}
            <div className="flex flex-wrap items-center gap-2"></div>
          </div>

          {/* Status and Role Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setVerifStatusFilter(status as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    verifStatusFilter === status
                      ? "bg-teal-600 text-white shadow-md"
                      : isDarkMode
                        ? "bg-white/5 border border-slate-700 text-slate-300 hover:bg-white/10"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}>
                  {status === "ALL" ? "All Status" : status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Filter Role:
              </span>
              <select
                value={verifRoleFilter}
                onChange={(e) => setVerifRoleFilter(e.target.value as any)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border ${
                  isDarkMode
                    ? "bg-[#0b2d40] border-slate-700 text-slate-200"
                    : "bg-white border-slate-300 text-slate-800"
                }`}>
                <option value="ALL">All Partner Types</option>
                <option value="host">🏡 Homestay Partner Hosts</option>
                <option value="guide">🧭 Local Certified Tour Guides</option>
              </select>
            </div>
          </div>

          {/* Applicants List */}
          <div className="space-y-4">
            {filteredApplicants.length === 0 ? (
              <div
                className={`p-12 text-center rounded-3xl border ${isDarkMode ? "bg-[#0b2d40] border-slate-800" : "bg-white border-slate-200"}`}>
                <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">
                  No verification applicants match this filter
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Use the quick generator above to create test applicants.
                </p>
              </div>
            ) : (
              filteredApplicants.map((app) => (
                <div
                  key={app.id}
                  className={`p-6 rounded-3xl border transition-all duration-300 ${
                    app.status === "PENDING"
                      ? isDarkMode
                        ? "bg-[#0b2d40] border-amber-500/40 shadow-lg"
                        : "bg-amber-50/40 border-amber-300 shadow-md"
                      : isDarkMode
                        ? "bg-[#0b2d40] border-slate-800"
                        : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Applicant Profile Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                        {app.avatar ? (
                          <img
                            src={app.avatar}
                            alt={app.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          app.fullName[0]
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {app.fullName}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                              app.appliedRole === "host"
                                ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
                                : "bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                            }`}>
                            {app.appliedRole === "host" ? (
                              <Home className="w-3.5 h-3.5" />
                            ) : (
                              <Compass className="w-3.5 h-3.5" />
                            )}
                            {app.appliedRole === "host"
                              ? "Homestay Partner Host"
                              : "Local Certified Tour Guide"}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                              app.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                : app.status === "REJECTED"
                                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Palmtree className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span className="font-semibold">
                              {app.businessOrTitleName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{app.barangay}, Concepcion</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{app.phone}</span>
                          </div>
                        </div>

                        {/* Document Verification Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              {app.documentType}
                            </span>
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                              ID: {app.accreditationNumber || "PENDING-REG"}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                            {app.documentSummary}
                          </p>
                          {app.notes && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium italic pt-1 border-t border-slate-200 dark:border-slate-700">
                              Admin Notes: {app.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                      {app.status !== "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => handleApproveApplicant(app)}
                          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Certify</span>
                        </button>
                      )}

                      {app.status !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => handleRejectApplicant(app)}
                          className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject / Resubmit</span>
                        </button>
                      )}

                      {app.status !== "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleRevertToPending(app)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                          <RefreshCw className="w-3 h-3" />
                          <span>Revert to Pending</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SYSTEM PERMISSIONS & ACCESS CONTROL SUB-TAB */}
      {/* ========================================================================= */}
      {adminSubTab === "permissions" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-teal-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-400" />
                <span>Feature Access & System Permissions Matrix</span>
              </h2>
              <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
                Configure global and role-specific platform toggles. Changes
                take effect across all traveler sessions in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetPermissions}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          {/* Permissions Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "enableGroupChat" as const,
                title: "Island Group Chat & Guide Channel",
                desc: "Allow travelers to exchange live messages, sea condition alerts, and meet other island explorers.",
                icon: MessageSquare,
                color: "teal",
              },
              {
                key: "enableHomestayBooking" as const,
                title: "Direct Homestay Reservation System",
                desc: "Enable booking requests, room type selections, and native lodging schedules.",
                icon: Home,
                color: "indigo",
              },
              {
                key: "enableCloudVault" as const,
                title: "Offline Cloud Vault & Travel Calendar",
                desc: "Allow travelers to store offline boarding passes, itineraries, and environmental permits.",
                icon: Calendar,
                color: "cyan",
              },
              {
                key: "enablePublicReviews" as const,
                title: "Public Landmark & Stay Reviews System",
                desc: "Allow community reviews, photo ratings, and travel tips for Sibale attractions.",
                icon: Sparkles,
                color: "amber",
              },
              {
                key: "enableSocialCommunityStream" as const,
                title: "Social Community Feed & Photo Stream",
                desc: "Allow travelers and residents to publish sunset photos, travel stories, and local highlights.",
                icon: Users,
                color: "purple",
              },
              {
                key: "enableAiConcierge" as const,
                title: "Curated Island Guide",
                desc: "Enable 24/7 intelligent tourist guidance, ferry schedules, and cultural Asi dialect translations.",
                icon: Sparkles,
                color: "emerald",
              },
              {
                key: "allowOnlyVerifiedGuidesToMessage" as const,
                title: "Restrict Broadcast Chat to Certified Guides Only",
                desc: "When enabled, only guides with approved DOT licenses can send official broadcast announcements.",
                icon: ShieldCheck,
                color: "blue",
              },
              {
                key: "allowOnlyVerifiedHostsToAcceptBookings" as const,
                title: "Require Verified Partner Status for Homestay Bookings",
                desc: "Enforces municipal safety standards before homestays can accept reservations.",
                icon: ShieldAlert,
                color: "rose",
              },
              {
                key: "requireLoginForReviews" as const,
                title: "Signed-In Account Required for Reviews",
                desc: "Always enabled. Reviews require a signed-in account.",
                icon: Lock,
                color: "slate",
              },
              {
                key: "maintenanceMode" as const,
                title: "Island-Wide Maintenance Read-Only Mode",
                desc: "Puts all interactive booking and messaging forms into a temporary read-only state.",
                icon: AlertTriangle,
                color: "amber",
              },
            ].map((item) => {
              const Icon = item.icon;
              const isEnabled =
                item.key === "requireLoginForReviews" ||
                systemPermissions[item.key];
              return (
                <div
                  key={item.key}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDarkMode
                      ? "bg-[#0b2d40] border-slate-800"
                      : "bg-white border-slate-200 shadow-sm"
                  } flex items-start justify-between gap-4`}>
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isEnabled
                          ? "bg-teal-500/20 text-teal-600 dark:text-teal-400"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    disabled={saving || item.key === "requireLoginForReviews"}
                    aria-label={item.title}
                    aria-pressed={isEnabled}
                    onClick={() => togglePermission(item.key)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      isEnabled
                        ? "bg-teal-600"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}>
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        isEnabled ? "translate-x-5.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT LANDMARK */}
      {/* ========================================================================= */}
      <SurfacePresence>
      {isLandmarkModalOpen && (
        <AnimatedSurface className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto transition-all ${
              isDarkMode
                ? "bg-[#0b2d40] border-slate-700 text-slate-100"
                : "bg-white border-slate-300 text-slate-900"
            }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Palmtree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    {editingLandmarkId
                      ? "Edit Island Landmark"
                      : "Add New Sibale Landmark"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Specify coordinates, audio narration, and visiting
                    highlights
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLandmarkModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLandmark} className="space-y-4">
              {adminError && (
                <p role="alert" className="text-rose-600">
                  {adminError}
                </p>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Landmark Name *
                </label>
                <input
                  type="text"
                  value={lmName}
                  onChange={(e) => setLmName(e.target.value)}
                  placeholder="e.g. Dampali Sea Arch & Marine Cave"
                  required
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                    isDarkMode
                      ? "bg-white/5 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={lmCategory}
                    onChange={(e) => setLmCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-[#103c50] border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}>
                    <option value="beach">🏖️ Beach & Cove</option>
                    <option value="landmark">
                      🏛️ Heritage Landmark / Ruins
                    </option>
                    <option value="viewpoint">
                      ⛰️ Viewpoint / Summit Trail
                    </option>
                    <option value="culture">
                      🏺 Cultural Heritage & Tradition
                    </option>
                    <option value="sanctuary">
                      🐠 Marine Sanctuary & Reef
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Barangay Location *
                  </label>
                  <input
                    type="text"
                    value={lmLocation}
                    onChange={(e) => setLmLocation(e.target.value)}
                    placeholder="e.g. Brgy. Bachawan, Concepcion"
                    required
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Image URL with Preset Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo Image URL
                </label>
                <input
                  type="url"
                  value={lmImage}
                  onChange={(e) => setLmImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs border ${
                    isDarkMode
                      ? "bg-white/5 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Quick Presets:
                  </span>
                  {CURATED_ATTRACTION_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLmImage(preset.url)}
                      className="px-2 py-1 rounded-lg text-[10px] bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 border border-teal-500/20 cursor-pointer">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={lmDescription}
                  onChange={(e) => setLmDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the natural beauty, history, and what travelers can expect..."
                  required
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                    isDarkMode
                      ? "bg-white/5 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {/* Coordinates with Presets */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    GPS Coordinates (Map Pin)
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    Preset Barangay coordinates
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pb-1">
                  {SIBALE_COORDINATE_PRESETS.map((cp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLmLat(cp.lat);
                        setLmLng(cp.lng);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-teal-500 hover:text-white font-medium cursor-pointer transition-colors">
                      {cp.name.split(" ")[1] || cp.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      Latitude
                    </span>
                    <input
                      type="number"
                      step="0.0001"
                      value={lmLat}
                      onChange={(e) => setLmLat(parseFloat(e.target.value))}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs border ${
                        isDarkMode
                          ? "bg-white/5 border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      Longitude
                    </span>
                    <input
                      type="number"
                      step="0.0001"
                      value={lmLng}
                      onChange={(e) => setLmLng(parseFloat(e.target.value))}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs border ${
                        isDarkMode
                          ? "bg-white/5 border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Entry fee and visiting time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Entry Fee / Eco-Fee
                  </label>
                  <input
                    type="text"
                    value={lmEntryFee}
                    onChange={(e) => setLmEntryFee(e.target.value)}
                    placeholder="e.g. ₱20 Environmental Fee or Free"
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Best Visiting Hours
                  </label>
                  <input
                    type="text"
                    value={lmBestTime}
                    onChange={(e) => setLmBestTime(e.target.value)}
                    placeholder="e.g. 6:00 AM - 5:30 PM (Sunset)"
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Highlights Tag Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Highlights & Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={lmHighlightInput}
                    onChange={(e) => setLmHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlightTag();
                      }
                    }}
                    placeholder="Type a feature and press Enter (e.g. Snorkeling, Sea Turtles)"
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlightTag}
                    className="px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 cursor-pointer">
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lmHighlights.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-teal-500/20 text-teal-800 dark:text-teal-200 flex items-center gap-1 border border-teal-500/30">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlightTag(tag)}
                        className="hover:text-rose-500 cursor-pointer ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Popular toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lmIsPopular}
                    onChange={(e) => setLmIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Mark as Featured / Top Popular Landmark</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLandmarkModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg hover:shadow-teal-500/25 cursor-pointer">
                  {editingLandmarkId
                    ? "Save Landmark Changes"
                    : "Register Landmark to Website"}
                </button>
              </div>
            </form>
          </div>
        </AnimatedSurface>
      )}
      </SurfacePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ACCOMMODATION */}
      {/* ========================================================================= */}
      <SurfacePresence>
      {isAccModalOpen && (
        <AnimatedSurface className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto transition-all ${
              isDarkMode
                ? "bg-[#0b2d40] border-slate-700 text-slate-100"
                : "bg-white border-slate-300 text-slate-900"
            }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    {editingAccId
                      ? "Edit Accommodation"
                      : "Register New Accommodation"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    List homestays, native cottages, and certified lodging hosts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAccModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccommodation} className="space-y-4">
              {adminError && (
                <p role="alert" className="text-rose-600">
                  {adminError}
                </p>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Accommodation / Homestay Name *
                </label>
                <input
                  type="text"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. Dampali Ocean View Native Homestay"
                  required
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                    isDarkMode
                      ? "bg-white/5 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lodging Type *
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-[#103c50] border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}>
                    <option value="homestay">🏡 Native Homestay</option>
                    <option value="resort">🌴 Beach Resort</option>
                    <option value="cottage">🛖 Bamboo Cottage</option>
                    <option value="inn">🏨 Island Inn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price per Night (₱) *
                  </label>
                  <input
                    type="number"
                    value={accPrice}
                    onChange={(e) => setAccPrice(parseInt(e.target.value) || 0)}
                    min={300}
                    step={50}
                    required
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Guest Capacity
                  </label>
                  <input
                    type="number"
                    value={accMaxGuests}
                    onChange={(e) =>
                      setAccMaxGuests(parseInt(e.target.value) || 1)
                    }
                    min={1}
                    max={50}
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Barangay Address *
                  </label>
                  <input
                    type="text"
                    value={accLocation}
                    onChange={(e) => setAccLocation(e.target.value)}
                    placeholder="e.g. Brgy. Bachawan, Concepcion"
                    required
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Host Contact Phone *
                  </label>
                  <input
                    type="text"
                    value={accPhone}
                    onChange={(e) => setAccPhone(e.target.value)}
                    placeholder="+63 917 123 4567"
                    required
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Homestay Photo URL
                </label>
                <input
                  type="url"
                  value={accImage}
                  onChange={(e) => setAccImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs border ${
                    isDarkMode
                      ? "bg-white/5 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Quick Photo Presets:
                  </span>
                  {CURATED_ACCOMMODATION_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAccImage(preset.url)}
                      className="px-2 py-1 rounded-lg text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 cursor-pointer">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Island Host Welcome *
                </label>
                <textarea
                  value={accDescription}
                  onChange={(e) => setAccDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe rooms, sea views, solar power, homemade meals, etc."
                  required
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm border ${
                    isDarkMode
                      ? "bg-white/5 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Included Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    "WiFi",
                    "Solar Backup",
                    "Native Breakfast",
                    "Beachfront View",
                    "Air Conditioning",
                    "Island Tour Service",
                    "Fresh Seafood Meals",
                    "Snorkel Gear",
                    "Motorbike Rental",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        accAmenities.includes(amenity)
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      }`}>
                      <input
                        type="checkbox"
                        checked={accAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded text-indigo-600 cursor-pointer"
                      />
                      <span className="text-[11px] truncate">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Featured toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accIsFeatured}
                    onChange={(e) => setAccIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Mark as Certified Top Featured Homestay</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg cursor-pointer">
                  {editingAccId
                    ? "Save Accommodation Changes"
                    : "Register Lodging to Website"}
                </button>
              </div>
            </form>
          </div>
        </AnimatedSurface>
      )}
      </SurfacePresence>
    </div>
  );
}
