'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, BarChart3, Table, ChevronDown } from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: NavSection[] = [
  {
    id: 'map-section',
    label: 'Map Explorer',
    icon: <MapPin className="w-4 h-4" />
  },
  {
    id: 'stats-section', 
    label: 'Analytics',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    id: 'table-section',
    label: 'Visit Records',
    icon: <Table className="w-4 h-4" />
  }
];

export function PageNav() {
  const [activeSection, setActiveSection] = useState('map-section');
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Simple offset
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      let currentSection = sections[0].id; // Default to first section
      
      // Check if we're at the bottom of the page
      if (scrollPosition + windowHeight >= documentHeight - 50) {
        // If at bottom, set to last section
        currentSection = sections[sections.length - 1].id;
      } else {
        // Find the section that's currently visible
        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const { offsetTop } = element;
            
            // If we're past the start of this section, it becomes the current section
            if (scrollPosition >= offsetTop) {
              currentSection = section.id;
            }
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 100; // Account for header height
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={cn(
        "bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg transition-all duration-200",
        isCollapsed ? "p-2" : "p-2"
      )}>
        {/* Collapsed state - just show icon */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 transition-colors"
            title={sections.find(s => s.id === activeSection)?.label}
          >
            {sections.find(s => s.id === activeSection)?.icon}
          </button>
        ) : (
          /* Expanded state - show all sections */
          <div className="flex items-center gap-1">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <button
                  onClick={() => {
                    scrollToSection(section.id);
                    setActiveSection(section.id); // Explicitly set active section on click
                    setIsCollapsed(true);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150",
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
                {index < sections.length - 1 && (
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                )}
              </div>
            ))}
            
            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Collapse navigation"
            >
              <ChevronDown className="w-4 h-4 transform rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}