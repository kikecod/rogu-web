import React, { useState } from 'react';
import {
    User,
    Bell,
    Shield,
    Mail,
    Phone,
    MapPin,
    Save,
    Eye,
    EyeOff,
    Check,
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';

const OwnerSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>(
        'profile'
    );
    const [showPassword, setShowPassword] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        direccion: '',
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        newBookings: true,
        bookingReminders: true,
        reviewAlerts: true,
        promotions: false,
        weeklyReport: true,
    });

    // Security State
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSave = () => {
        // Mock save action
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'security', label: 'Seguridad', icon: Shield },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Configuración
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Administra tus preferencias y ajustes
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saved}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 font-medium disabled:opacity-50"
                >
                    {saved ? (
                        <>
                            <Check className="w-5 h-5" />
                            Guardado
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-600" />
                            Información Personal
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={profileData.nombre}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, nombre: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    value={profileData.apellido}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, apellido: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="Tu apellido"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, email: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.telefono}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, telefono: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="+591 12345678"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={profileData.direccion}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, direccion: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="Tu dirección"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-600" />
                            Preferencias de Notificaciones
                        </h2>

                        <div className="space-y-4">
                            {[
                                {
                                    key: 'newBookings',
                                    label: 'Nuevas Reservas',
                                    description: 'Recibe notificaciones cuando haya nuevas reservas',
                                },
                                {
                                    key: 'bookingReminders',
                                    label: 'Recordatorios de Reservas',
                                    description:
                                        'Recordatorios antes de las reservas programadas',
                                },
                                {
                                    key: 'reviewAlerts',
                                    label: 'Alertas de Reseñas',
                                    description: 'Notificaciones cuando recibas nuevas reseñas',
                                },
                                {
                                    key: 'promotions',
                                    label: 'Promociones y Ofertas',
                                    description: 'Información sobre nuevas funcionalidades y ofertas',
                                },
                                {
                                    key: 'weeklyReport',
                                    label: 'Reporte Semanal',
                                    description: 'Resumen semanal de actividad y estadísticas',
                                },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-start justify-between p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {item.label}
                                        </h3>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications[item.key as keyof typeof notifications]}
                                            onChange={(e) =>
                                                setNotifications({
                                                    ...notifications,
                                                    [item.key]: e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-600" />
                            Cambiar Contraseña
                        </h2>

                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña Actual
                                </label>
                                <input
                                    type="password"
                                    value={securityData.currentPassword}
                                    onChange={(e) =>
                                        setSecurityData({
                                            ...securityData,
                                            currentPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={securityData.newPassword}
                                        onChange={(e) =>
                                            setSecurityData({
                                                ...securityData,
                                                newPassword: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={securityData.confirmPassword}
                                    onChange={(e) =>
                                        setSecurityData({
                                            ...securityData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="pt-2">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm text-blue-800">
                                        La contraseña debe tener al menos 8 caracteres e incluir
                                        mayúsculas, minúsculas y números.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerSettingsPage;
