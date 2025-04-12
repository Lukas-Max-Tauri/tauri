import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  color: #fff;
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  border: none;
  
  ${props => props.$isSelected ? `
    background: #2563eb;
    color: white;
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
  ` : `
    background: #374151;
    color: #9ca3af;
    &:hover {
      background: #4b5563;
    }
  `}
`;

const LanguageIcon = styled.span`
  font-size: 1.25rem;
`;

const LanguageLabel = styled.span`
  font-weight: 500;
`;

const languages = [
  { id: 'ukrainian', label: 'Ukrainisch', icon: '🇺🇦' },
  { id: 'arabic', label: 'Arabisch', icon: '🇸🇦' },
  { id: 'turkish', label: 'Türkisch', icon: '🇹🇷' },
  { id: 'english', label: 'Englisch', icon: '🇬🇧' },
  { id: 'spanish', label: 'Spanisch', icon: '🇪🇸' },
  { id: 'russian', label: 'Russisch', icon: '🇷🇺' },
  { id: 'polish', label: 'Polnisch', icon: '🇵🇱' },
  { id: 'romanian', label: 'Rumänisch', icon: '🇷🇴' },
  { id: 'ku', label: 'Kurdisch', icon: '🇹🇯' },
  { id: 'farsi', label: 'Farsi', icon: '🇮🇷' },
  { id: 'albanian', label: 'Albanisch', icon: '🇦🇱' },
  { id: 'serbian', label: 'Serbisch', icon: '🇷🇸' },
  { id: 'italian', label: 'Italienisch', icon: '🇮🇹' },
  { id: 'pashto', label: 'Paschtu', icon: '🇦🇫' },
  { id: 'somali', label: 'Somali', icon: '🇸🇴' },
  { id: 'tigrinya', label: 'Tigrinya', icon: '🇪🇷' }
];

const LanguageFilter = ({ selectedLanguages, onLanguageToggle }) => {
  return (
    <FilterContainer>
      <Title>
        <span>🛸</span>
        Sprachen auswählen
      </Title>
      <ButtonGroup>
        {languages.map((lang) => (
          <LanguageButton
            key={lang.id}
            onClick={() => onLanguageToggle(lang.id)}
            $isSelected={selectedLanguages.includes(lang.id)}
          >
            <LanguageIcon>{lang.icon}</LanguageIcon>
            <LanguageLabel>{lang.label}</LanguageLabel>
          </LanguageButton>
        ))}
      </ButtonGroup>
    </FilterContainer>
  );
};

export default LanguageFilter;