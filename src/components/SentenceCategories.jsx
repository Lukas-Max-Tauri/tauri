import React from 'react';
import * as S from '../styles/App.styles';

const SentenceCategories = ({ onSelectCategory }) => {
  return (
    <S.ContentSection>
      <S.MissionGroup>
        <S.MissionButton onClick={() => onSelectCategory('structure')}>
          <S.MissionContent>
            <S.PlanetIcon>🔤</S.PlanetIcon>
            <S.MissionInfo>
              <S.MissionTitle>Satzstruktur lernen</S.MissionTitle>
              <S.MissionDescription>Voreingestellte Sätze</S.MissionDescription>
            </S.MissionInfo>
          </S.MissionContent>
        </S.MissionButton>

        <S.MissionButton onClick={() => onSelectCategory('dailySentence')}>
          <S.MissionContent>
            <S.PlanetIcon>💫</S.PlanetIcon>
            <S.MissionInfo>
              <S.MissionTitle>Satz des Tages</S.MissionTitle>
              <S.MissionDescription>Erstelle eigene Sätze</S.MissionDescription>
            </S.MissionInfo>
          </S.MissionContent>
        </S.MissionButton>
      </S.MissionGroup>
    </S.ContentSection>
  );
};

export default SentenceCategories;