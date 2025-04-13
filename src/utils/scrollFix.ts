
export const preventAutoScroll = () => {
  if (typeof window !== 'undefined') {
    // Prevent scrolling when content is autofocused or elements are moved
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function() {
      // do nothing to prevent automatic scrolling
      return;
    };
    
    // Restore original after a short delay
    setTimeout(() => {
      window.scrollTo = originalScrollTo;
    }, 500);
  }
};

export const disableScrollRestoration = () => {
  if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
};
