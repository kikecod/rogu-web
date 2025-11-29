import { useState, useRef, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { getImageUrl } from '@/core/config/api';
import UserDropdown from './components/UserDropdown';
import GuestDropdown from './components/GuestDropdown';

interface UserMenuProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

const UserMenu = ({ onLoginClick, onSignupClick, onLogout }: UserMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`
            flex items-center gap-3 p-1 pl-3 pr-1 rounded-full border transition-all duration-200
            ${isMenuOpen
            ? 'shadow-md border-gray-300 bg-white'
            : 'border-gray-200 hover:shadow-md hover:border-gray-300 bg-white'
          }
        `}
      >
        <Menu className="h-4 w-4 text-gray-600" />

        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
          {isLoggedIn && user ? (
            user.avatar ? (
              <img
                src={getImageUrl(user.avatar)}
                alt={user.correo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user.correo.charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <User className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {isLoggedIn ? (
            <UserDropdown
              user={user}
              onLogout={() => {
                onLogout();
                setIsMenuOpen(false);
              }}
              onClose={() => setIsMenuOpen(false)}
            />
          ) : (
            <GuestDropdown
              onSignupClick={() => {
                onSignupClick();
                setIsMenuOpen(false);
              }}
              onLoginClick={() => {
                onLoginClick();
                setIsMenuOpen(false);
              }}
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
