import styled, { keyframes } from 'styled-components';

const twinkle = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
`;

const hover = keyframes`
  0%, 100% { transform: translateY(0) rotate(-45deg); }
  50% { transform: translateY(-10px) rotate(-45deg); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom, #0f172a, #1e1b4b);
`;

export const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.7);
  border-radius: 0.75rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 1rem;
`;

export const Username = styled.span`
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;
export const LogoutButton = styled.button`
  padding: 8px 16px;
  margin-left: 12px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff0000;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81);
`;

export const StarsBackground = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #6366f1, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #818cf8, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0));
  background-size: 200px 200px;
  animation: ${twinkle} 5s ease-in-out infinite;
`;

export const MainContent = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
`;

export const Card = styled.div`
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 4px solid #3b82f6;
  box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
  overflow: hidden;
`;

export const Header = styled.div`
  position: relative;
  background: linear-gradient(to right, #1e1b4b, #312e81);
  padding: 2rem;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
`;

export const Rocket = styled.div`
  position: absolute;
  top: 1rem;
  right: 2rem;
  font-size: 2.5rem;
  animation: ${hover} 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
`;

export const Title = styled.h1`
  color: white;
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
`;

export const Subtitle = styled.p`
  color: #93c5fd;
  text-align: center;
  margin-top: 0.5rem;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const StatCard = styled.div`
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

export const StatLabel = styled.div`
  color: #93c5fd;
  font-size: 0.875rem;
`;

export const StatValue = styled.div`
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ContentSection = styled.div`
  padding: 1.5rem;
`;

export const MissionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MissionButton = styled.button`
  width: 100%;
  background: rgba(17, 24, 39, 0.7);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    background: rgba(17, 24, 39, 0.9);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
  }

  &:after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(59, 130, 246, 0.1),
      transparent
    );
    transform: rotate(45deg);
    transition: 0.3s;
  }

  &:hover:after {
    transform: rotate(45deg) translate(50%, 50%);
  }
`;

export const MissionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const PlanetIcon = styled.div`
  font-size: 2.5rem;
  animation: ${rotate} 10s linear infinite;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
`;

export const MissionInfo = styled.div`
  text-align: left;
`;

export const MissionTitle = styled.h3`
  color: white;
  font-size: 1.125rem;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;

export const MissionDescription = styled.p`
  color: #93c5fd;
  font-size: 0.875rem;
`;

export const MissionProgress = styled.span`
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

export const ProgressSection = styled.div`
  margin-top: 2rem;
  background: rgba(17, 24, 39, 0.7);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

export const ProgressTitle = styled.h3`
  color: white;
  font-size: 1.125rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;

export const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

export const ProgressCard = styled.div`
  background: rgba(17, 24, 39, 0.6);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  }
`;

export const ProgressIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
`;

export const ProgressValue = styled.div`
  color: white;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;

export const ProgressLabel = styled.div`
  color: #93c5fd;
  font-size: 0.875rem;
`;

export const SubHeader = styled.div`
  position: relative;
  background: linear-gradient(to right, #1e1b4b, #312e81);
  padding: 1.5rem;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(2px 2px at 40px 70px, #6366f1, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 90px 40px, #818cf8, rgba(0,0,0,0));
    opacity: 0.1;
    pointer-events: none;
  }
`;

export const BackButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 9999px;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);

  &:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateX(-4px);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
  }

  span {
    font-size: 1.25rem;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(59, 130, 246, 0.1),
      transparent
    );
    transform: rotate(45deg);
    transition: 0.6s;
  }

  &:hover::after {
    transform: rotate(45deg) translate(50%, 50%);
  }
`;

export const SubTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
  letter-spacing: 0.025em;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, transparent, #3b82f6, transparent);
    margin: 0.75rem auto 0;
    border-radius: 9999px;
  }
`;

export const SubContent = styled.div`
  padding: 1rem;
  background: rgba(17, 24, 39, 0.85);
`;

export const HelpBot = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(17, 24, 39, 0.9);
  padding: 1rem;
  border-radius: 9999px;
  border: 3px solid #3b82f6;
  font-size: 2.5rem;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  animation: ${float} 3s ease-in-out infinite;

  &:hover {
    transform: scale(1.1);
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
`;