
// Utility to prevent automatic scrolling
export const preventAutoScroll = () => {
  // Use requestAnimationFrame to ensure this runs after the browser's layout calculations
  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
};

export const disableScrollRestoration = () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
};
