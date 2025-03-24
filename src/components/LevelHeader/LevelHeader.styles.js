import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 100% { transform: translate(-50%, -100%); }
  50% { transform: translate(-50%, -150%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const progress = keyframes`
  0% { background-position: 1rem 0; }
  100% { background-position: 0 0; }
`;

export const Container = styled.div`
  position: relative;
  width: 100%;
`;

export const LevelUpNotification = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -100%);
  animation: ${bounce} 1s ease-in-out;
  background: rgba(234, 179, 8, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: bold;
  color: black;
  box-shadow: 0 0 20px rgba(234, 179, 8, 0.5);
`;

export const HeaderContainer = styled.div`
  background: linear-gradient(to right, #312e81, #1e1b4b);
  padding: 1rem;
  border-radius: 1rem 1rem 0 0;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  max-width: 1000px;
  margin: 0 auto;
`;

export const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
`;

export const UserDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  span.emoji {
    font-size: 1.5rem;
  }

  span.name {
    color: white;
    font-weight: bold;
    font-size: 1.125rem;
  }
`;

export const SettingsContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const SettingsButton = styled.button`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.2);
  }
`;

export const SettingsDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.75rem;
  min-width: 200px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
`;

export const SettingsItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(59, 130, 246, 0.2);
  margin: 0.25rem 0;
`;

export const LevelDisplay = styled.div`
  display: flex;
  gap: 1.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  align-items: center;
`;

export const LevelInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
`;

export const LevelRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const LevelBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span.emoji {
    font-size: 1.5rem;
  }

  span.level {
    color: #93c5fd;
    font-weight: bold;
    font-size: 1.25rem;
  }
`;

export const RankName = styled.div`
  color: #fcd34d;
  font-weight: 600;
  font-size: 1.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(252, 211, 77, 0.3);
`;

export const CharacterScene = styled.div`
  text-align: center;
  font-size: 3rem;
  animation: ${float} 3s ease-in-out infinite;
  padding: 0.5rem;
  margin-top: -1.25rem;  // Negative margin um das Icon höher zu setzen
`;

export const XPProgressContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
`;

export const XPInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #93c5fd;
  font-size: 1rem;
  font-weight: bold;
`;

export const ProgressBarContainer = styled.div`
  height: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
`;

export const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(to right, #3b82f6, #6366f1);
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    animation: ${progress} 1s linear infinite;
  }
`;

export const TotalXP = styled.div`
  color: rgba(147, 197, 253, 0.7);
  font-size: 0.75rem;
  text-align: right;
`;