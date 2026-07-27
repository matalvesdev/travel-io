-- Add fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add budget to trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  limit_amount DECIMAL(12, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, month, year)
);

CREATE INDEX IF NOT EXISTS budgets_user_month_year_idx ON budgets (user_id, month, year);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  confirmation_code TEXT,
  notes TEXT,
  airline TEXT,
  flight_number TEXT,
  origin TEXT,
  destination TEXT,
  departure_date DATE,
  arrival_date DATE,
  departure_time TEXT,
  arrival_time TEXT,
  hotel_name TEXT,
  hotel_address TEXT,
  check_in DATE,
  check_out DATE,
  nights INTEGER,
  room_type TEXT,
  price DECIMAL(12, 2),
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_trip_id_idx ON bookings (trip_id);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
