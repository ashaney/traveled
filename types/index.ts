// Types for the travel tracking app

export type VisitRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface Region {
  id: string;
  name: string;
  nameJapanese?: string;
  code?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  regions: Region[];
}

export interface Visit {
  id: string;
  regionId: string;
  countryId: string;
  rating: VisitRating;
  visitYear: number; // Required year for the visit - each visit is for a specific year
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrefectureRating {
  id: string;
  userId: string;
  regionId: string;
  countryId: string;
  starRating: number; // 1-5 star rating for the prefecture overall
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitStats {
  totalRegions: number;
  visitedRegions: number;
  percentageVisited: number;
  ratingBreakdown: Record<VisitRating, number>;
  lastVisit?: number; // year
}

export const RATING_LABELS: Record<VisitRating, string> = {
  0: "Never been",
  1: "Passed through", 
  2: "Brief stop",
  3: "Day visit",
  4: "Multi-day stay",
  5: "Lived there"
};

export const RATING_COLORS: Record<VisitRating, string> = {
  0: "#e5e7eb", // gray-200 - Never been
  1: "#fecaca", // red-200 - Passed through
  2: "#fed7aa", // orange-200 - Brief stop
  3: "#fef08a", // yellow-200 - Day visit
  4: "#bbf7d0", // green-200 - Multi-day stay
  5: "#bfdbfe"  // blue-200 - Lived there
};

export const RATING_COLORS_TAILWIND: Record<VisitRating, string> = {
  0: "bg-gray-200 dark:bg-gray-800",
  1: "bg-red-200 dark:bg-red-900",
  2: "bg-orange-200 dark:bg-orange-900", 
  3: "bg-yellow-200 dark:bg-yellow-900",
  4: "bg-green-200 dark:bg-green-900",
  5: "bg-blue-200 dark:bg-blue-900"
};