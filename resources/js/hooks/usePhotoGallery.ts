import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

interface DarkModeReturn {
  isDark: boolean;
  toggleDark: () => void;
}

/**
 * Hook để quản lý dark mode
 */
export function useDarkMode(): DarkModeReturn {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage hoặc system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage và document class
    localStorage.setItem('darkMode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark((prev: boolean) => !prev), []);

  return { isDark, toggleDark };
}

/**
 * Hook để implement infinite scroll
 */
export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
): void {
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const handleScroll = (): void => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Trigger khi còn 200px nữa đến bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore, isLoading]);
}

/**
 * Hook để implement intersection observer cho lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [Dispatch<SetStateAction<HTMLElement | null>>, boolean] {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(ref);

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return [setRef, isIntersecting];
}
