import {
  pgTable,
  uuid,
  text,
  numeric,
  doublePrecision,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

// 1. Registered Vehicles Table in Supabase
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  plateNumber: text("plate_number").notNull().unique(),
  vehicleType: text("vehicle_type").notNull(),
  category: text("category").notNull(),
  operatorName: text("operator_name").notNull(),
  operatorPhone: text("operator_phone").notNull(),
  ratePerHour: numeric("rate_per_hour").notNull(),
  driverBata: numeric("driver_bata").default("0"),
  minPayment: numeric("min_payment").default("0"),
  driverExperienceYears: numeric("driver_experience_years").default("0"),
  insuranceEndDate: date("insurance_end_date"),
  insuranceDocUrl: text("insurance_doc_url"),
  currentLat: doublePrecision("current_lat").default(13.312278),
  currentLng: doublePrecision("current_lng").default(77.130652),
  status: text("status").default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 2. Customer Bookings Table in Supabase
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingRef: text("booking_ref").notNull().unique(),
  customerPhone: text("customer_phone").notNull(),
  siteAddress: text("site_address").notNull(),
  siteLat: doublePrecision("site_lat").notNull(),
  siteLng: doublePrecision("site_lng").notNull(),
  siteDimension: text("site_dimension").notNull(),
  workType: text("work_type").notNull(),
  selectedJcbType: text("selected_jcb_type").notNull(),
  selectedTipperType: text("selected_tipper_type"),
  advanceAmount: numeric("advance_amount").notNull(),
  totalEstimate: numeric("total_estimate").notNull(),
  paymentStatus: text("payment_status").default("pending"),
  jobStatus: text("job_status").default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 3. Live Tracking Table in Supabase
export const liveTracking = pgTable("live_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehiclePlate: text("vehicle_plate").references(() => vehicles.plateNumber),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  speed: numeric("speed").default("0"),
  heading: numeric("heading").default("0"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
