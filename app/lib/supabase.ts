import { createClient } from "@supabase/supabase-js";

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://avavshltiiafnxdzrvza.supabase.co";
export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_78ELo6p9i6jB6R5S-g7ecw_IdXkirql";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a photo (File or Blob) directly to the online Supabase Storage bucket ('digmitra-photos')
 * Returns the permanent public HTTPS URL stored online in the cloud.
 */
export async function uploadCloudPhoto(
  file: File | Blob,
  folder = "site-photos"
): Promise<string> {
  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const filePath = `${folder}/${uniqueId}.${extension}`;

  const { data, error } = await supabase.storage
    .from("digmitra-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("digmitra-photos")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Save / sync user profile to online Supabase database
 */
export async function syncUserToOnlineDb(user: {
  name: string;
  phone: string;
  role: string;
}) {
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        { onConflict: "phone" }
      )
      .select()
      .single();
    if (error) console.warn("Failed to sync user online:", error.message);
    return data;
  } catch (err) {
    console.warn("User sync error:", err);
  }
}

/**
 * Save new booking to online Supabase database
 */
export async function saveBookingToOnlineDb(booking: {
  bookingRef: string;
  customerName?: string;
  customerPhone: string;
  siteAddress: string;
  siteLat: number;
  siteLng: number;
  accuracy?: number | null;
  siteDimension: string;
  workType: string;
  selectedJcbType: string;
  selectedTipperType?: string;
  advanceAmount: number;
  totalEstimate: number;
  paymentMode?: string;
  photos?: string[];
  tractorRequired?: boolean;
  tractorTotal?: number;
  machineHours?: number;
}) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        booking_ref: booking.bookingRef,
        customer_name: booking.customerName || "Customer",
        customer_phone: booking.customerPhone,
        site_address: booking.siteAddress,
        site_lat: booking.siteLat,
        site_lng: booking.siteLng,
        accuracy: booking.accuracy ?? null,
        site_dimension: booking.siteDimension,
        work_type: booking.workType,
        selected_jcb_type: booking.selectedJcbType,
        selected_tipper_type: booking.selectedTipperType || null,
        advance_amount: booking.advanceAmount,
        total_estimate: booking.totalEstimate,
        payment_mode: booking.paymentMode || "cash_on_spot",
        payment_status: "verified",
        job_status: "confirmed",
        photos: booking.photos || [],
        tractor_required: booking.tractorRequired || false,
        tractor_total: booking.tractorTotal || 0,
        machine_hours: booking.machineHours || 3,
      })
      .select()
      .single();

    if (error) {
      console.error("Online booking insert error:", error);
      throw error;
    }
    console.log("✅ Booking saved online to Supabase:", data);
    return data;
  } catch (err) {
    console.error("Booking save error:", err);
  }
}

/**
 * Save new registered vehicle to online Supabase database
 */
export async function saveVehicleToOnlineDb(vehicle: {
  plateNumber: string;
  vehicleType: string;
  category: string;
  operatorName: string;
  operatorPhone: string;
  ratePerHour: number;
  driverBata: number;
  minPayment: number;
  driverExperienceYears: number;
  insuranceEndDate?: string;
  insuranceDocUrl?: string;
  vehicleImages?: string[];
  currentLat?: number;
  currentLng?: number;
}) {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .upsert(
        {
          plate_number: vehicle.plateNumber,
          vehicle_type: vehicle.vehicleType,
          category: vehicle.category,
          operator_name: vehicle.operatorName,
          operator_phone: vehicle.operatorPhone,
          rate_per_hour: vehicle.ratePerHour,
          driver_bata: vehicle.driverBata,
          min_payment: vehicle.minPayment,
          driver_experience_years: vehicle.driverExperienceYears,
          insurance_end_date: vehicle.insuranceEndDate || null,
          insurance_doc_url: vehicle.insuranceDocUrl || null,
          vehicle_images: vehicle.vehicleImages || [],
          current_lat: vehicle.currentLat || 13.3151,
          current_lng: vehicle.currentLng || 77.1338,
          status: "available",
        },
        { onConflict: "plate_number" }
      )
      .select()
      .single();

    if (error) {
      console.error("Vehicle registration online error:", error);
      throw error;
    }
    console.log("✅ Vehicle registered online in Supabase:", data);
    return data;
  } catch (err) {
    console.error("Vehicle save error:", err);
  }
}

/**
 * Fetch all registered vehicles directly from online Supabase database
 */
export async function fetchVehiclesFromOnlineDb() {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching online vehicles:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Fetch vehicles error:", err);
    return [];
  }
}
