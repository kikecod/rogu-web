import React from 'react';
import Navbar from './navbar/Navbar';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, onLogout }) => {
  return (
    <Navbar 
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      onLogout={onLogout}
    />
  );
};

export default Header;
