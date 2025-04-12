import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

// Dummy-Funktion als Ersatz für den entfernten GameSaveContext
const saveGameState = async () => true;

// Level-Berechnungsfunktionen
export const getErstelltesLevel = (totalAnzahl) => {
  const levelConfig = {
    1: 5,  // Level 1: 5 benötigt
    2: 6,  // Level 2: 6 benötigt
    3: 7,  // Level 3: 7 benötigt
    4: 8,  // Level 4: 8 benötigt
    5: 9   // Level 5: 9 benötigt
  };

  let verbleibendeAnzahl = totalAnzahl;
  let currentLevel = 1;
  let accumulatedContent = 0;
  
  for (let level = 1; level <= Object.keys(levelConfig).length; level++) {
    const required = levelConfig[level];
    if (verbleibendeAnzahl >= required) {
      verbleibendeAnzahl -= required;
      currentLevel = level + 1;
      accumulatedContent += required;
    } else {
      break;
    }
  }

  if (currentLevel > Object.keys(levelConfig).length) {
    currentLevel = Object.keys(levelConfig).length;
    verbleibendeAnzahl = totalAnzahl - accumulatedContent;
  }

  const schwelle = levelConfig[currentLevel] || levelConfig[Object.keys(levelConfig).length];
  
  return { 
    level: currentLevel, 
    schwelle: schwelle,
    fortschritt: verbleibendeAnzahl
  };
};

export const getGelerntesLevel = (totalAnzahl) => {
  const levelConfig = {
    1: 5,  // Level 1: 5 benötigt
    2: 6,  // Level 2: 6 benötigt
    3: 7,  // Level 3: 7 benötigt
    4: 8,  // Level 4: 8 benötigt
    5: 9   // Level 5: 9 benötigt
  };

  let verbleibendeAnzahl = totalAnzahl;
  let currentLevel = 1;
  let accumulatedLearned = 0;
  
  for (let level = 1; level <= Object.keys(levelConfig).length; level++) {
    const required = levelConfig[level];
    if (verbleibendeAnzahl >= required) {
      verbleibendeAnzahl -= required;
      currentLevel = level + 1;
      accumulatedLearned += required;
    } else {
      break;
    }
  }

  if (currentLevel > Object.keys(levelConfig).length) {
    currentLevel = Object.keys(levelConfig).length;
    verbleibendeAnzahl = totalAnzahl - accumulatedLearned;
  }

  const schwelle = levelConfig[currentLevel] || levelConfig[Object.keys(levelConfig).length];
  
  return { 
    level: currentLevel, 
    schwelle: schwelle,
    fortschritt: verbleibendeAnzahl
  };
};

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: 10px;
  box-shadow: inset 0 0 30px rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(5px);
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 0 40px;
`;

const TankWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const TankName = styled.h3`
  font-size: 18px;
  color: #60a5fa;
  margin: 0 0 20px 0;
  text-align: center;
`;

const TankBox = styled.div`
  width: 90px;
  height: 120px;
  background-color: rgba(42, 42, 64, 0.6);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
`;

const TankContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${({ $height }) => $height}%;
  background: linear-gradient(to bottom, #60a5fa, #2563eb);
  transition: height 0.5s ease;
`;

const TankPipe = styled.div`
  position: absolute;
  top: 50%;
  width: 30px;
  height: 4px;
  background-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-50%);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);

  &.left {
    left: -30px;
  }

  &.right {
    right: -30px;
  }
`;

const InfoBox = styled.div`
  margin-top: 20px;
  text-align: center;
  background: rgba(59, 130, 246, 0.1);
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const LevelText = styled.div`
  font-size: 24px;
  color: #60a5fa;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
`;

const ProgressText = styled.div`
  font-size: 16px;
  color: #9ca3af;
`;

const Tank = ({ value, maxValue, level, threshold, title }) => {
  const heightPercentage = Math.max(5, Math.min((value / threshold) * 100, 100));

  return (
    <TankWrapper>
      <TankName>{title}</TankName>
      <TankBox>
        <TankContent $height={heightPercentage} />
        <TankPipe className="left" />
        <TankPipe className="right" />
      </TankBox>
      <InfoBox>
        <LevelText>Level {level}</LevelText>
        <ProgressText>{value}/{threshold}</ProgressText>
      </InfoBox>
    </TankWrapper>
  );
};

const MissionsFortschritt = ({ fortschritt }) => {
  const { isAuthenticated, user, updateProgress } = useAuth();
  
  // Sicherstellen, dass fortschritt immer ein gültiges Objekt ist
  const validFortschritt = {
    erstellt: fortschritt?.erstellt || 0,
    gelernt: fortschritt?.gelernt || 0,
    verben: fortschritt?.verben || 0,
    gesamtPunkte: fortschritt?.gesamtPunkte || 0
  };

  // Berechnete Level-Daten
  const erstelltStats = getErstelltesLevel(validFortschritt.erstellt);
  const gelerntStats = getGelerntesLevel(validFortschritt.gelernt);

  // Synchronisiere den Fortschritt mit Firebase und dem Auth-Context
  useEffect(() => {
    // Nur ausführen, wenn der Benutzer authentifiziert ist
    if (isAuthenticated && user) {
      const syncProgress = async () => {
        try {
          // Stelle sicher, dass wir die aktuellsten Daten haben
          const firebaseProgress = user.progress?.missions || {};
          
          // Überprüfe, ob die Daten in Firebase aktueller sind als die lokal geladenen
          const shouldUpdateLocal = 
            (firebaseProgress.erstellt > validFortschritt.erstellt) ||
            (firebaseProgress.gelernt > validFortschritt.gelernt) ||
            (firebaseProgress.verben > validFortschritt.verben);
          
          // Überprüfe, ob die lokalen Daten aktueller sind als die in Firebase gespeicherten
          const shouldUpdateFirebase = 
            (validFortschritt.erstellt > (firebaseProgress.erstellt || 0)) ||
            (validFortschritt.gelernt > (firebaseProgress.gelernt || 0)) ||
            (validFortschritt.verben > (firebaseProgress.verben || 0)) ||
            (validFortschritt.gesamtPunkte > (user.progress?.totalScore || 0));
          
          if (shouldUpdateFirebase) {
            // Update Firebase mit den neuesten lokalen Daten
            console.log('Aktualisiere Firebase mit lokalen Fortschrittsdaten');
            await updateProgress({
              missions: {
                erstellt: validFortschritt.erstellt,
                gelernt: validFortschritt.gelernt,
                verben: validFortschritt.verben
              },
              totalScore: validFortschritt.gesamtPunkte
            });
            
            // Auch in den GameSave-Dienst speichern (hier deaktiviert, da wir keinen GameSaveContext mehr haben)
            // await saveGameState('missionsFortschritt', validFortschritt);
          }
        } catch (error) {
          console.error('Fehler beim Synchronisieren des Missionsfortschritts:', error);
        }
      };
      
      syncProgress();
    }
  }, [isAuthenticated, user, validFortschritt, updateProgress]);

  return (
    <Container>
      <GridContainer>
        <Tank 
          value={erstelltStats.fortschritt}
          maxValue={30}
          level={erstelltStats.level}
          threshold={erstelltStats.schwelle}
          title="Erstellte Inhalte"
        />
        <Tank 
          value={gelerntStats.fortschritt}
          maxValue={25}
          level={gelerntStats.level}
          threshold={gelerntStats.schwelle}
          title="Gelernte Vokabeln"
        />
      </GridContainer>
    </Container>
  );
};

export default MissionsFortschritt;