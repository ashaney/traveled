Phase 1: Core Infrastructure & Setup

    - Install dependencies: Add shadcn/ui, React Hook Form, spacetime, and UI
    libraries
    - Local data structure: JSON files for countries, regions, and visit data
    (localStorage)
    - Project structure: Organize components, hooks, utils, and types
    - Map generation: Create blocky SVG maps for Japan using tldraw/Figma

    Phase 2: Japan Map System & Core Features

    - Blocky Japan SVG: Design geometric blocks for each prefecture maintaining
    country shape
    - Rating system: Implement 6-level rating (0-5) matching JapanEx system
    - Color coding: Dynamic region coloring based on visit ratings
    - Interactive map: Click handlers, hover states, region selection
    - shadcn components: Set up design system with consistent styling

    Phase 3: Data Management & Tables

    - Visit tracking: CRUD operations with localStorage persistence
    - Notion-style tables: Advanced data tables with filtering, sorting, inline
    editing
    - Prefecture details: Modal/sidebar with visit notes, dates, photos
    - Export functionality: Export data as CSV/JSON

    Phase 4: Multi-Country & Advanced Features

    - Map generation workflow: Document process for creating blocky maps for
    other countries
    - Multi-country support: Expand beyond Japan (US states, EU countries, etc.)
    - Travel statistics: Personal dashboards and achievements
    - Mobile optimization: Responsive design for mobile devices

    Phase 5: Backend & Authentication (Final)

    - Supabase setup: Database schema and API integration
    - Authentication: Email/password and social providers
    - Data migration: Move from localStorage to Supabase
    - Sharing features: Public travel maps and social features
    - Deployment: Vercel + Supabase production setup

    Map Design Strategy:
    - Use tldraw or Figma to create blocky, geometric versions of Japan's
    prefectures
    - Each prefecture becomes a simplified shape (rectangle/hexagon/polygon)
    - Maintain overall country silhouette while making regions clearly
    distinguishable
    - Export as clean SVG with proper IDs for JavaScript interaction
