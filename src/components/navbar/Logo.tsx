import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import roguLogo from '@/assets/rogu_logo.png';

const Logo = () => {
  return (
    <Link to={ROUTES.home} className="flex items-center min-w-0">
      <img 
        src={roguLogo} 
        alt="ROGU" 
        className="h-8 sm:h-10 w-auto"
      />
      <span className="hidden sm:block ml-2 text-xs sm:text-sm text-neutral-600 truncate">
        ROGÜ
      </span>
    </Link>
  );
};

export default Logo;
