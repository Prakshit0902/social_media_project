import { useEffect, useRef } from 'react';

const useInfiniteScroll = (callback, isLoading, hasMore) => {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    // Create an IntersectionObserver to detect when the trigger element is in view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          callback(); // Trigger the callback to load more data
        }
      },
      {
        root: null, // Use the viewport as the root
        rootMargin: '100px', // Trigger a bit before the element is fully in view
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    // Observe the trigger element if it exists
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, isLoading, hasMore]); // Re-create observer if dependencies change

  // Return the ref to be attached to the trigger element
  return loadMoreRef;
};

export default useInfiniteScroll;