
import { useState, useRef, useCallback } from 'react';
import { japanPrefectures } from '@/data/japan';

export const usePrefectureSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToTableRow = (regionId: string) => {
    const row = document.querySelector(`[data-region-id="${regionId}"]`);
    if (!row) {
      return;
    }
    
    const tableSection = document.getElementById('table-section');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setTimeout(() => {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('bg-blue-100', 'dark:bg-blue-900/50');
      setTimeout(() => {
        row.classList.remove('bg-blue-100', 'dark:bg-blue-900/50');
      }, 2000);
    }, 500);
  };

  const handleSearch = useCallback((term: string) => {
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
      }, 800);
    } else {
      setSelectedSearchResult(null);
    }
  }, []);

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
