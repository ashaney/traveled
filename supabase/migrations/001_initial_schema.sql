-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create countries table
CREATE TABLE countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create regions table (prefectures, states, etc.)
CREATE TABLE regions (
  id TEXT PRIMARY KEY,
  country_id TEXT REFERENCES countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_local TEXT, -- Japanese name, local name, etc.
  region_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table
CREATE TABLE visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  region_id TEXT REFERENCES regions(id) ON DELETE CASCADE,
  country_id TEXT REFERENCES countries(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  visit_year INTEGER CHECK (visit_year >= 1900 AND visit_year <= 2100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one visit per user per region per year
  UNIQUE(user_id, region_id, visit_year)
);

-- Insert initial data for Japan
INSERT INTO countries (id, name, code) VALUES 
('japan', 'Japan', 'JP');

-- Insert all Japanese prefectures
INSERT INTO regions (id, country_id, name, name_local, region_code) VALUES 
('hokkaido', 'japan', 'Hokkaido', '北海道', '01'),
('aomori', 'japan', 'Aomori', '青森県', '02'),
('iwate', 'japan', 'Iwate', '岩手県', '03'),
('miyagi', 'japan', 'Miyagi', '宮城県', '04'),
('akita', 'japan', 'Akita', '秋田県', '05'),
('yamagata', 'japan', 'Yamagata', '山形県', '06'),
('fukushima', 'japan', 'Fukushima', '福島県', '07'),
('ibaraki', 'japan', 'Ibaraki', '茨城県', '08'),
('tochigi', 'japan', 'Tochigi', '栃木県', '09'),
('gunma', 'japan', 'Gunma', '群馬県', '10'),
('saitama', 'japan', 'Saitama', '埼玉県', '11'),
('chiba', 'japan', 'Chiba', '千葉県', '12'),
('tokyo', 'japan', 'Tokyo', '東京都', '13'),
('kanagawa', 'japan', 'Kanagawa', '神奈川県', '14'),
('niigata', 'japan', 'Niigata', '新潟県', '15'),
('toyama', 'japan', 'Toyama', '富山県', '16'),
('ishikawa', 'japan', 'Ishikawa', '石川県', '17'),
('fukui', 'japan', 'Fukui', '福井県', '18'),
('yamanashi', 'japan', 'Yamanashi', '山梨県', '19'),
('nagano', 'japan', 'Nagano', '長野県', '20'),
('gifu', 'japan', 'Gifu', '岐阜県', '21'),
('shizuoka', 'japan', 'Shizuoka', '静岡県', '22'),
('aichi', 'japan', 'Aichi', '愛知県', '23'),
('mie', 'japan', 'Mie', '三重県', '24'),
('shiga', 'japan', 'Shiga', '滋賀県', '25'),
('kyoto', 'japan', 'Kyoto', '京都府', '26'),
('osaka', 'japan', 'Osaka', '大阪府', '27'),
('hyogo', 'japan', 'Hyogo', '兵庫県', '28'),
('nara', 'japan', 'Nara', '奈良県', '29'),
('wakayama', 'japan', 'Wakayama', '和歌山県', '30'),
('tottori', 'japan', 'Tottori', '鳥取県', '31'),
('shimane', 'japan', 'Shimane', '島根県', '32'),
('okayama', 'japan', 'Okayama', '岡山県', '33'),
('hiroshima', 'japan', 'Hiroshima', '広島県', '34'),
('yamaguchi', 'japan', 'Yamaguchi', '山口県', '35'),
('tokushima', 'japan', 'Tokushima', '徳島県', '36'),
('kagawa', 'japan', 'Kagawa', '香川県', '37'),
('ehime', 'japan', 'Ehime', '愛媛県', '38'),
('kochi', 'japan', 'Kochi', '高知県', '39'),
('fukuoka', 'japan', 'Fukuoka', '福岡県', '40'),
('saga', 'japan', 'Saga', '佐賀県', '41'),
('nagasaki', 'japan', 'Nagasaki', '長崎県', '42'),
('kumamoto', 'japan', 'Kumamoto', '熊本県', '43'),
('oita', 'japan', 'Oita', '大分県', '44'),
('miyazaki', 'japan', 'Miyazaki', '宮崎県', '45'),
('kagoshima', 'japan', 'Kagoshima', '鹿児島県', '46'),
('okinawa', 'japan', 'Okinawa', '沖縄県', '47');