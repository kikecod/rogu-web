import { useState } from 'react';
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-1 sm:space-x-2 border border-neutral-300 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 hover:shadow-md transition-all duration-200 hover:border-neutral-400"
      >
        <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
        {isLoggedIn && user ? (
          user.avatar ? (
            <img 
              src={getImageUrl(user.avatar)} 
              alt={user.correo} 
              className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" 
            />
          ) : (
            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {user.correo.charAt(0).toUpperCase()}
            </div>
          )
        ) : (
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
        )}
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-neutral-200">
          {isLoggedIn ? (
            <UserDropdown 
              user={user} 
              onLogout={onLogout} 
              onClose={() => setIsMenuOpen(false)} 
            />
          ) : (
            <GuestDropdown 
              onSignupClick={onSignupClick} 
              onLoginClick={onLoginClick} 
              onClose={() => setIsMenuOpen(false)} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
