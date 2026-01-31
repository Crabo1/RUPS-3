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
} from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NavbarComponent() {
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();

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
          <NavbarLink active={location.pathname === '/leaderboards'}>
            Lestvica
          </NavbarLink>
        </Link>
      </NavbarCollapse>
    </Navbar>
  );
}
