
export const preventAutoScroll = () => {
  // Prevent automatic scrolling
  if (typeof window !== 'undefined') {
    // Set scroll position to top on page load
    window.scrollTo(0, 0);
    
    // Add event listener to prevent automatic scrolling
    const handleLoad = () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    };
    
    window.addEventListener('load', handleLoad);
    
    // Clean up
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }
  
  return undefined;
};

// Add the missing function
export const disableScrollRestoration = () => {
  if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
    // Disable automatic scroll restoration
    history.scrollRestoration = 'manual';
    
    // Set scroll position to top
    window.scrollTo(0, 0);
  }
};
