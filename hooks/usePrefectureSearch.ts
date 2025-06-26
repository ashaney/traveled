
import { useState, useRef, useCallback, useEffect } from 'react';
import { japanPrefectures } from '@/data/japan';

const SCROLL_DELAY = 800;
const HIGHLIGHT_DURATION = 2000;
const SEARCH_DEBOUNCE_DELAY = 300;

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const usePrefectureSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tableSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Cache table section reference
    tableSectionRef.current = document.getElementById('table-section');
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToTableRow = (regionId: string) => {
    const row = document.querySelector(`[data-region-id="${regionId}"]`);
    if (!row) {
      return;
    }

    // Use cached table section reference
    const tableSection = tableSectionRef.current || document.getElementById('table-section');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add null check before classList operations
      if (row && row.classList) {
        row.classList.add('bg-blue-100', 'dark:bg-blue-900/50');
        setTimeout(() => {
          if (row && row.classList) {
            row.classList.remove('bg-blue-100', 'dark:bg-blue-900/50');
          }
        }, HIGHLIGHT_DURATION);
      }
    }, 500);
  };

  const performSearch = useCallback((term: string) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (!term.trim()) {
      setSearchResults([]);
      setSelectedSearchResult(null);
      return;
    }

    const searchLower = term.toLowerCase();
    const matches = japanPrefectures.regions.filter(region =>
      region.name.toLowerCase().includes(searchLower) ||
      region.nameJapanese?.includes(term) ||
      region.id.toLowerCase().includes(searchLower)
    ).map(region => region.id);

    setSearchResults(matches);

    if (matches.length > 0) {
      setSelectedSearchResult(matches[0]);

      scrollTimeoutRef.current = setTimeout(() => {
        scrollToTableRow(matches[0]);
      }, SCROLL_DELAY);
    } else {
      setSelectedSearchResult(null);
    }
  }, []);

  // Debounced search function
  const handleSearch = useCallback(
    debounce(performSearch, SEARCH_DEBOUNCE_DELAY),
    [performSearch]
  );

  const resetSearch = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    setSearchTerm('');
    setSearchResults([]);
    setSelectedSearchResult(null);
  }, []);

  const cancelScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    selectedSearchResult,
    handleSearch,
    resetSearch,
    scrollToTableRow,
    cancelScroll,
  };
};
