import React from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  width: 100%;
  padding: 10px;
`;

const MissionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
`;

const MissionLabel = styled.span`
  color: #93c5fd;
`;

const MissionValue = styled.span`
  color: white;
  font-weight: bold;
`;

const MissionsFortschritt = ({ fortschritt }) => {
  // Sicherstellen, dass fortschritt immer ein gültiges Objekt ist
  const validFortschritt = {
    erstellt: fortschritt?.erstellt || 0,
    gelernt: fortschritt?.gelernt || 0,
    verben: fortschritt?.verben || 0,
    gesamtPunkte: fortschritt?.gesamtPunkte || 0
  };

  return (
    <Container>
      <MissionRow>
        <MissionLabel>🧠 Wörter gelernt</MissionLabel>
        <MissionValue>{validFortschritt.gelernt}</MissionValue>
      </MissionRow>
      <MissionRow>
        <MissionLabel>📝 Erstellte Elemente</MissionLabel>
        <MissionValue>{validFortschritt.erstellt}</MissionValue>
      </MissionRow>
      <MissionRow>
        <MissionLabel>🔄 Verben konjugiert</MissionLabel>
        <MissionValue>{validFortschritt.verben}</MissionValue>
      </MissionRow>
      <MissionRow>
        <MissionLabel>🏆 Gesamt-Punkte</MissionLabel>
        <MissionValue>{validFortschritt.gesamtPunkte}</MissionValue>
      </MissionRow>
    </Container>
  );
};

export default MissionsFortschritt;