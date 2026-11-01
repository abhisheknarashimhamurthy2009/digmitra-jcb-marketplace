import {
  IconArrowRight,
  IconBolt,
  IconBuildingStore,
  IconCalendarEvent,
  IconCheck,
  IconPhone,
  IconShieldCheck,
  IconShovel,
  IconStar,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { LoginScreen, type AuthUser } from "@/components/auth/login-screen";
import { AdminDashboard } from "@/components/mobile/admin-dashboard";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { OwnerDashboard } from "@/components/mobile/owner-dashboard";
import { RealtimeMap } from "@/components/map/realtime-map";
import {
  SiteBookingDetails,
  type BookingSubmissionData,
} from "@/components/booking/site-booking-details";
import {
  PaymentModeScreen,
  type PaymentMode,
} from "@/components/booking/payment-mode-screen";
import {
  JcbCatalogScreen,
  type JcbMachineItem,
  AVAILABLE_JCBS,
} from "@/components/booking/jcb-catalog-screen";
import {
  AdvancePaymentScreen,
  type AdvancePaymentResult,
} from "@/components/booking/advance-payment-screen";
import { BookingSuccessScreen } from "@/components/booking/booking-success-screen";
import { LiveTrackingScreen } from "@/components/map/live-tracking-screen";
import { emitAppNotification } from "@/lib/notification-store";
import { syncUserToOnlineDb, saveBookingToOnlineDb } from "@/lib/supabase";
import { APP_TITLE } from "@/lib/app-config";
import { type SupportedLanguage, translations } from "@/lib/translations";

export function meta() {
  return [
    { title: `${APP_TITLE} — JCB Site Cleaning & Debris Extraction App` },
    {
      name: "description",
      content:
        "Book verified JCBs, excavators and tipper trucks for plot clearing, debris extraction and site leveling on Android & iOS.",
    },
  ];
}

export default function IndexRoute() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  const t = translations[selectedLanguage] || translations.en;

  // Role-Based User Authentication State
  // As soon as user visits, they land on the login page first
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Clear any persisted user state so every fresh visit lands on login page
    try {
      localStorage.removeItem("digmitra_user");
    } catch {}
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    syncUserToOnlineDb(user).catch((err) =>
      console.warn("User online sync error:", err)
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("digmitra_user");
    } catch {}
  };

  // Dynamic services based on language
  const cleaningServices = [
    {
      id: "plot_cleaning",
      title: t.srvPlotClearing,
      subtitle: t.srvPlotClearingSub,
      icon: IconShovel,
      badge: t.srvPlotClearingBadge,
      accent: "yellow",
      defaultHours: 3,
    },
    {
      id: "debris_extraction",
      title: t.srvDebris,
      subtitle: t.srvDebrisSub,
      icon: IconTruck,
      badge: t.srvDebrisBadge,
      accent: "blue",
      defaultHours: 4,
    },
    {
      id: "site_leveling",
      title: t.srvLeveling,
      subtitle: t.srvLevelingSub,
      icon: IconBuildingStore,
      badge: t.srvLevelingBadge,
      accent: "emerald",
      defaultHours: 3.5,
    },
    {
      id: "trenching",
      title: t.srvTrenching,
      subtitle: t.srvTrenchingSub,
      icon: IconBolt,
      badge: t.srvTrenchingBadge,
      accent: "purple",
      defaultHours: 2.5,
    },
  ];

  // Machine options
  const machines = [
    {
      id: "jcb_3dx",
      name: "JCB 3DX Super Backhoe",
      spec: "1.0 m³ front shovel + 0.26 m³ backhoe",
      ratePerHour: 950,
      eta: `35 ${t.minsAway}`,
      distance: "1.8 km",
      rating: 4.9,
      jobsDone: 342,
    },
    {
      id: "jcb_4dx",
      name: "JCB 4DX Heavy Duty",
      spec: "Heavy reinforced boom + rock breaker option",
      ratePerHour: 1100,
      eta: `50 ${t.minsAway}`,
      distance: "3.4 km",
      rating: 4.85,
      jobsDone: 218,
    },
    {
      id: "mini_excavator",
      name: "Mini Excavator (3 Ton)",
      spec: "Zero tail-swing, 1.5m narrow access",
      ratePerHour: 1250,
      eta: `45 ${t.minsAway}`,
      distance: "2.9 km",
      rating: 4.92,
      jobsDone: 154,
    },
  ];

  const [selectedServiceId, setSelectedServiceId] = useState("plot_cleaning");
  const [selectedMachineId, setSelectedMachineId] = useState("jcb_3dx");
  const [plotArea, setPlotArea] = useState("30 × 40 ft (1,200 sq.ft)");
  const [includeDumper, setIncludeDumper] = useState(true);
  const [dumperTrips, setDumperTrips] = useState(1);
  const [workingHours, setWorkingHours] = useState(3);
  const [scheduleTime, setScheduleTime] = useState<"instant" | "tomorrow">("instant");

  // Booking Confirmation Modal State
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");

  const activeService =
    cleaningServices.find((s) => s.id === selectedServiceId) || cleaningServices[0];
  const activeMachine =
    machines.find((m) => m.id === selectedMachineId) || machines[0];

  const hourlyRate = activeMachine.ratePerHour;
  const dumperRate = 1800;
  const machineTotal = workingHours * hourlyRate;
  const dumperTotal = includeDumper ? dumperTrips * dumperRate : 0;
  const estimatedGrandTotal = machineTotal + dumperTotal;

  // Consumer multi-step booking funnel:
  // "map" -> "details" -> "payment_mode" -> "jcb_catalog" -> "advance_payment" -> "booking_success" -> "live_tracking"
  const [consumerPage, setConsumerPage] = useState<
    "map" | "details" | "payment_mode" | "jcb_catalog" | "advance_payment" | "booking_success" | "live_tracking"
  >("map");
  const [bookingData, setBookingData] = useState<BookingSubmissionData | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>("cash_on_spot");
  const [selectedJcb, setSelectedJcb] = useState<JcbMachineItem>(AVAILABLE_JCBS[0]);
  const [advancePaymentResult, setAdvancePaymentResult] = useState<AdvancePaymentResult | null>(null);
  const [liveSiteLocation, setLiveSiteLocation] = useState<string>("Kyatasandra, Tumakuru - 572101");
  const [siteCoordinates, setSiteCoordinates] = useState<{
    lat: number;
    lng: number;
    accuracy?: number | null;
  }>({
    lat: 13.3150995,
    lng: 77.133846,
    accuracy: null,
  });

  // Handle Estimate Application from Calculator
  const handleApplyEstimate = (data: {
    plotSize: string;
    condition: string;
    hours: number;
    truckTrips: number;
    estimatedCost: number;
    machineName: string;
  }) => {
    setPlotArea(data.plotSize);
    setWorkingHours(data.hours);
    if (data.truckTrips > 0) {
      setIncludeDumper(true);
      setDumperTrips(data.truckTrips);
    } else {
      setIncludeDumper(false);
    }
  };

  // 1. Map -> Site Details Form
  const handleStartBookingDetails = () => {
    setConsumerPage("details");
  };

  // 2. Site Details -> Payment Mode Selection
  const handleProceedToPaymentMode = (data: BookingSubmissionData) => {
    setBookingData(data);
    setConsumerPage("payment_mode");
  };

  // 3. Payment Mode -> JCB Selection Catalog
  const handleSelectPaymentMode = (mode: PaymentMode) => {
    setSelectedPaymentMode(mode);
    setConsumerPage("jcb_catalog");
  };

  // 4. JCB Selection Catalog -> Advance Payment Screen
  const handleSelectJcb = (jcb: JcbMachineItem) => {
    setSelectedJcb(jcb);
    setConsumerPage("advance_payment");
  };

  // 5. Advance Payment Successful (₹500 paid) -> Confirm Booking & Dispatch Machine
  const handleAdvancePaymentSuccess = (result: AdvancePaymentResult) => {
    setAdvancePaymentResult(result);
    const bookingId = `JCB-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedBookingId(bookingId);
    setConsumerPage("booking_success");
    setBookingSuccessModal(true);

    // Persist booking 100% online in Supabase cloud database
    saveBookingToOnlineDb({
      bookingRef: bookingId,
      customerName: currentUser?.name || "Customer",
      customerPhone: currentUser?.phone || "",
      siteAddress: liveSiteLocation,
      siteLat: siteCoordinates.lat,
      siteLng: siteCoordinates.lng,
      accuracy: siteCoordinates.accuracy ?? null,
      siteDimension: bookingData?.siteDimension || "30 × 40 ft",
      workType: "plot_cleaning",
      selectedJcbType: (selectedJcb as any).machine || selectedJcb.model,
      selectedTipperType: bookingData?.tractorRequired ? bookingData.tractorType : undefined,
      advanceAmount: 500,
      totalEstimate: estimatedGrandTotal,
      paymentMode: selectedPaymentMode,
      photos: bookingData?.surroundingImages || [],
      tractorRequired: bookingData?.tractorRequired || false,
      tractorTotal: bookingData?.tractorTotal || 0,
      machineHours: bookingData?.machineHours || 3,
    }).catch((e) => console.error("Cloud booking save error:", e));

    // Emit real-time in-app push notification
    emitAppNotification({
      type: "booked",
      title: "🎉 JCB Successfully Booked!",
      titleKn: "🎉 ಜೆಸಿಬಿ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ!",
      message: `Booking #${bookingId} for plot cleaning confirmed. Advance ₹500 verified. Machinery en route to ${liveSiteLocation}.`,
      messageKn: `ಬುಕಿಂಗ್ #${bookingId} ಕನ್ಫರ್ಮ್ ಆಗಿದೆ. ಮುಂಗಡ ₹500 ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಯಂತ್ರವು ಸೈಟ್‌ಗೆ ಹೊರಟಿದೆ.`,
      iconEmoji: "🎉",
      accentColor: "emerald",
      actionLabel: "Track Live Map",
      actionLabelKn: "ಲೈವ್ ನಕ್ಷೆ ನೋಡಿ",
      actionPayload: "live_tracking",
    });
  };

  return (
    <MobileShell
      selectedLanguage={selectedLanguage}
      onSelectLanguage={(lang) => setSelectedLanguage(lang)}
      currentUser={currentUser}
      onLogout={handleLogout}
      t={t}
      noScroll={currentUser?.role === "owner" || (currentUser?.role === "consumer" && (consumerPage === "map" || consumerPage === "live_tracking"))}
      onNavigate={(route) => {
        if (route === "live_tracking") {
          setConsumerPage("live_tracking");
          setBookingSuccessModal(false);
        } else if (route === "map") {
          setConsumerPage("map");
        }
      }}
    >
      {!currentUser ? (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          selectedLanguage={selectedLanguage}
          t={t}
        />
      ) : currentUser.role === "owner" ? (
        <OwnerDashboard
          user={currentUser}
          selectedLanguage={selectedLanguage}
          t={t}
          onLogout={handleLogout}
        />
      ) : currentUser.role === "admin" ? (
        <AdminDashboard
          user={currentUser}
          selectedLanguage={selectedLanguage}
          t={t}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {/* Consumer View: Multi-Step Booking Funnel */}
          {consumerPage === "map" ? (
            <div className="relative flex-1 h-full min-h-[480px] w-full flex flex-col overflow-hidden">
              <RealtimeMap
                fullScreen
                selectedLanguage={selectedLanguage}
                selectedMachineId={selectedMachineId}
                onSelectMachine={(machineId) => setSelectedMachineId(machineId)}
                onConfirmBooking={handleStartBookingDetails}
                onLocationChange={(addr, lat, lng, acc) => {
                  setLiveSiteLocation(addr);
                  if (lat && lng) {
                    setSiteCoordinates({ lat, lng, accuracy: acc });
                  }
                }}
                estimatedTotal={estimatedGrandTotal}
              />
            </div>
          ) : consumerPage === "details" ? (
            <SiteBookingDetails
              selectedLanguage={selectedLanguage}
              siteLocation={liveSiteLocation}
              onBackToMap={() => setConsumerPage("map")}
              onProceedToPayment={handleProceedToPaymentMode}
            />
          ) : consumerPage === "payment_mode" ? (
            <PaymentModeScreen
              selectedLanguage={selectedLanguage}
              siteLocation={liveSiteLocation}
              dimensionString={bookingData?.siteDimension || "30 × 40 ft"}
              photosCount={bookingData?.surroundingImages.length || 0}
              tractorRequired={bookingData?.tractorRequired || false}
              onBack={() => setConsumerPage("details")}
              onSelectPaymentMode={handleSelectPaymentMode}
            />
          ) : consumerPage === "jcb_catalog" ? (
            <JcbCatalogScreen
              selectedLanguage={selectedLanguage}
              siteLocation={liveSiteLocation}
              dimensionString={bookingData?.siteDimension || "30 × 40 ft"}
              workHours={bookingData?.machineHours || 3}
              paymentMode={selectedPaymentMode}
              onBack={() => setConsumerPage("payment_mode")}
              onSelectJcb={handleSelectJcb}
            />
          ) : consumerPage === "advance_payment" ? (
            <AdvancePaymentScreen
              selectedLanguage={selectedLanguage}
              selectedJcb={selectedJcb}
              paymentMode={selectedPaymentMode}
              dimensionString={bookingData?.siteDimension || "30 × 40 ft"}
              workHours={bookingData?.machineHours || 3}
              tractorRequired={bookingData?.tractorRequired || false}
              tractorTotal={bookingData?.tractorTotal || 0}
              onBack={() => setConsumerPage("jcb_catalog")}
              onPaymentSuccess={handleAdvancePaymentSuccess}
            />
          ) : consumerPage === "live_tracking" ? (
            <div className="relative flex-1 h-full min-h-[480px] w-full flex flex-col overflow-hidden">
              <LiveTrackingScreen
                selectedLanguage={selectedLanguage}
                bookingId={confirmedBookingId}
                selectedJcb={selectedJcb}
                bookingData={bookingData}
                advancePaymentResult={advancePaymentResult}
                onBackToHome={() => setConsumerPage("map")}
              />
            </div>
          ) : (
            <div className="relative flex-1 h-full min-h-[480px] w-full flex flex-col overflow-hidden">
              <RealtimeMap
                fullScreen
                selectedLanguage={selectedLanguage}
                selectedMachineId={selectedMachineId}
                onSelectMachine={(machineId) => setSelectedMachineId(machineId)}
                onConfirmBooking={handleStartBookingDetails}
                onLocationChange={(addr, lat, lng, acc) => {
                  setLiveSiteLocation(addr);
                  if (lat && lng) {
                    setSiteCoordinates({ lat, lng, accuracy: acc });
                  }
                }}
                estimatedTotal={estimatedGrandTotal}
              />
            </div>
          )}

      {/* 3/4th Screen Big Green & Yellow Themed Booking Success Screen */}
      {(bookingSuccessModal || consumerPage === "booking_success") && (
        <BookingSuccessScreen
          selectedLanguage={selectedLanguage}
          bookingId={confirmedBookingId}
          selectedJcb={selectedJcb}
          bookingData={bookingData}
          advancePaymentResult={advancePaymentResult}
          onTrackOnMap={() => {
            setBookingSuccessModal(false);
            setConsumerPage("live_tracking");
          }}
          onClose={() => {
            setBookingSuccessModal(false);
            setConsumerPage("map");
          }}
        />
      )}
      </>
      )}
    </MobileShell>
  );
}
