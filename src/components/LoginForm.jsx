import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as S from '../styles/Auth.styles';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.AuthContainer>
      <S.Card>
        <S.Title>Willkommen zurück! 🚀</S.Title>
        
        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
        
        <S.Form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label htmlFor="email">E-Mail</S.Label>
            <S.Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
              autoComplete="email"
              placeholder="deine@email.de"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label htmlFor="password">Passwort</S.Label>
            <S.Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
              autoComplete="current-password"
              placeholder="Dein Passwort"
              minLength="8"
            />
          </S.FormGroup>

          <S.SubmitButton 
            type="submit" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Wird geladen...' : 'Einloggen'}
          </S.SubmitButton>
        </S.Form>

        <S.LinkText>
          Noch kein Konto? <Link to="/register">Jetzt registrieren</Link>
        </S.LinkText>
      </S.Card>
    </S.AuthContainer>
  );
};

export default LoginForm;