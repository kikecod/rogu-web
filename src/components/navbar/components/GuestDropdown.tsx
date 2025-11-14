import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface GuestDropdownProps {
  onSignupClick: () => void;
  onLoginClick: () => void;
  onClose: () => void;
}

const GuestDropdown = ({ onSignupClick, onLoginClick, onClose }: GuestDropdownProps) => {
  return (
    <>
      <button
        onClick={() => {
          onClose();
          onSignupClick();
        }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
      >
        Registrarse
      </button>
      <button
        onClick={() => {
          onClose();
          onLoginClick();
        }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Iniciar sesión
      </button>
      <hr className="my-1" />
      <Link
        to={ROUTES.owner.hostSpace}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={onClose}
      >
        Ofrece tu espacio
      </Link>
    </>
  );
};

export default GuestDropdown;
