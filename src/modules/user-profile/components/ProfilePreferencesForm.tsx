import React from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import type { UsuarioPreferencias } from '../types/profile.types';

interface ProfilePreferencesFormProps {
  preferencias: UsuarioPreferencias | null;
  onUpdated: () => void;
}

const ProfilePreferencesForm: React.FC<ProfilePreferencesFormProps> = ({ preferencias }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Bell className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Preferencias de Notificaciones</h3>
      </div>

      <div className="space-y-4">
        {/* Notificar Reservas */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Notificaciones de Reservas</p>
              <p className="text-sm text-gray-500">Recibir actualizaciones sobre tus reservas</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              defaultChecked={preferencias?.notificarReservas ?? true} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Notificar Promociones */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Promociones y Ofertas</p>
              <p className="text-sm text-gray-500">Recibir información sobre promociones especiales</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              defaultChecked={preferencias?.notificarPromociones ?? false} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Notificar Recordatorios */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Recordatorios</p>
              <p className="text-sm text-gray-500">Recibir recordatorios antes de tus reservas</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              defaultChecked={preferencias?.notificarRecordatorios ?? true} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 italic">
          💡 Las preferencias se guardarán automáticamente al cambiar cada opción
        </p>
      </div>
    </div>
  );
};

export default ProfilePreferencesForm;
