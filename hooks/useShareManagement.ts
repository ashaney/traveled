'use client';

import { useState, useCallback } from 'react';

export interface SharedMap {
  id: string;
  user_id: string;
  share_code: string;
  image_url: string;
  title: string;
  description: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShareManagementState {
  share: SharedMap | null;
  isLoading: boolean;
  error: string | null;
}

export function useShareManagement() {
  const [state, setState] = useState<ShareManagementState>({
    share: null,
    isLoading: false,
    error: null
  });

  const fetchShare = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/shares');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch share');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        share: data.share || null,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to fetch share:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch share'
      }));
    }
  }, []);

  const deleteShare = useCallback(async () => {
    try {
      const response = await fetch('/api/shares', {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete share');
      }

      // Clear from local state
      setState(prev => ({
        ...prev,
        share: null
      }));

      return true;

    } catch (error) {
      console.error('Failed to delete share:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete share'
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchShare,
    deleteShare,
    clearError
  };
}