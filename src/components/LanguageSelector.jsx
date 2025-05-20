import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslationWithForceUpdate } from '../hooks/useTranslationWithForceUpdate';
import { FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlag } from './flags/index.jsx';

// Styled components for language selector
const LanguageContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const LanguageButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: ${props => props.theme.colors.background.card};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${props => props.theme.colors.background.hover};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const LanguageDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background-color: ${props => props.theme.colors.background.card};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
  padding: 4px;
`;

const LanguageOption = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background-color: ${props => 
    props.isActive 
      ? `${props.theme.colors.primary}10` 
      : props.theme.colors.background.card
  };
  color: ${props => 
    props.isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.text.primary
  };
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 6px;
  margin: 3px 0;

  &:hover {
    background-color: ${props => props.theme.colors.background.hover};
  }
`;

const LanguageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Flag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 18px;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const LanguageText = styled.span`
  font-weight: ${props => props.isActive ? '600' : '400'};
`;

const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
`;

// Animation variants
const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const optionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: i => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2
    }
  }),
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * LanguageSelector component
 * Allows users to switch between supported languages with country flags
 */
const LanguageSelector = () => {
  const { t, i18n, currentLanguage: activeLanguage } = useTranslationWithForceUpdate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Available languages
  const languages = [
    { code: 'en', name: t('languages.en') },
    { code: 'ru', name: t('languages.ru') },
    { code: 'uz', name: t('languages.uz') }
  ];

  // Get current language
  const currentLanguage = languages.find(lang => lang.code === activeLanguage) || languages[0];

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Change language with a callback to ensure UI updates
  const changeLanguage = (langCode) => {
    if (langCode !== activeLanguage) {
      console.log(`Changing language from ${activeLanguage} to ${langCode}`);
      i18n.changeLanguage(langCode).then(() => {
        console.log(`Language changed to ${langCode}`);
      });
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <LanguageContainer ref={dropdownRef}>
      <LanguageButton 
        onClick={toggleDropdown}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Flag>
          {getFlag(currentLanguage.code)}
        </Flag>
        <span>{currentLanguage.name}</span>
      </LanguageButton>

      <AnimatePresence>
        {isOpen && (
          <LanguageDropdown
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
          >
            {languages.map((language, i) => (
              <LanguageOption
                key={language.code}
                isActive={activeLanguage === language.code}
                onClick={() => changeLanguage(language.code)}
                custom={i}
                variants={optionVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <LanguageInfo>
                  <Flag>
                    {getFlag(language.code)}
                  </Flag>
                  <LanguageText isActive={activeLanguage === language.code}>
                    {language.name}
                  </LanguageText>
                </LanguageInfo>
                
                {activeLanguage === language.code && (
                  <CheckIcon>
                    <FiCheck size={16} />
                  </CheckIcon>
                )}
              </LanguageOption>
            ))}
          </LanguageDropdown>
        )}
      </AnimatePresence>
    </LanguageContainer>
  );
};

export default LanguageSelector; 