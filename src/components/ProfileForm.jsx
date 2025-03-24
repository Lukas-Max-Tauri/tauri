import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { SERVER_URL, isTauri } from '../utils/api';

// Styled Components für das Profilformular
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const LogoContainer = styled.div`
  width: 180px;
  height: 180px;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: white;
`;

const JoinDate = styled.p`
  font-size: 0.875rem;
  color: #95a5a6;
  margin: 0.5rem 0 0 0;
`;

const FormSection = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: white;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(52, 73, 94, 0.7);
  border: 1px solid ${props => props.error ? '#e74c3c' : '#34495e'};
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
  }
  
  &::placeholder {
    color: #95a5a6;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ProfileForm = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Fehler zurücksetzen, wenn Feld bearbeitet wird
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Aktuelles Passwort ist erforderlich';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Neues Passwort ist erforderlich';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Passwort muss mindestens 8 Zeichen lang sein';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      // Korrekter Endpunkt für die Passwortänderung
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${SERVER_URL}/api/auth/updatePassword`, {
        method: 'PATCH',  // Richtige HTTP-Methode ist PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Ändern des Passworts');
      }
      
      // Passwortfelder zurücksetzen
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Erfolgsmeldung anzeigen
      setMessages({
        ...messages,
        password: 'Passwort erfolgreich geändert'
      });
      
      // Nachricht nach 3 Sekunden ausblenden
      setTimeout(() => {
        setMessages({
          ...messages,
          password: null
        });
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Ändern des Passworts:', error);
      setErrors({
        ...errors,
        currentPassword: 'Falsches Passwort oder Fehler bei der Verarbeitung'
      });
    }
  };
  
  if (loading) {
    return <div>Laden...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Bitte melde dich an, um dein Profil zu sehen.</div>;
  }
  
  // Beitrittsdatum formatieren
  const formatJoinDate = () => {
    if (!user || !user.createdAt) return 'Unbekannt';
    
    const date = new Date(user.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `Mitglied seit ${date.toLocaleDateString('de-DE', options)}`;
  };
  
  return (
    <ProfileContainer>
      <ProfileHeader>
        <LogoContainer>
          <LogoImage src="/logo.png" alt="Logo" />
        </LogoContainer>
        
        <UserInfo>
          <UserName>{user.username || user.name || 'Benutzer'}</UserName>
          <JoinDate>{formatJoinDate()}</JoinDate>
        </UserInfo>
      </ProfileHeader>
      
      <FormSection>
        <SectionTitle>🔐 Passwort ändern</SectionTitle>
        <form onSubmit={handlePasswordUpdate}>
          <FormGroup>
            <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
            <Input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              error={errors.currentPassword}
              placeholder="••••••••"
            />
            {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                error={errors.newPassword}
                placeholder="••••••••"
              />
              {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>
          </FormRow>
          
          {messages.password && <SuccessMessage>{messages.password}</SuccessMessage>}
          <Button type="submit">Passwort ändern</Button>
        </form>
      </FormSection>
    </ProfileContainer>
  );
};

export default ProfileForm;