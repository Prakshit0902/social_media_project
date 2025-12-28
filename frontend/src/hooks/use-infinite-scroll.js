import { useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (callback, isLoading, hasMore) => {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated without triggering useEffect
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Don't create observer if there's nothing more to load
    if (!hasMore) {
      return;
    }

    const currentElement = loadMoreRef.current;
    
    // Create IntersectionObserver with optimized settings
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        // Only trigger if:
        // 1. Element is intersecting
        // 2. There's more data to load
        // 3. Not currently loading
        if (entry.isIntersecting && hasMore && !isLoading) {
          callbackRef.current();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '200px', // Trigger 200px before reaching the element (better UX)
        threshold: 0, // Trigger as soon as any pixel is visible
      }
    );

    // Store observer reference
    observerRef.current = observer;

    // Observe the trigger element if it exists
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect();
      }
      observerRef.current = null;
    };
  }, [isLoading, hasMore]); // Only depend on isLoading and hasMore, not callback

  // Return the ref to attach to the trigger element
  return loadMoreRef;
};

export default useInfiniteScroll;