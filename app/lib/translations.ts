export type SupportedLanguage = "en" | "kn" | "hi" | "te" | "ta";

export interface AppTranslations {
  // Shell
  appTitle: string;
  appSubtitle: string;
  gpsDetecting: string;
  gpsButton: string;
  gpsAcquiring: string;
  gpsPermissionNotice: string;
  gpsSuccess: string;
  gpsError: string;
  locationPlaceholder: string;
  changeLocation: string;

  // Tabs
  tabBook: string;
  tabBookSub: string;
  tabTracking: string;
  tabTrackingSub: string;
  tabCalc: string;
  tabCalcSub: string;
  tabSupport: string;
  tabSupportSub: string;

  // Hero
  arrivalBadge: string;
  activeMachines: string;
  heroTitle: string;
  heroSubtitle: string;

  // Step 1: Services
  stepServicesTitle: string;
  stepServicesTap: string;
  srvPlotClearing: string;
  srvPlotClearingSub: string;
  srvPlotClearingBadge: string;
  srvDebris: string;
  srvDebrisSub: string;
  srvDebrisBadge: string;
  srvLeveling: string;
  srvLevelingSub: string;
  srvLevelingBadge: string;
  srvTrenching: string;
  srvTrenchingSub: string;
  srvTrenchingBadge: string;

  // Step 2: Plot Dimensions
  stepDimensionsTitle: string;
  useEstimator: string;
  estDuration: string;
  hoursLabel: string;

  // Step 3: Tipper Truck
  tipperTitle: string;
  tipperSub: string;
  tipperDetails: string;
  tipperPrice: string;
  tripLabel: string;
  tripsLabel: string;

  // Step 4: Machines
  stepMachinesTitle: string;
  perHour: string;
  minsAway: string;
  siteCleaningsDone: string;

  // Step 5: Schedule
  stepScheduleTitle: string;
  rightNow: string;
  rightNowSub: string;
  tomorrow: string;
  tomorrowSub: string;

  // Bottom Sticky Bar
  estTotal: string;
  confirmJcb: string;
  truckTripsShort: string;

  // Confirmation Modal
  bookingConfirmedBadge: string;
  bookingConfirmedTitle: string;
  bookingIdLabel: string;
  serviceLabel: string;
  machineLabel: string;
  durationLabel: string;
  debrisDumperLabel: string;
  operatorAlertText: string;
  trackOperatorBtn: string;
  callOperatorBtn: string;

  // Tracking
  liveJobTitle: string;
  siteCleaningTag: string;
  statusEnRoute: string;
  statusWorking: string;
  statusDone: string;
  stepDispatched: string;
  stepClearing: string;
  stepCompleted: string;
  verifiedOperatorTag: string;
  callOperator: string;
  whatsApp: string;
  digitalHourMeter: string;
  hourMeterDesc: string;
  pause: string;
  resume: string;
  timeLogged: string;
  meterCostSoFar: string;
  baseRateTag: string;
  siteScopeTitle: string;
  inspectionPhotosTitle: string;
  beforePhoto: string;
  duringPhoto: string;

  // Calculator
  calcTitle: string;
  calcHeader: string;
  calcDesc: string;
  calcStep1: string;
  calcCustom: string;
  calcStep2: string;
  condWeeds: string;
  condWeedsSub: string;
  condBushes: string;
  condBushesSub: string;
  condDebris: string;
  condDebrisSub: string;
  condLeveling: string;
  condLevelingSub: string;
  calcStep3: string;
  calcStep3Desc: string;
  recommendedSetup: string;
  machineTime: string;
  dumperTripsMetric: string;
  budgetEst: string;
  fuelDriverIncluded: string;
  varianceNotice: string;
  applyEstimateBtn: string;

  // Support
  supportHeader: string;
  supportTitle: string;
  supportDesc: string;
  callDispatchBtn: string;
  whatsAppBtn: string;
  guaranteeTitle: string;
  g1Title: string;
  g1Desc: string;
  g2Title: string;
  g2Desc: string;
  g3Title: string;
  g3Desc: string;
  faqTitle: string;
}

