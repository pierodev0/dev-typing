export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
};

export const useIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : false;
};
