import postgres from "postgres";

const poolerString = "postgresql://postgres.avavshltiiafnxdzrvza:Abhi%407892667467@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
const directString = "postgresql://postgres:Abhi%407892667467@db.avavshltiiafnxdzrvza.supabase.co:5432/postgres";

async function testConnection() {
  console.log("Connecting to Supabase PostgreSQL Database...");
  let sql;
  try {
    sql = postgres(poolerString, { ssl: "require", connect_timeout: 10 });
    const result = await sql`SELECT NOW() as current_time, current_database() as db;`;
    console.log("SUCCESS Connected via Pooler:", result);
  } catch (err) {
    console.warn("Pooler failed, trying direct...", err.message);
    sql = postgres(directString, { ssl: "require", connect_timeout: 10 });
    const result = await sql`SELECT NOW() as current_time, current_database() as db;`;
    console.log("SUCCESS Connected via Direct:", result);
  }

  // Create Tables
  console.log("Creating tables in Supabase...");
  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plate_number TEXT UNIQUE NOT NULL,
      vehicle_type TEXT NOT NULL,
      category TEXT NOT NULL,
      operator_name TEXT NOT NULL,
      operator_phone TEXT NOT NULL,
      rate_per_hour NUMERIC NOT NULL,
      driver_bata NUMERIC DEFAULT 0,
      min_payment NUMERIC DEFAULT 0,
      driver_experience_years NUMERIC DEFAULT 0,
      insurance_end_date DATE,
      insurance_doc_url TEXT,
      vehicle_images TEXT[],
      current_lat DOUBLE PRECISION DEFAULT 13.312278,
      current_lng DOUBLE PRECISION DEFAULT 77.130652,
      status TEXT DEFAULT 'available',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_ref TEXT UNIQUE NOT NULL,
      customer_phone TEXT NOT NULL,
      site_address TEXT NOT NULL,
      site_lat DOUBLE PRECISION NOT NULL,
      site_lng DOUBLE PRECISION NOT NULL,
      site_dimension TEXT NOT NULL,
      work_type TEXT NOT NULL,
      selected_jcb_type TEXT NOT NULL,
      selected_tipper_type TEXT,
      advance_amount NUMERIC NOT NULL,
      total_estimate NUMERIC NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      job_status TEXT DEFAULT 'confirmed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS live_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicle_plate TEXT REFERENCES vehicles(plate_number) ON DELETE CASCADE,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      speed NUMERIC DEFAULT 0,
      heading NUMERIC DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  console.log("✅ Tables created successfully in Supabase!");
  const tables = await sql`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  `;
  console.log("Public tables in your Supabase DB:", tables.map(t => t.table_name));
  await sql.end();
}

testConnection().catch(console.error);