export const translations: Record<SupportedLanguage, AppTranslations> = {
  // English
  en: {
    appTitle: "DigMitra",
    appSubtitle: "JCB Site & Property Cleaning",
    gpsDetecting: "Detecting site location...",
    gpsButton: "GPS",
    gpsAcquiring: "Acquiring accurate GPS location...",
    gpsPermissionNotice: "Allow GPS location access to locate your site & nearest JCB",
    gpsSuccess: "Accurate GPS Location Locked",
    gpsError: "Could not get GPS. Showing default area.",
    locationPlaceholder: "Enter plot location, landmark or pincode",
    changeLocation: "Change Location",

    tabBook: "Book JCB",
    tabBookSub: "Site Clean",
    tabTracking: "Live Job",
    tabTrackingSub: "Tracker",
    tabCalc: "Site Calc",
    tabCalcSub: "Estimator",
    tabSupport: "Helpline",
    tabSupportSub: "Support",

    arrivalBadge: "⚡ 60-Min Site Arrival",
    activeMachines: "14 Machines Active Near You",
    heroTitle: "Book JCB for Property Cleaning & Debris Removal",
    heroSubtitle: "Clear wild weeds, level plots, and haul away debris with verified local operators.",

    stepServicesTitle: "1. Select Cleaning / Site Service",
    stepServicesTap: "Tap to select",
    srvPlotClearing: "Plot & Weed Clearing",
    srvPlotClearingSub: "Wild jungle, grass & root extraction",
    srvPlotClearingBadge: "Most Booked",
    srvDebris: "Debris & Rubble Extraction",
    srvDebrisSub: "Demolition waste + Tipper truck loading",
    srvDebrisBadge: "Truck Add-on",
    srvLeveling: "Site Leveling & Grading",
    srvLevelingSub: "High-low ground cut & fill slope prep",
    srvLevelingBadge: "Foundation",
    srvTrenching: "Trenching & Drainage",
    srvTrenchingSub: "Boundary ditch, water pipe & cable dig",
    srvTrenchingBadge: "Precise",

    stepDimensionsTitle: "2. Property / Plot Dimensions",
    useEstimator: "Use Estimator",
    estDuration: "Estimated Duration:",
    hoursLabel: "Hours",

    tipperTitle: "Add Tipper / Dumper Truck",
    tipperSub: "Haul away cleared weeds, roots & concrete rubble off-site",
    tipperDetails: "6-Wheeler Dumper (300 cu.ft)",
    tipperPrice: "₹1,800 per trip (includes landfill fee)",
    tripLabel: "Trip",
    tripsLabel: "Trips",

    stepMachinesTitle: "3. Choose Machine & Operator",
    perHour: "/hr",
    minsAway: "mins away",
    siteCleaningsDone: "site cleanings",

    stepScheduleTitle: "4. When Do You Need It?",
    rightNow: "Right Now",
    rightNowSub: "Machine arrives in ~35-50 min",
    tomorrow: "Tomorrow",
    tomorrowSub: "Morning slot (08:00 AM)",

    estTotal: "Estimated Total",
    confirmJcb: "Confirm JCB",
    truckTripsShort: "truck",

    bookingConfirmedBadge: "Booking Confirmed",
    bookingConfirmedTitle: "JCB Dispatched to Your Site!",
    bookingIdLabel: "Booking ID",
    serviceLabel: "Service:",
    machineLabel: "Machine:",
    durationLabel: "Duration:",
    debrisDumperLabel: "Debris Dumper:",
    operatorAlertText: "Operator has been alerted. He will call you within 5 minutes to confirm site entry directions.",
    trackOperatorBtn: "Track Operator",
    callOperatorBtn: "Call Operator",

    liveJobTitle: "Live Job #JCB-8842",
    siteCleaningTag: "Site Cleaning",
    statusEnRoute: "🚜 Operator is on the way (ETA 12 min)",
    statusWorking: "🏗️ Machine is Clearing Site Now",
    statusDone: "✅ Site Cleaned & Completed",
    stepDispatched: "Dispatched",
    stepClearing: "Clearing Site",
    stepCompleted: "Completed",
    verifiedOperatorTag: "Verified Operator & Commercial Insurance",
    callOperator: "Call Operator",
    whatsApp: "WhatsApp",
    digitalHourMeter: "Digital Hour-Meter",
    hourMeterDesc: "Live on-site working meter • Transparent billing",
    pause: "Pause",
    resume: "Resume",
    timeLogged: "Active Time Logged",
    meterCostSoFar: "Meter Cost So Far",
    baseRateTag: "@ ₹950/hr base rate",
    siteScopeTitle: "Site Location & Scope",
    inspectionPhotosTitle: "Site Inspection Photos",
    beforePhoto: "Before Clearing",
    duringPhoto: "Work In Progress",

    calcTitle: "Site Cleaning Estimator",
    calcHeader: "Calculate JCB Hours & Dumper Trips",
    calcDesc: "Get an instant, transparent estimate for plot clearing, leveling & rubble extraction.",
    calcStep1: "1. Select Property / Plot Size",
    calcCustom: "Or custom area:",
    calcStep2: "2. Current Site Condition",
    condWeeds: "Grass & Wild Weeds",
    condWeedsSub: "Surface vegetative cleaning & weed scrape",
    condBushes: "Dense Shrubs & Small Stumps",
    condBushesSub: "Root extraction + ground clearing",
    condDebris: "Demolition & Concrete Debris",
    condDebrisSub: "Heavy rubble removal, brick & mortar extraction",
    condLeveling: "Uneven Ground & Mud Mounds",
    condLevelingSub: "Cut-and-fill soil leveling & boundary grading",
    calcStep3: "Need Dumper / Tipper Truck?",
    calcStep3Desc: "Carry excavated debris & waste off-site to designated dumpyard",
    recommendedSetup: "Recommended Setup",
    machineTime: "Machine Time",
    dumperTripsMetric: "Dumper Trips",
    budgetEst: "Estimated Budget",
    fuelDriverIncluded: "Includes Fuel & Driver",
    varianceNotice: "Actual hours may vary ±15% based on soil rockiness and roots.",
    applyEstimateBtn: "Apply Estimate to Booking",

    supportHeader: "24/7 Site Dispatch Support",
    supportTitle: "Need Help with Your Site or Booking?",
    supportDesc: "Our heavy machinery dispatch managers are available right now to coordinate operators, negotiate bulk site clearing, or resolve any dispute.",
    callDispatchBtn: "Call Dispatch",
    whatsAppBtn: "WhatsApp Us",
    guaranteeTitle: "DigMitra Property Cleaning Guarantees",
    g1Title: "Verified & Insured Operators",
    g1Desc: "All machine owners and operators are background checked with verified driving licenses and commercial insurance.",
    g2Title: "Digital Hour-Meter Protection",
    g2Desc: "You only pay for actual machine operating time logged on our digital app timer. No inflated idle charges.",
    g3Title: "Legal Debris Dumping Compliance",
    g3Desc: "Debris carried by our tippers is exclusively unloaded at municipal-approved landfills with digital dump receipts.",
    faqTitle: "Frequently Asked Questions",
  },

  // Kannada (ಕನ್ನಡ)
  kn: {
    appTitle: "ಡಿಗ್‌ಮಿತ್ರ",
    appSubtitle: "JCB ಸೈಟ್ & ಆಸ್ತಿ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    gpsDetecting: "ಸೈಟ್ ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    gpsButton: "GPS",
    gpsAcquiring: "ನಿಖರವಾದ GPS ಸ್ಥಳ ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    gpsPermissionNotice: "ನಿಮ್ಮ ಸೈಟ್ ಮತ್ತು ಹತ್ತಿರದ JCB ಪತ್ತೆಹಚ್ಚಲು GPS ಅನುಮತಿ ನೀಡಿ",
    gpsSuccess: "ನಿಖರವಾದ GPS ಸ್ಥಳ ದೃಢಪಟ್ಟಿದೆ",
    gpsError: "GPS ಸಿಗಲಿಲ್ಲ. ಪೂರ್ವನಿಯೋಜಿತ ಸ್ಥಳ ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
    locationPlaceholder: "ಪ್ಲಾಟ್ ವಿಳಾಸ, ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ",
    changeLocation: "ಸ್ಥಳ ಬದಲಾಯಿಸಿ",

    tabBook: "JCB ಬುಕಿಂಗ್",
    tabBookSub: "ಸೈಟ್ ಕ್ಲೀನಿಂಗ್",
    tabTracking: "ಲೈವ್ ಕೆಲಸ",
    tabTrackingSub: "ಟ್ರ್ಯಾಕರ್",
    tabCalc: "ಸೈಟ್ ಲೆಕ್ಕ",
    tabCalcSub: "ಅಂದಾಜು",
    tabSupport: "ಸಹಾಯವಾಣಿ",
    tabSupportSub: "ಬೆಂಬಲ",

    arrivalBadge: "⚡ 60 ನಿಮಿಷಗಳಲ್ಲಿ ಸೈಟ್ ತಲುಪಲಿದೆ",
    activeMachines: "ನಿಮ್ಮ ಹತ್ತಿರ 14 ಯಂತ್ರಗಳು ಲಭ್ಯವಿದೆ",
    heroTitle: "ಸೈಟ್ ಸ್ವಚ್ಛತೆ ಮತ್ತು ತ್ಯಾಜ್ಯ ತೆರವಿಗೆ JCB ಬುಕ್ ಮಾಡಿ",
    heroSubtitle: "ಕಾಡು ಗಿಡಗಳ ತೆರವು, ಸೈಟ್ ಸಮತಟ್ಟು ಮತ್ತು ಕಟ್ಟಡ ತ್ಯಾಜ್ಯವನ್ನು ಸ್ಥಳೀಯ ಪರಿಣಿತ ಚಾಲಕರಿಂದ ತೆರವುಗೊಳಿಸಿ.",

    stepServicesTitle: "1. ಸ್ವಚ್ಛತೆ / ಸೈಟ್ ಸೇವೆಯನ್ನು ಆರಿಸಿ",
    stepServicesTap: "ಆಯ್ಕೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    srvPlotClearing: "ಪ್ಲಾಟ್ & ಕಳೆ ಸ್ವಚ್ಛತೆ",
    srvPlotClearingSub: "ಕಾಡು ಪೊದೆಗಳು, ಹುಲ್ಲು & ಬೇರುಗಳ ಕಿತ್ತುಹಾಕುವಿಕೆ",
    srvPlotClearingBadge: "ಅತಿ ಹೆಚ್ಚು ಬುಕ್ ಆಗಿದೆ",
    srvDebris: "ಕಟ್ಟಡ ತ್ಯಾಜ್ಯ & ಕಲ್ಲು-ಮಣ್ಣು ತೆರವು",
    srvDebrisSub: "ಕೆಡವಿದ ತ್ಯಾಜ್ಯ + ಟಿಪ್ಪರ್ ಲಾರಿ ಲೋಡಿಂಗ್",
    srvDebrisBadge: "ಲಾರಿ ಸೇರ್ಪಡೆ",
    srvLeveling: "ಸೈಟ್ ಸಮತಟ್ಟು & ಗ್ರೇಡಿಂಗ್",
    srvLevelingSub: "ಎತ್ತರ-ತಗ್ಗು ನೆಲ ಸಮತಟ್ಟು & ಇಳಿಜಾರು ಸರಿಪಡಿಸುವಿಕೆ",
    srvLevelingBadge: "ಅಡಿಪಾಯಕ್ಕೆ",
    srvTrenching: "ಕಂದಕ & ಚರಂಡಿ ತೋಡುವಿಕೆ",
    srvTrenchingSub: "ಗಡಿ ಚರಂಡಿ, ನೀರಿನ ಪೈಪ್ & ಕೇಬಲ್ ಗುಂಡಿ",
    srvTrenchingBadge: "ನಿಖರ",

    stepDimensionsTitle: "2. ಆಸ್ತಿ / ಪ್ಲಾಟ್ ಅಳತೆ",
    useEstimator: "ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಬಳಸಿ",
    estDuration: "ಅಂದಾಜು ಕೆಲಸದ ಸಮಯ:",
    hoursLabel: "ಗಂಟೆಗಳು",

    tipperTitle: "ಟಿಪ್ಪರ್ / ಡಂಪರ್ ಲಾರಿ ಸೇರಿಸಿ",
    tipperSub: "ಸ್ವಚ್ಛಗೊಳಿಸಿದ ಗಿಡಗಂಟೆಗಳು & ಕಲ್ಲು-ಮಣ್ಣನ್ನು ಸೈಟ್‌ನಿಂದ ಹೊರಗೆ ಸಾಗಿಸಿ",
    tipperDetails: "6-ಚಕ್ರ ಡಂಪರ್ (300 ಘನ ಅಡಿ)",
    tipperPrice: "ಪ್ರತಿ ಟ್ರಿಪ್‌ಗೆ ₹1,800 (ಡಂಪಿಂಗ್ ಶುಲ್ಕ ಸೇರಿ)",
    tripLabel: "ಟ್ರಿಪ್",
    tripsLabel: "ಟ್ರಿಪ್‌ಗಳು",

    stepMachinesTitle: "3. ಯಂತ್ರ ಮತ್ತು ಚಾಲಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    perHour: "/ಗಂಟೆಗೆ",
    minsAway: "ನಿಮಿಷಗಳ ದೂರದಲ್ಲಿ",
    siteCleaningsDone: "ಸೈಟ್ ಕೆಲಸಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",

    stepScheduleTitle: "4. ನಿಮಗೆ ಯಾವಾಗ ಬೇಕು?",
    rightNow: "ಈಗಲೇ ತಕ್ಷಣ",
    rightNowSub: "ಯಂತ್ರವು ~35-50 ನಿಮಿಷಗಳಲ್ಲಿ ಬರಲಿದೆ",
    tomorrow: "ನಾಳೆ ಬೆಳಿಗ್ಗೆ",
    tomorrowSub: "ಬೆಳಗಿನ ಸಮಯ (08:00 AM)",

    estTotal: "ಅಂದಾಜು ಒಟ್ಟು ಮೊತ್ತ",
    confirmJcb: "JCB ದೃಢೀಕರಿಸಿ",
    truckTripsShort: "ಲಾರಿ",

    bookingConfirmedBadge: "ಬುಕಿಂಗ್ ಖಚಿತವಾಗಿದೆ",
    bookingConfirmedTitle: "JCB ನಿಮ್ಮ ಸೈಟ್‌ಗೆ ಹೊರಟಿದೆ!",
    bookingIdLabel: "ಬುಕಿಂಗ್ ಐಡಿ",
    serviceLabel: "ಸೇವೆ:",
    machineLabel: "ಯಂತ್ರ:",
    durationLabel: "ಸಮಯ:",
    debrisDumperLabel: "ತ್ಯಾಜ್ಯ ಡಂಪರ್ ಲಾರಿ:",
    operatorAlertText: "ಚಾಲಕ ರಮೇಶ್ ಕುಮಾರ್ ಅವರಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ. ಸೈಟ್ ದಾರಿ ತಿಳಿಯಲು 5 ನಿಮಿಷಗಳಲ್ಲಿ ಕರೆ ಮಾಡುತ್ತಾರೆ.",
    trackOperatorBtn: "ಚಾಲಕನನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    callOperatorBtn: "ಚಾಲಕನಿಗೆ ಕರೆ ಮಾಡಿ",

    liveJobTitle: "ಲೈವ್ ಕೆಲಸ #JCB-8842",
    siteCleaningTag: "ಸೈಟ್ ಕ್ಲೀನಿಂಗ್",
    statusEnRoute: "🚜 ಚಾಲಕ ದಾರಿಯಲ್ಲಿದ್ದಾರೆ (12 ನಿಮಿಷದಲ್ಲಿ ತಲುಪಲಿದ್ದಾರೆ)",
    statusWorking: "🏗️ ಸೈಟ್‌ನಲ್ಲಿ ಕೆಲಸ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    statusDone: "✅ ಸೈಟ್ ಸಂಪೂರ್ಣ ಸ್ವಚ್ಛಗೊಂಡಿದೆ",
    stepDispatched: "ಹೊರಟಿದೆ",
    stepClearing: "ಸ್ವಚ್ಛತೆ ನಡೆಯುತ್ತಿದೆ",
    stepCompleted: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    verifiedOperatorTag: "ಪರಿಶೀಲಿತ ಚಾಲಕ & ವಿಮೆ ಇದೆ",
    callOperator: "ಚಾಲಕನಿಗೆ ಕರೆ ಮಾಡಿ",
    whatsApp: "ವಾಟ್ಸಾಪ್",
    digitalHourMeter: "ಡಿಜಿಟಲ್ ಅವರ್-ಮೀಟರ್",
    hourMeterDesc: "ಲೈವ್ ಕೆಲಸದ ಮೀಟರ್ • ಪಾರದರ್ಶಕ ಬಿಲ್ಲಿಂಗ್",
    pause: "ವಿರಾಮ",
    resume: "ಮುಂದುವರಿಸಿ",
    timeLogged: "ಕೆಲಸ ಮಾಡಿದ ಸಮಯ",
    meterCostSoFar: "ಇಲ್ಲಿಯವರೆಗಿನ ಶುಲ್ಕ",
    baseRateTag: "@ ₹950/ಗಂಟೆ ದರ",
    siteScopeTitle: "ಸೈಟ್ ವಿಳಾಸ & ವ್ಯಾಪ್ತಿ",
    inspectionPhotosTitle: "ಸೈಟ್ ತಪಾಸಣೆ ಫೋಟೋಗಳು",
    beforePhoto: "ಸ್ವಚ್ಛತೆಗೆ ಮುನ್ನ",
    duringPhoto: "ಕೆಲಸ ಪ್ರಗತಿಯಲ್ಲಿದೆ",

    calcTitle: "ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    calcHeader: "JCB ಗಂಟೆಗಳು & ಡಂಪರ್ ಟ್ರಿಪ್‌ಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ",
    calcDesc: "ಪ್ಲಾಟ್ ಸ್ವಚ್ಛತೆ, ಲೆವೆಲಿಂಗ್ ಮತ್ತು ತ್ಯಾಜ್ಯ ತೆರವಿಗೆ ತಕ್ಷಣದ ನಿಖರ ಅಂದಾಜು ಪಡೆಯಿರಿ.",
    calcStep1: "1. ಆಸ್ತಿ / ಪ್ಲಾಟ್ ಅಳತೆ ಆರಿಸಿ",
    calcCustom: "ಅಥವಾ ನಿಮ್ಮದೇ ಅಳತೆ:",
    calcStep2: "2. ಪ್ರಸ್ತುತ ಸೈಟ್ ಸ್ಥಿತಿ",
    condWeeds: "ಹುಲ್ಲು & ಕಾಡು ಗಿಡಗಳು",
    condWeedsSub: "ಮೇಲ್ಮೈ ಹುಲ್ಲು ಕೆರೆತ & ಗಿಡಗಳ ಸ್ವಚ್ಛತೆ",
    condBushes: "ದಟ್ಟ ಪೊದೆಗಳು & ಮರದ ಬೇರುಗಳು",
    condBushesSub: "ಆಳವಾದ ಬೇರು ಕಿತ್ತುಹಾಕುವುದು & ನೆಲ ಸ್ವಚ್ಛತೆ",
    condDebris: "ಕಟ್ಟಡ & ಕಾಂಕ್ರೀಟ್ ತ್ಯಾಜ್ಯ",
    condDebrisSub: "ಭಾರವಾದ ಕಲ್ಲು-ಮಣ್ಣು, ಇಟ್ಟಿಗೆ ಚೂರುಗಳ ತೆರವು",
    condLeveling: "ಎತ್ತರ-ತಗ್ಗು ನೆಲ & ಮಣ್ಣಿನ ದಿಬ್ಬಗಳು",
    condLevelingSub: "ಮಣ್ಣು ಸಮತಟ್ಟು & ಗಡಿ ಲೆವೆಲಿಂಗ್",
    calcStep3: "ಟಿಪ್ಪರ್ / ಡಂಪರ್ ಲಾರಿ ಬೇಕೇ?",
    calcStep3Desc: "ತ್ಯಾಜ್ಯವನ್ನು ಸರ್ಕಾರಿ ಅನುಮೋದಿತ ಡಂಪ್‌ಯಾರ್ಡ್‌ಗೆ ಸಾಗಿಸಿ",
    recommendedSetup: "ಶಿಫಾರಸು ಮಾಡಿದ ಸೆಟಪ್",
    machineTime: "ಯಂತ್ರದ ಸಮಯ",
    dumperTripsMetric: "ಡಂಪರ್ ಟ್ರಿಪ್‌ಗಳು",
    budgetEst: "ಅಂದಾಜು ಬಜೆಟ್",
    fuelDriverIncluded: "ಡೀಸೆಲ್ & ಚಾಲಕರ ಶುಲ್ಕ ಸೇರಿದೆ",
    varianceNotice: "ನೆಲದ ಗಡಸುತನಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಸಮಯ ±15% ಬದಲಾಗಬಹುದು.",
    applyEstimateBtn: "ಬುಕಿಂಗ್‌ಗೆ ಅನ್ವಯಿಸಿ",

    supportHeader: "24/7 ಸೈಟ್ ಡಿಸ್ಪ್ಯಾಚ್ ಹೆಲ್ಪ್‌ಲೈನ್",
    supportTitle: "ಸೈಟ್ ಅಥವಾ ಬುಕಿಂಗ್ ಸಹಾಯ ಬೇಕೇ?",
    supportDesc: "ಯಂತ್ರ ಚಾಲಕರ ಸಮನ್ವಯ, ದೊಡ್ಡ ಸೈಟ್ ಕ್ಲೀನಿಂಗ್ ಮಾತುಕತೆಗೆ ನಮ್ಮ ಮ್ಯಾನೇಜರ್‌ಗಳು ಸದಾ ಲಭ್ಯವಿದ್ದಾರೆ.",
    callDispatchBtn: "ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ",
    whatsAppBtn: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಮೆಸೇಜ್ ಮಾಡಿ",
    guaranteeTitle: "ಡಿಗ್‌ಮಿತ್ರ ಭರವಸೆಗಳು",
    g1Title: "ಪರಿಶೀಲಿತ & ವಿಮೆ ಹೊಂದಿರುವ ಚಾಲಕರು",
    g1Desc: "ಎಲ್ಲಾ JCB ಮಾಲೀಕರು ಮತ್ತು ಚಾಲಕರು ಪರಿಶೀಲಿತ ಲೈಸೆನ್ಸ್ ಹಾಗೂ ಕಮರ್ಷಿಯಲ್ ವಿಮೆ ಹೊಂದಿರುತ್ತಾರೆ.",
    g2Title: "ಡಿಜಿಟಲ್ ಅವರ್-ಮೀಟರ್ ರಕ್ಷಣೆ",
    g2Desc: "ಯಂತ್ರ ನಿಜವಾಗಿ ಕೆಲಸ ಮಾಡಿದ ಸಮಯಕ್ಕೆ ಮಾತ್ರ ಹಣ ಪಾವತಿಸಿ. ಹೆಚ್ಚುವರಿ ಶುಲ್ಕವಿರುವುದಿಲ್ಲ.",
    g3Title: "ಕಾನೂನುಬದ್ಧ ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ",
    g3Desc: "ಕಟ್ಟಡ ತ್ಯಾಜ್ಯವನ್ನು ಕೇವಲ ಬಿಬಿಎಂಪಿ/ಸರ್ಕಾರಿ ನಿಯೋಜಿತ ಡಂಪಿಂಗ್ ಯಾರ್ಡ್‌ಗೆ ಮಾತ್ರ ಸಾಗಿಸಲಾಗುತ್ತದೆ.",
    faqTitle: "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು (FAQ)",
  },

  // Hindi (हिन्दी)
  hi: {
    appTitle: "डिगमित्रा",
    appSubtitle: "JCB साइट और प्रॉपर्टी सफाई",
    gpsDetecting: "साइट लोकेशन खोजी जा रही है...",
    gpsButton: "GPS",
    gpsAcquiring: "सटीक GPS लोकेशन खोजी जा रही है...",
    gpsPermissionNotice: "अपनी साइट और नजदीकी JCB खोजने के लिए GPS अनुमति दें",
    gpsSuccess: "सटीक GPS लोकेशन मिल गई",
    gpsError: "GPS नहीं मिला। डिफ़ॉल्ट क्षेत्र दिखाया जा रहा है।",
    locationPlaceholder: "प्लॉट पता, लैंडमार्क या पिनकोड दर्ज करें",
    changeLocation: "स्थान बदलें",

    tabBook: "JCB बुक करें",
    tabBookSub: "साइट सफाई",
    tabTracking: "लाइव काम",
    tabTrackingSub: "ट्रैकर",
    tabCalc: "साइट कैलकुलेटर",
    tabCalcSub: "अनुमान",
    tabSupport: "हेल्पलाइन",
    tabSupportSub: "सहायता",

    arrivalBadge: "⚡ 60 मिनट में साइट पर पहुंचेगा",
    activeMachines: "आपके पास 14 मशीनें सक्रिय हैं",
    heroTitle: "प्रॉपर्टी सफाई और मलबा हटाने के लिए JCB बुक करें",
    heroSubtitle: "जंगली झाड़ियां हटाएं, प्लॉट समतल करें और मलबा बाहर फिंकवाएं।",

    stepServicesTitle: "1. सफाई / साइट सेवा चुनें",
    stepServicesTap: "चुनने के लिए टैप करें",
    srvPlotClearing: "प्लॉट और घास-फूस सफाई",
    srvPlotClearingSub: "जंगली झाड़ियां, घास और जड़ें उखाड़ना",
    srvPlotClearingBadge: "सर्वाधिक बुक",
    srvDebris: "मलबा और कंक्रीट निष्कासन",
    srvDebrisSub: "मलबे की सफाई + टिपर ट्रक लोडिंग",
    srvDebrisBadge: "ट्रक विकल्प",
    srvLeveling: "साइट समतलीकरण और लेवलिंग",
    srvLevelingSub: "ऊबड़-खाबड़ जमीन बराबर करना और ढलान तैयारी",
    srvLevelingBadge: "नींव हेतु",
    srvTrenching: "खाई और नाली खुदाई",
    srvTrenchingSub: "सीमा नाली, पानी पाइप और केबल गड्ढा",
    srvTrenchingBadge: "सटीक",

    stepDimensionsTitle: "2. प्लॉट / प्रॉपर्टी का आकार",
    useEstimator: "कैलकुलेटर प्रयोग करें",
    estDuration: "अनुमानित समय:",
    hoursLabel: "घंटे",

    tipperTitle: "टिपर / डंपर ट्रक जोड़ें",
    tipperSub: "कचरा और मलबा साइट से बाहर डंपयार्ड तक पहुंचाएं",
    tipperDetails: "6-पहिया डंपर (300 घन फीट)",
    tipperPrice: "₹1,800 प्रति ट्रिप (डंप शुल्क शामिल)",
    tripLabel: "ट्रिप",
    tripsLabel: "ट्रिप",

    stepMachinesTitle: "3. मशीन और ऑपरेटर चुनें",
    perHour: "/घंटा",
    minsAway: "मिनट दूर",
    siteCleaningsDone: "साइट सफाई पूरी की",

    stepScheduleTitle: "4. आपको कब चाहिए?",
    rightNow: "अभी तुरंत",
    rightNowSub: "मशीन ~35-50 मिनट में पहुंचेगी",
    tomorrow: "कल सुबह",
    tomorrowSub: "सुबह का समय (08:00 AM)",

    estTotal: "अनुमानित कुल राशि",
    confirmJcb: "JCB पक्का करें",
    truckTripsShort: "ट्रक",

    bookingConfirmedBadge: "बुकिंग कन्फर्म",
    bookingConfirmedTitle: "JCB आपकी साइट के लिए रवाना!",
    bookingIdLabel: "बुकिंग आईडी",
    serviceLabel: "सेवा:",
    machineLabel: "मशीन:",
    durationLabel: "समय:",
    debrisDumperLabel: "मलबा डंपर ट्रक:",
    operatorAlertText: "ऑपरेटर रमेश कुमार को सूचित कर दिया गया है। वे 5 मिनट में कॉल करेंगे।",
    trackOperatorBtn: "ऑपरेटर ट्रैक करें",
    callOperatorBtn: "ऑपरेटर को कॉल करें",

    liveJobTitle: "लाइव काम #JCB-8842",
    siteCleaningTag: "साइट सफाई",
    statusEnRoute: "🚜 ऑपरेटर रास्ते में है (12 मिनट में पहुंचेगा)",
    statusWorking: "🏗️ मशीन साइट साफ कर रही है",
    statusDone: "✅ साइट पूरी तरह साफ हो गई",
    stepDispatched: "रवाना",
    stepClearing: "सफाई जारी",
    stepCompleted: "पूर्ण",
    verifiedOperatorTag: "सत्यापित ऑपरेटर और बीमाकृत",
    callOperator: "ऑपरेटर को कॉल करें",
    whatsApp: "व्हाट्सएप",
    digitalHourMeter: "डिजिटल ऑवर-मीटर",
    hourMeterDesc: "लाइव वर्किंग मीटर • पारदर्शी बिलिंग",
    pause: "रोकें",
    resume: "शुरू करें",
    timeLogged: "काम का समय",
    meterCostSoFar: "अब तक का बिल",
    baseRateTag: "@ ₹950/घंटा दर",
    siteScopeTitle: "साइट का पता और विवरण",
    inspectionPhotosTitle: "साइट निरीक्षण फोटो",
    beforePhoto: "सफाई से पहले",
    duringPhoto: "काम प्रगति पर",

    calcTitle: "साइट सफाई कैलकुलेटर",
    calcHeader: "JCB घंटे और डंपर ट्रिप का हिसाब लगाएं",
    calcDesc: "प्लॉट सफाई, समतलीकरण और मलबा हटाने का तुरंत सटीक अनुमान पाएं।",
    calcStep1: "1. प्लॉट का आकार चुनें",
    calcCustom: "या अपना आकार दर्ज करें:",
    calcStep2: "2. वर्तमान साइट की स्थिति",
    condWeeds: "घास और जंगली पौधे",
    condWeedsSub: "ऊपरी घास की सफाई और छिलाई",
    condBushes: "घनी झाड़ियां और छोटी जड़ें",
    condBushesSub: "जड़ें उखाड़ना और जमीन साफ करना",
    condDebris: "इमारती मलबा और कंक्रीट",
    condDebrisSub: "भारी ईंट-पत्थर और मलबा उठाना",
    condLeveling: "ऊबड़-खाबड़ जमीन और मिट्टी के टीले",
    condLevelingSub: "मिट्टी कटाई-भराई और लेवलिंग",
    calcStep3: "टिपर / डंपर ट्रक चाहिए?",
    calcStep3Desc: "मलबा सरकारी डंपिंग यार्ड तक ले जाएं",
    recommendedSetup: "सुझाई गई मशीन",
    machineTime: "मशीन समय",
    dumperTripsMetric: "डंपर ट्रिप",
    budgetEst: "अनुमानित बजट",
    fuelDriverIncluded: "ईंधन और ड्राइवर खर्च शामिल",
    varianceNotice: "मिट्टी की कठोरता के अनुसार समय ±15% बदल सकता है।",
    applyEstimateBtn: "बुकिंग में जोड़ें",

    supportHeader: "24/7 साइट डिस्पैच हेल्पलाइन",
    supportTitle: "साइट या बुकिंग में मदद चाहिए?",
    supportDesc: "हमारे भारी मशीनरी प्रबंधक ऑपरेटर समन्वय और साइट सफाई सहायता के लिए उपलब्ध हैं।",
    callDispatchBtn: "डिस्पैच को कॉल करें",
    whatsAppBtn: "व्हाट्सएप पर संपर्क करें",
    guaranteeTitle: "डिगमित्रा सुरक्षा और वादे",
    g1Title: "सत्यापित और बीमाकृत ऑपरेटर",
    g1Desc: "सभी मशीन मालिकों और ऑपरेटरों की पृष्ठभूमि और कमर्शियल बीमा सत्यापित है।",
    g2Title: "डिजिटल ऑवर-मीटर सुरक्षा",
    g2Desc: "केवल वास्तविक काम के समय का भुगतान करें। खाली बैठने का कोई चार्ज नहीं।",
    g3Title: "कानूनी मलबा निस्तारण",
    g3Desc: "मलबा केवल सरकार द्वारा मान्यता प्राप्त लैंडफिल में ही डाला जाता है।",
    faqTitle: "अक्सर पूछे जाने वाले सवाल",
  },

  // Telugu (తెలుగు)
  te: {
    appTitle: "డిగ్‌మిత్ర",
    appSubtitle: "JCB సైట్ & ప్రాపర్టీ క్లీనింగ్",
    gpsDetecting: "సైట్ లొకేషన్ గుర్తిస్తోంది...",
    gpsButton: "GPS",
    gpsAcquiring: "ఖచ్చితమైన GPS లొకేషన్ లభిస్తోంది...",
    gpsPermissionNotice: "మీ సైట్ మరియు సమీప JCB కోసం GPS అనుమతించండి",
    gpsSuccess: "ఖచ్చితమైన GPS లొకేషన్ దొరికింది",
    gpsError: "GPS లభించలేదు. డిఫాల్ట్ ప్రాంతం చూపిస్తున్నాము.",
    locationPlaceholder: "ప్లాట్ చిరునామా లేదా పిన్‌కోడ్ నమోదు చేయండి",
    changeLocation: "లొకేషన్ మార్చండి",

    tabBook: "JCB బుకింగ్",
    tabBookSub: "సైట్ క్లీనింగ్",
    tabTracking: "లైవ్ వర్క్",
    tabTrackingSub: "ట్రాకర్",
    tabCalc: "సైట్ లెక్క",
    tabCalcSub: "అంచనా",
    tabSupport: "హెల్ప్‌లైన్",
    tabSupportSub: "సహాయం",

    arrivalBadge: "⚡ 60 నిమిషాల్లో సైట్ చేరుకుంటుంది",
    activeMachines: "మీ సమీపంలో 14 యంత్రాలు అందుబాటులో ఉన్నాయి",
    heroTitle: "సైట్ శుభ్రత మరియు వ్యర్థాల తొలగింపునకు JCB బుక్ చేయండి",
    heroSubtitle: "పిచ్చి మొక్కల తొలగింపు, ప్లాట్ లెవలింగ్ మరియు వ్యర్థాలను తొలగించండి.",

    stepServicesTitle: "1. క్లీనింగ్ / సైట్ సేవను ఎంచుకోండి",
    stepServicesTap: "ఎంచుకోవడానికి నొక్కండి",
    srvPlotClearing: "ప్లాట్ & పిచ్చిమొక్కల క్లీనింగ్",
    srvPlotClearingSub: "పొదలు, గడ్డి మరియు వేర్ల తొలగింపు",
    srvPlotClearingBadge: "ఎక్కువ బుక్ అయినది",
    srvDebris: "శిథిలాలు & వ్యర్థాల తొలగింపు",
    srvDebrisSub: "భవన వ్యర్థాలు + టిప్పర్ లారీ లోడింగ్",
    srvDebrisBadge: "లారీ ఎంపిక",
    srvLeveling: "సైట్ లెవలింగ్ & గ్రేడింగ్",
    srvLevelingSub: "ఎత్తుపల్లాలు సరిచేయడం & నేల సమాంతరీకరణ",
    srvLevelingBadge: "పునాదికి",
    srvTrenching: "కాలువలు & కందకాలు తవ్వడం",
    srvTrenchingSub: "సరిహద్దు కాలువ, నీటి పైపుల గుంతలు",
    srvTrenchingBadge: "ఖచ్చితమైనది",

    stepDimensionsTitle: "2. ప్లాట్ / ఆస్తి కొలతలు",
    useEstimator: "కాలిక్యులేటర్ వాడండి",
    estDuration: "అంచనా సమయం:",
    hoursLabel: "గంటలు",

    tipperTitle: "టిప్పర్ / డంపర్ లారీ జోడించండి",
    tipperSub: "వ్యర్థాలను సైట్ నుండి బయటకు డంపింగ్ యార్డ్‌కు తరలించండి",
    tipperDetails: "6-వీలర్ డంపర్ (300 ఘనపుటడుగులు)",
    tipperPrice: "ట్రిప్పుకు ₹1,800 (డంప్ రుసుము కలిపి)",
    tripLabel: "ట్రిప్",
    tripsLabel: "ట్రిప్పులు",

    stepMachinesTitle: "3. యంత్రం & ఆపరేటర్‌ను ఎంచుకోండి",
    perHour: "/గంటకు",
    minsAway: "నిమిషాల దూరం",
    siteCleaningsDone: "సైట్ పనులు పూర్తి",

    stepScheduleTitle: "4. మీకు ఎప్పుడు కావాలి?",
    rightNow: "ఇప్పుడే వెంటనే",
    rightNowSub: "యంత్రం ~35-50 నిమిషాల్లో వస్తుంది",
    tomorrow: "రేపు ఉదయం",
    tomorrowSub: "ఉదయం సమయం (08:00 AM)",

    estTotal: "అంచనా మొత్తం",
    confirmJcb: "JCB కన్ఫర్మ్ చేయండి",
    truckTripsShort: "లారీ",

    bookingConfirmedBadge: "బుకింగ్ ఖరారైంది",
    bookingConfirmedTitle: "JCB మీ సైట్ వైపు బయలుదేరింది!",
    bookingIdLabel: "బుకింగ్ ID",
    serviceLabel: "సేవ:",
    machineLabel: "యంత్రం:",
    durationLabel: "సమయం:",
    debrisDumperLabel: "డంపర్ లారీ:",
    operatorAlertText: "ఆపరేటర్ రమేష్ కుమార్‌కు సమాచారం అందింది. 5 నిమిషాల్లో కాల్ చేస్తారు.",
    trackOperatorBtn: "ఆపరేటర్‌ను ట్రాక్ చేయండి",
    callOperatorBtn: "కాల్ చేయండి",

    liveJobTitle: "లైవ్ వర్క్ #JCB-8842",
    siteCleaningTag: "సైట్ క్లీనింగ్",
    statusEnRoute: "🚜 ఆపరేటర్ వస్తున్నారు (12 నిమిషాల్లో చేరుకుంటారు)",
    statusWorking: "🏗️ సైట్ క్లీనింగ్ జరుగుతోంది",
    statusDone: "✅ సైట్ శుభ్రం పూర్తయింది",
    stepDispatched: "బయలుదేరింది",
    stepClearing: "పని జరుగుతోంది",
    stepCompleted: "పూర్తయింది",
    verifiedOperatorTag: "ధృవీకరించబడిన ఆపరేటర్ & బీమా",
    callOperator: "కాల్ చేయండి",
    whatsApp: "వాట్సాప్",
    digitalHourMeter: "డిజిటల్ అవర్-మీటర్",
    hourMeterDesc: "లైవ్ వర్కింగ్ మీటర్ • పారదర్శక బిల్లింగ్",
    pause: "ఆపండి",
    resume: "కొనసాగించండి",
    timeLogged: "పని చేసిన సమయం",
    meterCostSoFar: "ఇప్పటివరకు బిల్లు",
    baseRateTag: "@ ₹950/గంట రేటు",
    siteScopeTitle: "సైట్ లొకేషన్ & వివరాలు",
    inspectionPhotosTitle: "సైట్ ఫోటోలు",
    beforePhoto: "క్లీనింగ్‌కు ముందు",
    duringPhoto: "పని జరుగుతున్నప్పుడు",

    calcTitle: "సైట్ క్లీనింగ్ కాలిక్యులేటర్",
    calcHeader: "JCB గంటలు & డంపర్ ట్రిప్పులను లెక్కించండి",
    calcDesc: "ప్లాట్ క్లీనింగ్, లెవలింగ్ మరియు వ్యర్థాల తొలగింపునకు ఖచ్చితమైన అంచనా పొందండి.",
    calcStep1: "1. ప్లాట్ సైజు ఎంచుకోండి",
    calcCustom: "లేదా మీ కొలత నమోదు చేయండి:",
    calcStep2: "2. ప్రస్తుత సైట్ పరిస్థితి",
    condWeeds: "గడ్డి & పిచ్చి మొక్కలు",
    condWeedsSub: "పైపై గడ్డి క్లీనింగ్",
    condBushes: "దట్టమైన పొదలు & చిన్న వేర్లు",
    condBushesSub: "వేర్ల తొలగింపు & భూమి చదును",
    condDebris: "భవన శిథిలాలు & కంకర",
    condDebrisSub: "ఇటుకలు, రాళ్ళు & వ్యర్థాల తొలగింపు",
    condLeveling: "ఎగుడుదిగుడు నేల & మట్టి దిబ్బలు",
    condLevelingSub: "మట్టి లెవలింగ్ & సరిహద్దు సమాంతరీకరణ",
    calcStep3: "డంపర్ లారీ కావాలా?",
    calcStep3Desc: "వ్యర్థాలను అధికారిక డంపింగ్ యార్డుకు తరలించండి",
    recommendedSetup: "సిఫార్సు చేసిన యంత్రం",
    machineTime: "యంత్ర సమయం",
    dumperTripsMetric: "డంపర్ ట్రిప్పులు",
    budgetEst: "అంచనా బడ్జెట్",
    fuelDriverIncluded: "ఇంధనం & డ్రైవర్ చార్జీలు కలిపి",
    varianceNotice: "నేల స్వభావాన్ని బట్టి సమయం ±15% మారవచ్చు.",
    applyEstimateBtn: "బుకింగ్‌కు వర్తింపజేయండి",

    supportHeader: "24/7 సైట్ డిస్పాచ్ హెల్ప్‌లైన్",
    supportTitle: "సహాయం కావాలా?",
    supportDesc: "ఆపరేటర్ సమన్వయం మరియు సైట్ క్లీనింగ్ సహాయానికి మా మేనేజర్లు సిద్ధంగా ఉన్నారు.",
    callDispatchBtn: "కాల్ చేయండి",
    whatsAppBtn: "వాట్సాప్ మెసేజ్ చేయండి",
    guaranteeTitle: "డిగ్‌మిత్ర హామీలు",
    g1Title: "ధృవీకరించబడిన ఆపరేటర్లు",
    g1Desc: "అందరూ లైసెన్స్ మరియు కమర్షియల్ బీమా కలిగి ఉంటారు.",
    g2Title: "డిజిటల్ మీటర్ రక్షణ",
    g2Desc: "యంత్రం పనిచేసిన సమయానికి మాత్రమే చెల్లించండి.",
    g3Title: "చట్టబద్ధమైన వ్యర్థాల తరలింపు",
    g3Desc: "చెత్తను ప్రభుత్వ అనుమతి పొందిన డంప్‌యార్డులకే తరలిస్తాము.",
    faqTitle: "తరచుగా అడిగే ప్రశ్నలు (FAQ)",
  },

  // Tamil (தமிழ்)
  ta: {
    appTitle: "டிக்மித்ரா",
    appSubtitle: "JCB சைட் & நிலம் சுத்தம் செய்தல்",
    gpsDetecting: "தளத்தின் இருப்பிடம் கண்டறியப்படுகிறது...",
    gpsButton: "GPS",
    gpsAcquiring: "துல்லியமான GPS இருப்பிடம் பெறப்படுகிறது...",
    gpsPermissionNotice: "உங்கள் தளம் மற்றும் அருகிலுள்ள JCB-ஐக் கண்டறிய GPS அனுமதியை வழங்கவும்",
    gpsSuccess: "துல்லியமான GPS இருப்பிடம் உறுதி செய்யப்பட்டது",
    gpsError: "GPS கிடைக்கவில்லை. பொதுவான பகுதி காட்டப்படுகிறது.",
    locationPlaceholder: "நிலத்தின் முகவரி, அடையாளக்குறி அல்லது பின்கோடு",
    changeLocation: "இடத்தை மாற்றவும்",

    tabBook: "JCB முன்பதிவு",
    tabBookSub: "நிலம் சுத்தம்",
    tabTracking: "நேரலை பணி",
    tabTrackingSub: "டிராக்கர்",
    tabCalc: "தள கணக்கீடு",
    tabCalcSub: "மதிப்பீடு",
    tabSupport: "உதவி எண்",
    tabSupportSub: "ஆதரவு",

    arrivalBadge: "⚡ 60 நிமிடங்களில் தளத்தை அடையும்",
    activeMachines: "உங்களுக்கு அருகில் 14 இயந்திரங்கள் தயார்",
    heroTitle: "நிலம் சுத்தம் மற்றும் குப்பைகள் அகற்ற JCB முன்பதிவு",
    heroSubtitle: "காட்டுச்செடிகள் அகற்றுதல், நிலத்தை சமப்படுத்துதல் மற்றும் கழிவுகளை அகற்றவும்.",

    stepServicesTitle: "1. சுத்தம் செய்யும் சேவையைத் தேர்ந்தெடுக்கவும்",
    stepServicesTap: "தேர்ந்தெடுக்க தட்டவும்",
    srvPlotClearing: "நிலம் & களைச்செடிகள் சுத்தம்",
    srvPlotClearingSub: "காட்டு புதர்கள், புல் & வேர்கள் அகற்றுதல்",
    srvPlotClearingBadge: "அதிக முன்பதிவு",
    srvDebris: "கட்டிடக் குப்பை & கழிவுகள் அகற்றுதல்",
    srvDebrisSub: "இடிபாட்டுக் கழிவுகள் + டிப்பர் லாரி ஏற்றுதல்",
    srvDebrisBadge: "லாரி சேர்க்கை",
    srvLeveling: "நிலம் சமப்படுத்துதல் & கிரேடிங்",
    srvLevelingSub: "மேடு பள்ளம் சமன் செய்து தளம் அமைத்தல்",
    srvLevelingBadge: "அடித்தளத்திற்கு",
    srvTrenching: "குழி & வடிகால் தோண்டுதல்",
    srvTrenchingSub: "எல்லை வாய்க்கால், குழாய் மற்றும் கேபிள் பள்ளம்",
    srvTrenchingBadge: "துல்லியமானது",

    stepDimensionsTitle: "2. நிலத்தின் அளவு",
    useEstimator: "கால்குலேட்டர் பயன்படுத்தவும்",
    estDuration: "மதிப்பிடப்பட்ட நேரம்:",
    hoursLabel: "மணிநேரம்",

    tipperTitle: "டிப்பர் / டம்பர் லாரி சேர்க்கவும்",
    tipperSub: "அகற்றப்பட்ட குப்பை மற்றும் கழிவுகளை குப்பைக்கிடங்கிற்கு கொண்டு செல்லவும்",
    tipperDetails: "6-சக்கர டிப்பர் (300 கன அடி)",
    tipperPrice: "ஒரு டிரிப்பிற்கு ₹1,800 (கொட்டும் கட்டணம் உட்பட)",
    tripLabel: "டிரிப்",
    tripsLabel: "டிரிப்புகள்",

    stepMachinesTitle: "3. இயந்திரம் மற்றும் ஓட்டுநரைத் தேர்வு செய்யவும்",
    perHour: "/மணிக்கு",
    minsAway: "நிமிட தொலைவில்",
    siteCleaningsDone: "பணிகள் நிறைவு",

    stepScheduleTitle: "4. உங்களுக்கு எப்போது வேண்டும்?",
    rightNow: "உடனே இப்போது",
    rightNowSub: "இயந்திரம் ~35-50 நிமிடங்களில் வரும்",
    tomorrow: "நாளை காலை",
    tomorrowSub: "காலை நேரம் (08:00 AM)",

    estTotal: "மதிப்பிடப்பட்ட மொத்த தொகை",
    confirmJcb: "JCB உறுதிப்படுத்தவும்",
    truckTripsShort: "லாரி",

    bookingConfirmedBadge: "முன்பதிவு உறுதியானது",
    bookingConfirmedTitle: "JCB உங்கள் தளத்திற்கு புறப்பட்டது!",
    bookingIdLabel: "முன்பதிவு எண்",
    serviceLabel: "சேவை:",
    machineLabel: "இயந்திரம்:",
    durationLabel: "நேரம்:",
    debrisDumperLabel: "குப்பை லாரி:",
    operatorAlertText: "ஓட்டுநர் ரமேஷ் குமாருக்கு தகவல் தெரிவிக்கப்பட்டுள்ளது. 5 நிமிடங்களில் அழைப்பார்.",
    trackOperatorBtn: "ஓட்டுநரை கண்காணிக்கவும்",
    callOperatorBtn: "அழைக்கவும்",

    liveJobTitle: "நேரலை பணி #JCB-8842",
    siteCleaningTag: "நிலம் சுத்தம்",
    statusEnRoute: "🚜 ஓட்டுநர் புறப்பட்டுவிட்டார் (12 நிமிடங்களில் வருவார்)",
    statusWorking: "🏗️ இயந்திரம் சுத்தம் செய்கிறது",
    statusDone: "✅ தளம் முற்றிலும் சுத்தம் செய்யப்பட்டது",
    stepDispatched: "புறப்பட்டது",
    stepClearing: "சுத்தம் நடக்கிறது",
    stepCompleted: "முடிந்தது",
    verifiedOperatorTag: "சரிபார்க்கப்பட்ட ஓட்டுநர் & காப்பீடு",
    callOperator: "அழைக்கவும்",
    whatsApp: "வாட்ஸ்அப்",
    digitalHourMeter: "டிஜிட்டல் ஹவர்-மீட்டர்",
    hourMeterDesc: "நேரலை பணி மீட்டர் • வெளிப்படையான பில்லிங்",
    pause: "நிறுத்து",
    resume: "தொடரவும்",
    timeLogged: "வேலை செய்த நேரம்",
    meterCostSoFar: "இதுவரையிலான கட்டணம்",
    baseRateTag: "@ ₹950/மணி வீதம்",
    siteScopeTitle: "தளத்தின் முகவரி & விவரம்",
    inspectionPhotosTitle: "தள ஆய்வு புகைப்படங்கள்",
    beforePhoto: "சுத்தம் செய்வதற்கு முன்",
    duringPhoto: "பணி நடக்கிறது",

    calcTitle: "தள கணக்கீட்டு கால்குலேட்டர்",
    calcHeader: "JCB மணிநேரம் & டிப்பர் டிரிப்புகளை கணக்கிடுங்கள்",
    calcDesc: "நிலம் சுத்தம், சமப்படுத்துதல் மற்றும் குப்பைகள் அகற்ற துல்லிய மதிப்பீடு பெறுங்கள்.",
    calcStep1: "1. நிலத்தின் அளவைத் தேர்வு செய்யவும்",
    calcCustom: "அல்லது உங்கள் அளவை உள்ளிடவும்:",
    calcStep2: "2. தற்போதைய நிலத்தின் நிலைமை",
    condWeeds: "புல் & காட்டுச்செடிகள்",
    condWeedsSub: "மேற்பரப்பு புல் அகற்றுதல்",
    condBushes: "அடர்ந்த புதர்கள் & மர வேர்கள்",
    condBushesSub: "ஆழமான வேர்கள் அகற்றுதல்",
    condDebris: "கட்டிட இடிபாடுகள் & கற்கள்",
    condDebrisSub: "கற்கள் மற்றும் குப்பைகள் அகற்றுதல்",
    condLeveling: "மேடுபள்ள நிலம் & மண் மேடுகள்",
    condLevelingSub: "மண் சமப்படுத்துதல் & கிரேடிங்",
    calcStep3: "டிப்பர் லாரி தேவையா?",
    calcStep3Desc: "கழிவுகளை அரசு அனுமதிக்கப்பட்ட இடத்திற்கு கொண்டு செல்லவும்",
    recommendedSetup: "பரிந்துரைக்கப்பட்ட இயந்திரம்",
    machineTime: "இயந்திர நேரம்",
    dumperTripsMetric: "டிப்பர் டிரிப்புகள்",
    budgetEst: "மதிப்பிடப்பட்ட பட்ஜெட்",
    fuelDriverIncluded: "டீசல் மற்றும் ஓட்டுநர் கட்டணம் உட்பட",
    varianceNotice: "நிலத்தின் கடினத்தன்மையைப் பொறுத்து நேரம் ±15% மாறலாம்.",
    applyEstimateBtn: "முன்பதிவில் சேர்க்கவும்",

    supportHeader: "24/7 உதவி எண்",
    supportTitle: "உதவி தேவையா?",
    supportDesc: "இயந்திர ஓட்டுநர் ஒருங்கிணைப்பு மற்றும் தள உதவிக்கு நாங்கள் எப்போதும் தயார்.",
    callDispatchBtn: "அழைக்கவும்",
    whatsAppBtn: "வாட்ஸ்அப் செய்யவும்",
    guaranteeTitle: "டிக்மித்ரா உத்தரவாதங்கள்",
    g1Title: "சரிபார்க்கப்பட்ட ஓட்டுநர்கள்",
    g1Desc: "அனைத்து ஓட்டுநர்களும் லைசென்ஸ் மற்றும் வணிக காப்பீடு பெற்றுள்ளனர்.",
    g2Title: "டிஜிட்டல் மீட்டர் பாதுகாப்பு",
    g2Desc: "இயந்திரம் இயங்கிய நேரத்திற்கு மட்டுமே கட்டணம்.",
    g3Title: "சட்டப்பூர்வ கழிவு அகற்றல்",
    g3Desc: "அரசு அனுமதிக்கப்பட்ட இடங்களில் மட்டுமே குப்பைகள் கொட்டப்படும்.",
    faqTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
  },
};
