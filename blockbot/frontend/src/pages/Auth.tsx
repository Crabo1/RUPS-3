import { useState, useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Label, TextInput, Alert } from 'flowbite-react';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const prevModeRef = useRef(mode);

  const {
    user,
    isLoading,
    login,
    register,
    loginError,
    registerError,
    clearErrors,
  } = useAuth();

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      clearErrors();
      prevModeRef.current = mode;
    }
  }, [mode, clearErrors]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const switchMode = (newMode: string) => {
    clearErrors();
    setSearchParams({ mode: newMode });
    setFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register') {
      if (formData.password.length < 6) {
        alert('Geslo mora biti dolgo vsaj 6 znakov');
        return;
      }

      try {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        switchMode('login');
      } catch {
        // Error is handled by useAuth hook
      }
    } else {
      try {
        await login({
          username: formData.username,
          password: formData.password,
        });
      } catch {
        // Error is handled by useAuth hook
      }
    }
  };

  const currentError = mode === 'login' ? loginError : registerError;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-16">
      <Card className="w-full max-w-md rounded-4xl py-2">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Prijava' : 'Registracija'}
            </h1>
            <p className="text-sm text-gray-600">
              {mode === 'login'
                ? 'Prijavite se v svoj račun'
                : 'Ustvarite nov račun'}
            </p>
          </div>

          {currentError && (
            <Alert color="failure">
              <span className="font-medium">Napaka!</span>{' '}
              {currentError.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <Label htmlFor="username">Uporabniško ime</Label>
              <TextInput
                id="username"
                name="username"
                type="text"
                placeholder="Vnesite uporabniško ime"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {mode === 'register' && (
              <div>
                <Label htmlFor="email">E-pošta</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Vnesite e-poštni naslov"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="password">Geslo</Label>
              <TextInput
                id="password"
                name="password"
                type="password"
                placeholder="Vnesite geslo"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={mode === 'register' ? 6 : undefined}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? 'Počakajte...'
                : mode === 'login'
                  ? 'Prijavite se'
                  : 'Registrirajte se'}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p className="text-gray-600">
                Še nimate računa?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-primary-600 hover:underline"
                  disabled={isLoading}
                >
                  Registrirajte se
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Že imate račun?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary-600 hover:underline"
                  disabled={isLoading}
                >
                  Prijavite se
                </button>
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
