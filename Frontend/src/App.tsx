import { SurfacePresence } from "./components/SurfacePresence";
import { readPreference, useTheme } from "./theme";
import { pageSlideDirection } from "./navigation";
import { PORTFOLIO_MODE } from "./portfolio";
import { PortfolioNotice } from "./components/PortfolioNotice";
import { toast } from "./toastStore";
import { ToastViewport } from "./components/ToastViewport";
import { PageSkeleton } from "./components/Skeletons";
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { api, errorText } from "./api";
import { AttractionsSection } from "./components/AttractionsSection";
import { BookingSection } from "./components/BookingSection";
import { BottomNavBar } from "./components/BottomNavBar";
import {
  ActiveFerryAlert,
  FerryAlertBanner,
} from "./components/FerryAlertBanner";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MaritimeSimulatorBar } from "./components/MaritimeSimulatorBar";
import { PullToRefresh } from "./components/PullToRefresh";
import type { CultureItem, HikingTrail } from "./types";
import {
  UserStateContext,
  emptyUserState,
  useGuestState,
  useUserStatePersistence,
  type SavedState,
} from "./userState";

import { DEFAULT_SYSTEM_PERMISSIONS } from "./data/adminDefaults";
import {
  Accommodation,
  AppNotification,
  Attraction,
  BookingRecord,
  FerryRoute,
  GroupMessage,
  Review,
  SocialPost,
  SystemPermissions,
  UserProfile,
  VerificationApplicant,
} from "./types";

const AuthModal = lazy(() => import("./components/AuthModal").then(module => ({ default: module.AuthModal })));
const AuthPage = lazy(() => import("./components/AuthPage").then(module => ({ default: module.AuthPage })));
const LiveChatBot = lazy(() => import("./components/LiveChatBot").then(module => ({ default: module.LiveChatBot })));
const ReviewSystem = lazy(() => import("./components/ReviewSystem").then(module => ({ default: module.ReviewSystem })));
const AdminPage = lazy(() =>
  import("./components/AdminPage").then((module) => ({
    default: module.AdminPage,
  })),
);
const InteractiveMap = lazy(() =>
  import("./components/InteractiveMap").then((module) => ({
    default: module.InteractiveMap,
  })),
);

const CloudVaultCalendar = lazy(() =>
  import("./components/CloudVaultCalendar").then((module) => ({
    default: module.CloudVaultCalendar,
  })),
);

const CulturalGuide = lazy(() =>
  import("./components/CulturalGuide").then((module) => ({
    default: module.CulturalGuide,
  })),
);

const GroupMessaging = lazy(() =>
  import("./components/GroupMessaging").then((module) => ({
    default: module.GroupMessaging,
  })),
);

const ItineraryPlanner = lazy(() =>
  import("./components/ItineraryPlanner").then((module) => ({
    default: module.ItineraryPlanner,
  })),
);

const SocialFeed = lazy(() =>
  import("./components/SocialFeed").then((module) => ({
    default: module.SocialFeed,
  })),
);

const TravelInfoSection = lazy(() =>
  import("./components/TravelInfoSection").then((module) => ({
    default: module.TravelInfoSection,
  })),
);

const VALID_TABS = [
  "explore",
  "itinerary",
  "map",
  "stay",
  "guide",
  "travel",
  "group",
  "documents",
  "social",
  "reviews",
  "admin",
  "auth",
  "login",
  "signup",
];

const getInitialTab = (): string => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash.replace(/^#/, "").toLowerCase();
    if (hash && VALID_TABS.includes(hash)) {
      return hash;
    }
    const saved = readPreference("tara_sibale_active_tab");
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
  }
  return "explore";
};

