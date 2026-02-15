-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create tables

-- members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_iso TIMESTAMPTZ NOT NULL,
  end_iso TIMESTAMPTZ NOT NULL,
  assignee_ids TEXT[] NOT NULL DEFAULT '{}', -- array of UUIDs as strings for simplicity or UUID[]
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  start_iso TIMESTAMPTZ NOT NULL,
  end_iso TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'off')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS but allow all access (for internal tool simplicity)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON availability_slots FOR ALL USING (true) WITH CHECK (true);

-- 3. Insert Dummy Data

-- Members
INSERT INTO members (id, name, color) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ren', '#3B82F6'),
  ('22222222-2222-2222-2222-222222222222', 'Aoi', '#8B5CF6'),
  ('33333333-3333-3333-3333-333333333333', 'Mei', '#EC4899'),
  ('44444444-4444-4444-4444-444444444444', 'Yuto', '#F59E0B'),
  ('55555555-5555-5555-5555-555555555555', 'Hana', '#10B981'),
  ('66666666-6666-6666-6666-666666666666', 'Sora', '#06B6D4'),
  ('77777777-7777-7777-7777-777777777777', 'Kei', '#F97316')
ON CONFLICT (id) DO NOTHING;

-- Initial Events (Example)
-- Note: Dates are relative in JS code but fixed here. For SQL dummy data, let's use current timestamp logic or just leave empty and let user add via UI.
-- Skipping events/availability insert to keep SQL simple. The app should handle empty states gracefully.
