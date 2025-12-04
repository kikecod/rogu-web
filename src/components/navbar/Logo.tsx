import roguLogo from '@/assets/rogu_logo.png';

interface LogoProps {
  onClick?: () => void;
}

const Logo = ({ onClick }: LogoProps) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center min-w-0 cursor-pointer"
    >
      <img 
        src={roguLogo} 
        alt="ROGU" 
        className="h-8 sm:h-10 w-auto"
      />
      <span className="hidden sm:block ml-2 text-xs sm:text-sm text-neutral-600 truncate">
        ROGÜ
      </span>
    </div>
  );
};

export default Logo;
