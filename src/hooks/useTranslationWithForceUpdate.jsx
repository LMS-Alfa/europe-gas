import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook that extends useTranslation and forces a re-render when the language changes
 * @param {string} ns - The namespace(s) to use
 * @returns {object} An object containing the t function, i18n instance, and the current language
 */
export const useTranslationWithForceUpdate = (ns) => {
  // Get the standard useTranslation hook
  const { t, i18n, ready } = useTranslation(ns);
  
  // Keep track of the current language
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  
  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      console.log(`Language changed to: ${lng} (detected in hook)`);
      setCurrentLanguage(lng);
    };
    
    // Add event listener
    i18n.on('languageChanged', handleLanguageChanged);
    
    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  return { t, i18n, ready, currentLanguage };
};

export default useTranslationWithForceUpdate; 