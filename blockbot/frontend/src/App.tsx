import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeInit } from '../.flowbite-react/init';
import NavbarComponent from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import LevelSelect from './pages/LevelSelect';
import Leaderboards from './pages/Leaderboards';
import Auth from './pages/Auth';
import Challenge from './pages/Challenge';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <ThemeInit />
      <div
        className="min-h-screen bg-top bg-repeat-y shadow-lg shadow-white"
        style={{
          backgroundImage: 'url(/background.svg)',
          backgroundSize: '100% auto',
        }}
      >
        <div className="sticky top-0 z-50">
          <NavbarComponent />
        </div>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/levels"
              element={
                <ProtectedRoute>
                  <LevelSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboards"
              element={
                <ProtectedRoute>
                  <Leaderboards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-challenge"
              element={
                <ProtectedRoute>
                  <Challenge />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
