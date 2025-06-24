# Traveled - Japan Travel Tracker

A modern travel tracking application that allows travelers to Japan to record, visualize, and analyze their travel experiences across all 47 prefectures.

## ✨ Features

### 🗾 Interactive Japan Map
- Click any prefecture to record visits and experiences
- Visual color-coding based on visit types
- Pan and zoom controls for detailed exploration
- Real-time updates reflecting your travel history

### 📊 Travel Analytics Dashboard
- **Progress Tracking**: Visual progress bar showing percentage of Japan explored
- **Visit Statistics**: Total visits, visits this year, and comprehensive metrics
- **Best Score**: Peak experience rating per prefecture
- **Most Visited Prefecture**: Track your favorite destinations
- **Interactive Charts**: Pie charts, bar graphs, and timeline visualizations

### 📝 Visit Records Management
- Detailed table of all prefecture visits
- Multiple visit types per prefecture with year tracking
- Star ratings for memorable experiences (1-5 stars)
- Search and filter capabilities by visit type (recent or highest)
- Export data to CSV for external analysis

### 🎯 Visit Experience Levels

Our system uses 6 distinct experience levels:

- **0 - Never been**: Unvisited prefectures
- **1 - Passed through**: Transit or brief passage
- **2 - Brief stop**: Quick stop (rest area, transfer)
- **3 - Day visit**: Explored attractions in a single day
- **4 - Multi-day stay**: Stayed overnight, deeper exploration
- **5 - Lived there**: Extended residence (work, study, etc.)

### 🚀 Advanced Features

- **Multi-year tracking**: Record multiple visits to the same prefecture across different years
- **Star ratings**: Rate your experiences for prefectures with substantial visits (3+ level)
- **Data persistence**: All data securely stored with user authentication
- **Responsive design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time sync**: Changes reflected instantly across all views

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts for data visualization
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account for backend services

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd traveled
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Add your Supabase URL and keys
```

4. Run the development server:
```bash
bun dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to start tracking your travels!

## 📱 Usage

1. **Sign up/Login** to create your personal travel profile
2. **Click on prefectures** on the interactive map to record visits
3. **Rate your experiences** with our 6-level system
4. **Add star ratings** for memorable stays and experiences
5. **View analytics** to see your travel patterns and progress
6. **Export data** to keep your own records or share achievements

## 🎨 Design Philosophy

Inspired by similar prefecture tracking applications, Traveled focuses on:
- **User Experience**: Intuitive interface with minimal learning curve
- **Data Richness**: Capture detailed travel experiences beyond simple "visited/not visited"
- **Analytics**: Transform travel data into meaningful insights and visualizations
- **Flexibility**: Support various travel styles from brief transits to extended stays

## 🗺️ Inspiration

This project draws inspiration from [JapanEx](https://github.com/ukyouz/JapanEx) and similar prefecture tracking tools, enhanced with modern web technologies and comprehensive analytics features.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests, report bugs, or suggest new features.

---

**Start tracking your Japan adventures today and see your travel story come to life!** 🇯🇵✈️