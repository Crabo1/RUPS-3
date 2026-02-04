import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  Badge
} from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserChallenge } from '../hooks/useChallenge';
import { useEffect, useState } from 'react';

export default function NavbarComponent() {
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();
    const { challenges } = useUserChallenge();
  const userName = user?.username || 'Guest';
  const [pendingChallengesCount, setPendingChallengesCount] = useState(0);
  const [handledChallenges, setHandledChallenges] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('handledChallenges');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('handledChallenges', JSON.stringify(Array.from(handledChallenges)));
  }, [handledChallenges]);

  useEffect(() => {
    if (!userName || userName === 'Guest' || !challenges) {
      setPendingChallengesCount(0);
      return;
    }

    const pending = challenges.filter(
      (c) =>
        c.challengee_username === userName &&
        !c.accepted &&
        !handledChallenges.has(c.id)
    );

    setPendingChallengesCount(pending.length);
  }, [challenges, userName, handledChallenges]);

  return (
    <Navbar fluid rounded className="z-50 mb-0">
      <Link to="/" className="w-64">
        <NavbarBrand>
          <img
            src="/logo.svg"
            className="mr-3 h-6 sm:h-9"
            alt="BrainBlast Logo"
          />
        </NavbarBrand>
      </Link>
      <div className="flex w-64 justify-end gap-2 md:order-2">
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Button
                color="alternative"
                className="font-bold"
                disabled={isLoading}
              >
                {user.username}
              </Button>
            }
          >
            <DropdownHeader>
              <span className="block text-sm">{user.username}</span>
              <span className="block truncate text-sm font-medium">
                {user.email}
              </span>
            </DropdownHeader>
            <DropdownItem onClick={logout}>Odjavi se</DropdownItem>
          </Dropdown>
        ) : (
          <>
            <Link to="/auth?mode=login">
              <Button className="w-32" color="alternative" disabled={isLoading}>
                Prijavi se
              </Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button className="w-32" disabled={isLoading}>
                Registracija
              </Button>
            </Link>
          </>
        )}
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <Link to="/">
          <NavbarLink active={location.pathname === '/'}>Domov</NavbarLink>
        </Link>
        <Link to="/game">
          <NavbarLink active={location.pathname === '/game'}>Igra</NavbarLink>
        </Link>
        <Link to="/leaderboards">
          <div className="flex items-center gap-2">
            <NavbarLink active={location.pathname === '/leaderboards'}>
              Lestvica
            </NavbarLink>
            {pendingChallengesCount > 0 && (
              <Badge
                color="warning"
                size="sm"
                className="text-sm text-yellow-600 font-medium animate-pulse "
                style={{ animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              >
                    Čaka te {pendingChallengesCount} izziv{pendingChallengesCount > 1 ? 'ov' : ''}!
              </Badge>
            )}
          </div>
        </Link>
      </NavbarCollapse>
    </Navbar>
  );
}
