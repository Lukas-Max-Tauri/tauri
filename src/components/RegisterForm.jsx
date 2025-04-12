import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as S from '../styles/Auth.styles';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validierungen
    if (formData.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Möglicherweise existiert der Benutzername oder die E-Mail-Adresse bereits.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.AuthContainer>
      <S.Card>
        <S.Title>Starte deine Sprachreise! 🎯</S.Title>
        {error && <S.ErrorMessage role="alert">{error}</S.ErrorMessage>}
        
        <S.Form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label htmlFor="username">Benutzername</S.Label>
            <S.Input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              placeholder="Dein Benutzername"
              autoComplete="username"
              aria-required="true"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label htmlFor="email">E-Mail</S.Label>
            <S.Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="deine@email.de"
              autoComplete="email"
              aria-required="true"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label htmlFor="password">Passwort</S.Label>
            <S.Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="Mindestens 8 Zeichen"
              autoComplete="new-password"
              aria-required="true"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label htmlFor="confirmPassword">Passwort bestätigen</S.Label>
            <S.Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="Passwort wiederholen"
              autoComplete="new-password"
              aria-required="true"
            />
          </S.FormGroup>

          <S.SubmitButton 
            type="submit" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Einen Moment...' : 'Registrieren'}
          </S.SubmitButton>
        </S.Form>

        <S.LinkText>
          Bereits ein Konto? <Link to="/login">Jetzt einloggen</Link>
        </S.LinkText>
      </S.Card>
    </S.AuthContainer>
  );
};

export default RegisterForm;