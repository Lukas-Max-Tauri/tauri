import React, { useEffect, useState } from 'react';
import { calculateLevelInfo } from '../../config/levelConfig';
import * as S from './LevelHeader.styles';

const LevelHeader = ({ user, missionProgress, logout, onProfileClick, onLicenseClick }) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousXP, setPreviousXP] = useState(missionProgress.totalScore);
  const [showSettings, setShowSettings] = useState(false);
  const levelInfo = calculateLevelInfo(missionProgress.totalScore);

  useEffect(() => {
    if (levelInfo.currentXP > previousXP) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setPreviousXP(levelInfo.currentXP);
  }, [levelInfo.currentXP, previousXP]);

  // Schließe Settings-Menü wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && !event.target.closest('.settings-container')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettings]);

  const handleSettingsClick = (action) => {
    setShowSettings(false);
    switch (action) {
      case 'profile':
        console.log('Navigate to profile');
        if (onProfileClick) {
          onProfileClick();
        }
        break;
      case 'data':
        console.log('Navigate to my data');
        break;
      case 'upgrade':
        console.log('Navigate to licenses');
        // Hier rufen wir die übergebene onLicenseClick-Funktion auf
        if (onLicenseClick) {
          onLicenseClick();
        }
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  return (
    <S.Container>
      {showLevelUp && (
        <S.LevelUpNotification>
          🎉 Level Up! 🎉
        </S.LevelUpNotification>
      )}

      <S.HeaderContainer>
        <S.UserInfoSection>
          <S.UserDetails>
            <span className="emoji">{levelInfo.icon}</span>
            <span className="name">{user.username}</span>
          </S.UserDetails>
          
          <S.SettingsContainer className="settings-container">
            <S.SettingsButton onClick={() => setShowSettings(!showSettings)}>
              <span>⚙️</span>
              Einstellungen
            </S.SettingsButton>

            {showSettings && (
              <S.SettingsDropdown>
                <S.SettingsItem onClick={() => handleSettingsClick('profile')}>
                  👤 Mein Profil
                </S.SettingsItem>
                
                
                <S.Divider />
                <S.SettingsItem onClick={() => handleSettingsClick('logout')}>
                  🚪 Abmelden
                </S.SettingsItem>
              </S.SettingsDropdown>
            )}
          </S.SettingsContainer>
        </S.UserInfoSection>

        <S.LevelDisplay>
          <S.LevelInfo>
            <S.LevelRow>
              <S.RankName>
                {levelInfo.levelName}
              </S.RankName>
              <S.LevelBadge>
                <span className="emoji">🎖️</span>
                <span className="level">Level {levelInfo.currentLevel}</span>
              </S.LevelBadge>
            </S.LevelRow>
            
            <S.CharacterScene>
              {levelInfo.icon}
            </S.CharacterScene>
          </S.LevelInfo>

          <S.XPProgressContainer>
            <S.XPInfo>
              <div>XP bis Level {Math.min(levelInfo.currentLevel + 1, 100)}</div>
              <div>{levelInfo.currentXP % 100} / 100</div>
            </S.XPInfo>
            
            <S.ProgressBarContainer>
              <S.ProgressBarFill $progress={levelInfo.progress} />
            </S.ProgressBarContainer>

            <S.TotalXP>
              Gesamt-XP: {levelInfo.currentXP}
            </S.TotalXP>
          </S.XPProgressContainer>
        </S.LevelDisplay>
      </S.HeaderContainer>
    </S.Container>
  );
};

export default LevelHeader;