export default function App() {
  const [navigation, setNavigation] = useState(() => ({
    tab: getInitialTab(),
    direction: 0 as -1 | 0 | 1,
  }));
  const activeTab = navigation.tab;
  const setActiveTab = useCallback((tab: string) => {
    setNavigation(current => current.tab === tab ? current : {
      tab,
      direction: pageSlideDirection(current.tab, tab),
    });
  }, []);
  const { isDarkMode, themePreference, setThemePreference } = useTheme();
  const [isMobileNavVisible, setIsMobileNavVisible] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // App Dynamic Content States (syncable & persistent)
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);

  const [verificationApplicants, setVerificationApplicants] = useState<
    VerificationApplicant[]
  >([]);

  const [systemPermissions, setSystemPermissions] = useState<SystemPermissions>(
    DEFAULT_SYSTEM_PERMISSIONS,
  );

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const currentUserId = useRef<string | undefined>(undefined);
  const authGeneration = useRef(0);
  useEffect(() => {
    currentUserId.current = currentUser?.id;
  }, [currentUser?.id]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "login",
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [ferryRoutes, setFerryRoutes] = useState<FerryRoute[]>([]);

  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // App Notifications State (General & Personal)

  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [guideRequested, setGuideRequested] = useState(false);
  const guideInvoker = useRef<HTMLElement | null>(null);
  const openGuide = () => {
    guideInvoker.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setGuideRequested(true);
    setIsAiChatOpen(true);
  };
  const closeGuide = (restoreFocus = true) => {
    const invoker = guideInvoker.current;
    guideInvoker.current = null;
    setIsAiChatOpen(false);
    if (restoreFocus) requestAnimationFrame(() => {
      if (!guideInvoker.current && invoker?.isConnected) invoker.focus();
    });
  };
  const [preSelectedReviewTarget, setPreSelectedReviewTarget] = useState<
    string | null
  >(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);

  useEffect(() => {
    const online = () => {
      setIsOffline(false);
      toast.info("Connection restored. You can try syncing again.");
    };
    const offline = () => {
      setIsOffline(true);
      toast.info("You are offline. Server actions may be unavailable.");
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const previousTab = useRef(activeTab);
  useEffect(() => {
    const titles: Record<string, string> = {
      itinerary: "Itinerary", map: "Map", stay: "Stays", guide: "Culture", travel: "Travel information",
      group: "Travel groups", documents: "Document vault", social: "Community", reviews: "Reviews",
      admin: "Administration", auth: "Account", login: "Sign in", signup: "Sign up",
    };
    document.title = activeTab === "explore" ? "TaraSibale | Sibale Island Travel Guide"
      : `${titles[activeTab] ?? "Explore"} | TaraSibale`;
    if (previousTab.current === activeTab) return;
    previousTab.current = activeTab;
    const main = document.getElementById("main-content");
    if (!main) return;
    const focusContent = () => {
      const content = main.querySelector(".page-ready");
      if (!content) return false;
      const heading = Array.from(content.querySelectorAll<HTMLElement>("h1, h2, h3"))
        .find(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
      const target = heading ?? main;
      target.tabIndex = -1;
      target.focus();
      return document.activeElement === target;
    };
    const observer = new MutationObserver(() => { if (focusContent()) observer.disconnect(); });
    observer.observe(main, { childList: true, subtree: true });
    if (focusContent()) observer.disconnect();
    return () => observer.disconnect();
  }, [activeTab]);

  // Synchronize activeTab with URL hash and localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tara_sibale_active_tab", activeTab);
    } catch {
      // ignore
    }

    if (typeof window !== "undefined") {
      const currentHash = window.location.hash.replace(/^#/, "");
      if (currentHash !== activeTab) {
        window.location.hash = activeTab;
      }
    }
  }, [activeTab]);

  // Listen for browser back / forward navigation (hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "").toLowerCase();
      if (hash && VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveTab]);

  const [hikingTrails, setHikingTrails] = useState<HikingTrail[]>([]);
  const catalogGeneration = useRef(0);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [savedState, setSavedState] = useGuestState();
  const [stateReady, setStateReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dismissedFerryAlert, setDismissedFerryAlert] = useState<string | null>(
    null,
  );
  const flushSavedState = useUserStatePersistence(
    currentUser?.id,
    stateReady,
    savedState,
    (message) => {
      setApiError(message);
      toast.error(message);
    },
  );
  const notifications = savedState.notifications;
  const updateNotifications: React.Dispatch<
    React.SetStateAction<AppNotification[]>
  > = (update) =>
    setSavedState((old) => ({
      ...old,
      notifications:
        typeof update === "function" ? update(old.notifications) : update,
    }));
  const refreshCatalog = async () => {
    const owner = currentUserId.current;
    const generation = ++catalogGeneration.current;
    const isCurrent = () =>
      currentUserId.current === owner &&
      catalogGeneration.current === generation;
    try {
      const [catalog, publicReviews] = await Promise.all([
        api<{
          attractions: Attraction[];
          accommodations: Accommodation[];
          ferryRoutes: FerryRoute[];
          cultureItems: CultureItem[];
          hikingTrails: HikingTrail[];
          systemPermissions: SystemPermissions;
          socialPosts: SocialPost[];
        }>("/api/catalog"),
        api<Review[]>("/api/reviews"),
      ]);
      if (!isCurrent()) return;
      setAttractions(catalog.attractions);
      setAccommodations(catalog.accommodations);
      setFerryRoutes(catalog.ferryRoutes);
      setCultureItems(catalog.cultureItems);
      setHikingTrails(catalog.hikingTrails);
      setSystemPermissions(catalog.systemPermissions);
      setSocialPosts(catalog.socialPosts);
      setReviews(publicReviews);
    } catch (error) {
      if (isCurrent()) throw error;
    } finally {
      if (isCurrent()) setIsLoadingContent(false);
    }
  };
  useEffect(() => {
    void refreshCatalog().catch((error) => setApiError(errorText(error)));
  }, [currentUser?.id]);
  useEffect(() => {
    let active = true;
    const generation = authGeneration.current;
    void api<UserProfile | null>("/api/auth/me")
      .then((user) => {
        if (active && authGeneration.current === generation) {
          currentUserId.current = user?.id;
          setCurrentUser(user);
          setStateReady(!user);
        }
      })
      .catch((error) => {
        if (active && authGeneration.current === generation) {
          setApiError(errorText(error));
          setStateReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!currentUser) return;
    const owner = currentUser.id;
    let active = true;
    api<
      SavedState & {
        bookings: BookingRecord[];
        groupMessages: GroupMessage[];
        verificationApplicants: VerificationApplicant[];
      }
    >("/api/bootstrap")
      .then((data) => {
        if (active && currentUserId.current === owner) {
          setSavedState({
            notifications: data.notifications,
            documents: data.documents,
            itinerary: data.itinerary,
            checklists: data.checklists,
          });
          setUserBookings(data.bookings);
          setGroupMessages(data.groupMessages);
          setVerificationApplicants(data.verificationApplicants || []);
          setStateReady(true);
        }
      })
      .catch((error) => {
        if (active)
          setApiError("Unable to load your account: " + errorText(error));
      });
    return () => {
      active = false;
    };
  }, [currentUser, setSavedState]);
  const handlePullToRefresh = async () => {
    try {
      const owner = currentUser?.id;
      await refreshCatalog();
      if (owner && currentUserId.current === owner) {
        const messages = await api<GroupMessage[]>("/api/group-chat");
        if (currentUserId.current === owner) setGroupMessages(messages);
      }
      setLastRefreshedAt(new Date().toLocaleTimeString());
      toast.success("Catalog and community content refreshed.");
      setApiError(null);
    } catch (error) {
      setApiError(errorText(error));
      throw error;
    }
  };
  const updateCatalog = async (updates: {
    attractions?: Attraction[];
    accommodations?: Accommodation[];
    ferryRoutes?: FerryRoute[];
  }) => {
    await api("/api/admin/catalog", updates, "PUT");
    await refreshCatalog();
  };
  const handleUpdateFerryStatus = async (
    id: string,
    status: FerryRoute["status"],
    advisoryReason?: string,
    delayDuration?: string,
  ) => {
    try {
      await updateCatalog({
        ferryRoutes: ferryRoutes.map((route) =>
          route.id === id
            ? { ...route, status, advisoryReason, delayDuration }
            : route,
        ),
      });
    } catch (error) {
      setApiError(errorText(error));
      throw error;
    }
  };
  const handleSwapItineraryFerry = (
    dayNumber: number,
    itemId: string,
    ferry: FerryRoute,
  ) => {
    setSavedState((old) => ({
      ...old,
      itinerary: old.itinerary.map((day) =>
        day.dayNumber !== dayNumber
          ? day
          : {
              ...day,
              items: day.items.map((item) =>
                item.id !== itemId
                  ? item
                  : {
                      ...item,
                      ferryId: ferry.id,
                      title: ferry.boatName,
                      time: ferry.departureTime,
                      location: `${ferry.origin} to ${ferry.destination}`,
                      cost: ferry.fare,
                    },
              ),
            },
      ),
    }));
    setDismissedFerryAlert(ferryConflictKey);
    toast.info(
      "Ferry updated in your itinerary. Changes will save automatically.",
    );
  };
  const findFerryAlert = () => {
    let conflict: ActiveFerryAlert | null = null;
    for (const day of savedState.itinerary)
      for (const item of day.items) {
        const ferry = ferryRoutes.find((route) => route.id === item.ferryId);
        if (ferry && ["CANCELLED_SEA", "DELAYED"].includes(ferry.status))
          conflict = {
            impactedFerry: ferry,
            affectedDayNumber: day.dayNumber,
            itineraryItemId: item.id,
            alternativeFerry: ferryRoutes.find(
              (route) =>
                route.id !== ferry.id &&
                route.origin === ferry.origin &&
                route.destination === ferry.destination &&
                ["ON_TIME", "SCHEDULED"].includes(route.status),
            ),
          };
      }
    return conflict;
  };
  const ferryConflict = findFerryAlert();
  const ferryConflictKey = ferryConflict
    ? `${ferryConflict.impactedFerry.id}-${ferryConflict.impactedFerry.status}-${ferryConflict.itineraryItemId}`
    : null;
  const activeFerryAlert =
    dismissedFerryAlert === ferryConflictKey ? null : ferryConflict;
  const handleOpenAuth = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    authGeneration.current += 1;
    currentUserId.current = user.id;
    setStateReady(false);
    setSavedState(emptyUserState());
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setApiError(null);
    showToastNotification(`Signed in as ${user.name}`);
  };
  const handleLogout = async () => {
    try {
      if (currentUser && stateReady) await flushSavedState();
      await api("/api/auth/logout", {});
      authGeneration.current += 1;
      currentUserId.current = undefined;
      setStateReady(false);
      setCurrentUser(null);
      setUserBookings([]);
      setGroupMessages([]);
      setVerificationApplicants([]);
      setSavedState(emptyUserState());
      setStateReady(true);
      showToastNotification("You have signed out.");
      await refreshCatalog();
    } catch (error) {
      setApiError(errorText(error));
    }
  };

  const showToastNotification = (msg: string) => toast.success(msg);

  const handleAddReview = async (review: Review) => {
    const owner = currentUser?.id;
    const saved = await api<Review>("/api/reviews", review);
    if (currentUserId.current !== owner)
      throw new Error(
        "The account changed. Refresh the community feed to view this review.",
      );
    setReviews((old) => [saved, ...old]);
    toast.success("Your review was published.");
    return saved;
  };
  const handleAddBooking = async (booking: BookingRecord) => {
    const owner = currentUser?.id;
    const saved = await api<BookingRecord>("/api/bookings", booking);
    if (currentUserId.current !== owner)
      throw new Error(
        "The account changed. Sign in again to view this reservation.",
      );
    setUserBookings((old) => [saved, ...old]);
    toast.success(
      `Reservation ${saved.status.toLowerCase()}: ${saved.accommodationName}`,
    );
    updateNotifications((old) => [
      {
        id: `booking-${saved.id}`,
        category: "personal",
        type: "booking",
        title: `Reservation: ${saved.accommodationName}`,
        message: `${saved.checkIn} to ${saved.checkOut} · ${saved.status}`,
        timestamp: saved.createdAt,
        read: false,
        actionTab: "stay",
      },
      ...old,
    ]);
    return saved;
  };
  const handleSendGroupMessage = async (text: string) => {
    const owner = currentUser?.id;
    const message = await api<GroupMessage>("/api/group-chat", {
      text,
      groupId: "group-101",
    });
    if (currentUserId.current !== owner) return;
    setGroupMessages((old) => [...old, message]);
    toast.success("Message sent.");
  };
  const handleAddPost = async (post: Pick<SocialPost, "caption" | "location" | "image">) => {
    const owner = currentUser?.id;
    const saved = await api<SocialPost>("/api/social-posts", post);
    if (currentUserId.current !== owner)
      throw new Error(
        "The account changed. Refresh the community feed to view this post.",
      );
    setSocialPosts((old) => [saved, ...old]);
    toast.success("Your community post was published.");
    return saved;
  };

  const handleOpenReviewForAttraction = useCallback((attractionId: string) => {
    setPreSelectedReviewTarget(attractionId);
    setActiveTab("reviews");
  }, [setActiveTab]);
  const handleMapAttraction = useCallback((attraction: Attraction) => {
    handleOpenReviewForAttraction(attraction.id);
  }, [handleOpenReviewForAttraction]);
  const handleMapAccommodation = useCallback(() => setActiveTab("stay"), [setActiveTab]);

  return (
    <UserStateContext.Provider
      value={{
        state: savedState,
        setState: setSavedState,
        signedIn: !!currentUser,
        userId: currentUser?.id,
      }}>
      <div
        className={`app-motion flex min-h-dvh flex-col font-sans transition-colors duration-300 relative overflow-hidden pb-24 md:pb-8 ${
          isDarkMode
            ? "dark bg-[#061e2c] text-slate-100 selection:bg-teal-500 selection:text-slate-950"
            : "bg-shell text-slate-900 selection:bg-teal-600 selection:text-white"
        }`}>
        <a className="skip-link" href="#main-content" onClick={event => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}>Skip to main content</a>
        {/* Ambient Frosted Glass Background Lighting Orbs - Active in Dark Mode Only */}
        <div className="hidden dark:block fixed top-[-10%] left-[-10%] w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none z-0 animate-float-slow" />
        <div className="hidden dark:block fixed bottom-[-10%] right-[-10%] w-[600px] sm:w-[750px] h-[600px] sm:h-[750px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="hidden dark:block fixed top-[40%] right-[-5%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[110px] pointer-events-none z-0" />

        <ToastViewport />
        <FerryAlertBanner
          alert={activeFerryAlert}
          onDismiss={() => setDismissedFerryAlert(ferryConflictKey)}
          onSwapFerry={handleSwapItineraryFerry}
          onViewItinerary={() => setActiveTab("itinerary")}
          isDarkMode={isDarkMode}
        />

        {/* Main Content Wrapper */}
        <div className="relative z-10 flex flex-1 flex-col">
          {apiError && (
            <div
              role="alert"
              className="mx-auto max-w-7xl m-4 p-4 rounded-2xl bg-rose-100 text-rose-900 border border-rose-300 flex justify-between gap-4">
              <span>{apiError}</span>
              <button
                onClick={() => {
                  setApiError(null);
                  setSavedState((old) => ({ ...old }));
                  void handlePullToRefresh().catch(() => {});
                  if (currentUser && !stateReady)
                    setCurrentUser({ ...currentUser });
                }}>
                Retry
              </button>
            </div>
          )}
          {/* Top Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            themePreference={themePreference}
            setThemePreference={setThemePreference}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadMessagesCount={0}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            notifications={notifications}
            setNotifications={updateNotifications}
          />

          {PORTFOLIO_MODE && <PortfolioNotice />}

          {/* Dynamic Content Refresh Sync Toast */}

          {/* Pull-to-refresh mobile wrapper for dynamic content */}
          <PullToRefresh onRefresh={handlePullToRefresh}>
            {/* Main Container - Centered max-w-7xl for high readability and balanced margins on wide displays */}
            <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 pt-6">
              <div key={activeTab} className="page-transition" data-slide-direction={navigation.direction}>
                <Suspense fallback={<PageSkeleton tab={activeTab} />}>
                  {!["auth", "login", "signup"].includes(activeTab) &&
                  !apiError &&
                  (!stateReady ||
                    (isLoadingContent &&
                      !attractions.length &&
                      !accommodations.length)) ? (
                    <PageSkeleton tab={activeTab} />
                  ) : !stateReady &&
                    apiError &&
                    !["auth", "login", "signup"].includes(activeTab) ? (
                    <div
                      role="status"
                      className="p-8 rounded-3xl bg-white dark:bg-slate-900 space-y-4">
                      <p>Your account content could not be loaded.</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="rounded-xl px-4 py-2 bg-teal-500 text-slate-950 font-bold">
                        Retry loading page
                      </button>
                    </div>
                  ) : (
                    <div className="page-ready">
                      {/* Render Tab Content */}
                      {activeTab === "explore" && (
                        <div className="space-y-10">
                          <Hero
                            setActiveTab={setActiveTab}
                            onOpenAiChat={openGuide}
                            isDarkMode={isDarkMode}
                          />

                          <AttractionsSection
                            attractions={attractions}
                            isDarkMode={isDarkMode}
                            onOpenReviewModal={handleOpenReviewForAttraction}
                            searchQuery={searchQuery}
                            isLoading={isLoadingContent}
                          />

                          <BookingSection
                            accommodations={accommodations}
                            isDarkMode={isDarkMode}
                            key={currentUser?.id || "guest"}
                            onAddBooking={handleAddBooking}
                            userBookings={userBookings}
                            isLoading={isLoadingContent}
                          />

                          <Suspense fallback={<p role="status">Loading reviews…</p>}>
                          <ReviewSystem
                            key={`${currentUser?.id || "guest"}-${preSelectedReviewTarget || "reviews"}`}
                            reviews={reviews}
                            attractions={attractions}
                            accommodations={accommodations}
                            isDarkMode={isDarkMode}
                            onAddReview={handleAddReview}
                            onUpdateReview={(updated) => {
                              if (currentUserId.current === currentUser?.id)
                                setReviews((old) =>
                                  old.map((review) =>
                                    review.id === updated.id ? updated : review,
                                  ),
                                );
                            }}
                            preSelectedTargetId={preSelectedReviewTarget}
                          />
                          </Suspense>
                        </div>
                      )}

                      {activeTab === "itinerary" &&
                        stateReady &&
                        !isLoadingContent && (
                          <ItineraryPlanner
                            key={currentUser?.id || "guest"}
                            attractions={attractions}
                            ferryRoutes={ferryRoutes}
                            accommodations={accommodations}
                            isDarkMode={isDarkMode}
                            onSwapFerry={handleSwapItineraryFerry}
                          />
                        )}

                      {activeTab === "map" && (
                        <InteractiveMap
                          hikingTrails={hikingTrails}
                          attractions={attractions}
                          accommodations={accommodations}
                          isDarkMode={isDarkMode}
                          onSelectAttraction={handleMapAttraction}
                          onSelectAccommodation={handleMapAccommodation}
                          isOffline={isOffline}
                        />
                      )}

                      {activeTab === "stay" && (
                        <BookingSection
                          accommodations={accommodations}
                          isDarkMode={isDarkMode}
                          key={currentUser?.id || "guest"}
                          onAddBooking={handleAddBooking}
                          userBookings={userBookings}
                          isLoading={isLoadingContent}
                        />
                      )}

                      {activeTab === "guide" && (
                        <CulturalGuide
                          cultureItems={cultureItems}
                          isDarkMode={isDarkMode}
                        />
                      )}

                      {activeTab === "travel" && stateReady && (
                        <TravelInfoSection
                          ferryRoutes={ferryRoutes}
                          lastUpdated={lastRefreshedAt || undefined}
                          isDarkMode={isDarkMode}
                        />
                      )}

                      {activeTab === "group" && stateReady && (
                        <GroupMessaging
                          messages={groupMessages}
                          isDarkMode={isDarkMode}
                          onSendMessage={handleSendGroupMessage}
                        />
                      )}

                      {activeTab === "documents" && stateReady && (
                        <CloudVaultCalendar
                          isDarkMode={isDarkMode}
                          bookings={userBookings}
                        />
                      )}

                      {activeTab === "social" && (
                        <SocialFeed
                          key={currentUser?.id || "guest"}
                          posts={socialPosts}
                          isDarkMode={isDarkMode}
                          onAddPost={handleAddPost}
                          onUpdatePost={(updated) => {
                            if (currentUserId.current === currentUser?.id)
                              setSocialPosts((old) =>
                                old.map((post) =>
                                  post.id === updated.id ? updated : post,
                                ),
                              );
                          }}
                        />
                      )}

                      {activeTab === "reviews" && (
                        <ReviewSystem
                          key={`${currentUser?.id || "guest"}-${preSelectedReviewTarget || "reviews"}`}
                          reviews={reviews}
                          attractions={attractions}
                          accommodations={accommodations}
                          isDarkMode={isDarkMode}
                          onAddReview={handleAddReview}
                          onUpdateReview={(updated) => {
                            if (currentUserId.current === currentUser?.id)
                              setReviews((old) =>
                                old.map((review) =>
                                  review.id === updated.id ? updated : review,
                                ),
                              );
                          }}
                          preSelectedTargetId={preSelectedReviewTarget}
                        />
                      )}

                      {/* Dedicated Admin Dashboard Tab */}
                      {activeTab === "admin" && (
                        <AdminPage
                          isDarkMode={isDarkMode}
                          currentUser={currentUser}
                          attractions={attractions}
                          onUpdateAttractions={(items) =>
                            updateCatalog({ attractions: items })
                          }
                          accommodations={accommodations}
                          onUpdateAccommodations={(items) =>
                            updateCatalog({ accommodations: items })
                          }
                          verificationApplicants={verificationApplicants}
                          onUpdateVerificationApplicants={async (items) => {
                            await api("/api/admin/verifications", items, "PUT");
                            setVerificationApplicants(items);
                          }}
                          systemPermissions={systemPermissions}
                          onUpdateSystemPermissions={async (permissions) => {
                            await api(
                              "/api/admin/permissions",
                              permissions,
                              "PUT",
                            );
                            setSystemPermissions(permissions);
                          }}
                          onLoginAsAdmin={() => setActiveTab("login")}
                          setActiveTab={setActiveTab}
                        />
                      )}

                      {/* Dedicated Full-Page Auth and Profile View */}
                      {(activeTab === "auth" ||
                        activeTab === "login" ||
                        activeTab === "signup") && (
                        <AuthPage
                          key={activeTab}
                          initialMode={
                            activeTab === "signup" ? "signup" : "login"
                          }
                          isDarkMode={isDarkMode}
                          currentUser={currentUser}
                          onLoginSuccess={handleLoginSuccess}
                          onLogout={handleLogout}
                          setActiveTab={setActiveTab}
                        />
                      )}
                    </div>
                  )}
                </Suspense>
              </div>
            </main>
          </PullToRefresh>

          {/* Floating AI Concierge Trigger Button */}
            <button
              hidden={isAiChatOpen}
              aria-expanded={isAiChatOpen} aria-controls="island-guide-panel"
              onClick={openGuide}
              className={`fixed ${isMobileNavVisible ? "bottom-20" : "bottom-5"} md:bottom-6 right-4 z-40 pl-2.5 pr-4 py-2 rounded-full bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2 font-extrabold text-xs border border-white/20 backdrop-blur-md`}>
              <div className="w-7 h-7 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/tarasibale-logo.jpg"
                  alt="TaraSibale Guide"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="hidden sm:inline">Ask TaraSibale Guide</span>
              <span className="sm:hidden">Island Guide</span>
            </button>

          {/* Floating AI Chat Window */}
          {guideRequested && <Suspense fallback={<p role="status" className="fixed bottom-24 right-4 z-50 rounded-xl bg-slate-900 p-4 text-white">Loading island guide…</p>}>
          <LiveChatBot
            isOpen={isAiChatOpen}
            onClose={closeGuide}
            isDarkMode={isDarkMode}
            isOffline={isOffline}
            setActiveTab={setActiveTab}
          />

          </Suspense>}

          {/* Auth Modal (Triggered anywhere from header or buttons) */}
          <SurfacePresence>{isAuthModalOpen && <Suspense fallback={<p role="status" className="fixed bottom-24 right-4 z-50 rounded-xl bg-slate-900 p-4 text-white">Loading account information…</p>}>
          <AuthModal
            key={authModalMode}
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authModalMode}
            onLoginSuccess={handleLoginSuccess}
            isDarkMode={isDarkMode}
          />

          </Suspense>}</SurfacePresence>

          {/* Interactive Maritime Status Simulator Bar */}
          {currentUser?.role === "admin" && (
            <MaritimeSimulatorBar
              ferryRoutes={ferryRoutes}
              onUpdateFerryStatus={handleUpdateFerryStatus}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Footer */}
          <Footer isDarkMode={isDarkMode} setActiveTab={setActiveTab} />

          {/* Mobile-First Fixed Bottom Navigation Bar (hidden on md and above) */}
          <BottomNavBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            unreadMessagesCount={0}
            onVisibilityChange={setIsMobileNavVisible}
          />
        </div>
      </div>
    </UserStateContext.Provider>
  );
}
