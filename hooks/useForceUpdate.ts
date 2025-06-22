import { useState, useCallback } from 'react';

export function useForceUpdate() {
  const [, setUpdateCount] = useState(0);
  
  const forceUpdate = useCallback(() => {
    setUpdateCount(count => count + 1);
  }, []);
  
  return forceUpdate;
}