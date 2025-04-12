import styled from 'styled-components';

export const FortschrittContainer = styled.div`
  padding: 24px;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  border: 1px solid #3b82f6;
`;

export const Titel = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 24px;
  text-align: center;
`;

export const RasterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

export const KategorieContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const KategorieTitel = styled.h3`
  color: #60a5fa;
  margin-bottom: 16px;
  text-align: center;
`;

export const TreibstoffContainer = styled.div`
  position: relative;
  width: 100%;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TreibstoffTank = styled.div`
  position: absolute;
  width: 96px;
  height: 96px;
  background: #1e293b;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  overflow: hidden;
`;

export const TreibstoffStand = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, #2563eb, #60a5fa);
  transition: height 0.5s ease;
  height: ${props => props.prozent}%;
`;

export const ZentraleInfo = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
`;

export const Level = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

export const Fortschritt = styled.span`
  font-size: 14px;
`;

export const DekorLinks = styled.div`
  position: absolute;
  left: -16px;
  top: 50%;
  width: 32px;
  height: 8px;
  background: #3b82f6;
  transform: translateY(-50%);
`;

export const DekorRechts = styled.div`
  position: absolute;
  right: -16px;
  top: 50%;
  width: 32px;
  height: 8px;
  background: #3b82f6;
  transform: translateY(-50%);
`;