import React, { useState } from 'react';
import {
    UserPlus,
    Shield,
    Search,
    Edit,
    Trash2,
    X,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';

interface Controller {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'controller' | 'viewer';
    status: 'active' | 'pending' | 'inactive';
    assignedVenues: number;
    lastActive?: string;
}

const MOCK_CONTROLLERS: Controller[] = [
    {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        role: 'controller',
        status: 'active',
        assignedVenues: 3,
        lastActive: '2024-12-02',
    },
    {
        id: 2,
        name: 'María González',
        email: 'maria.gonzalez@example.com',
        role: 'admin',
        status: 'active',
        assignedVenues: 5,
        lastActive: '2024-12-01',
    },
    {
        id: 3,
        name: 'Carlos López',
        email: 'carlos.lopez@example.com',
        role: 'viewer',
        status: 'pending',
        assignedVenues: 0,
    },
];

const OwnerAssignmentsPage: React.FC = () => {
    const [controllers, setControllers] = useState<Controller[]>(MOCK_CONTROLLERS);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedController, setSelectedController] = useState<Controller | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'controller' | 'viewer'>('controller');
    const [inviteName, setInviteName] = useState('');

    const handleInvite = () => {
        // Mock invite action (would call backend API)
        const newController: Controller = {
            id: controllers.length + 1,
            name: inviteName,
            email: inviteEmail,
            role: inviteRole,
            status: 'pending',
            assignedVenues: 0,
        };

        setControllers([...controllers, newController]);
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
        setInviteRole('controller');
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este controlador?')) {
            setControllers(controllers.filter((c) => c.id !== id));
        }
    };

    const handleEdit = (controller: Controller) => {
        setSelectedController(controller);
        setShowEditModal(true);
    };

    const handleUpdateRole = () => {
        if (selectedController) {
            setControllers(
                controllers.map((c) =>
                    c.id === selectedController.id ? selectedController : c
                )
            );
            setShowEditModal(false);
            setSelectedController(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'controller':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'viewer':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'inactive':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'inactive':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredControllers = controllers.filter(
        (controller) =>
            controller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            controller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Gestión de Accesos
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Invita y administra controladores para tus espacios
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 font-medium"
                >
                    <UserPlus className="w-5 h-5" />
                    Invitar Usuario
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{controllers.length}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Activos</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {controllers.filter((c) => c.status === 'active').length}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-600">Pendientes</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {controllers.filter((c) => c.status === 'pending').length}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Admins</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {controllers.filter((c) => c.role === 'admin').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Controllers List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Sedes Asignadas
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Última Actividad
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredControllers.map((controller) => (
                                <tr
                                    key={controller.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {controller.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {controller.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(
                                                controller.role
                                            )}`}
                                        >
                                            {controller.role === 'admin'
                                                ? 'Administrador'
                                                : controller.role === 'controller'
                                                ? 'Controlador'
                                                : 'Visor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                controller.status
                                            )}`}
                                        >
                                            {getStatusIcon(controller.status)}
                                            {controller.status === 'active'
                                                ? 'Activo'
                                                : controller.status === 'pending'
                                                ? 'Pendiente'
                                                : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-900 font-medium">
                                            {controller.assignedVenues}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {controller.lastActive
                                                ? new Date(
                                                      controller.lastActive
                                                  ).toLocaleDateString('es-ES')
                                                : '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(controller)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(controller.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Invitar Usuario</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rol
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) =>
                                        setInviteRole(
                                            e.target.value as 'admin' | 'controller' | 'viewer'
                                        )
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white"
                                >
                                    <option value="viewer">Visor (Solo lectura)</option>
                                    <option value="controller">
                                        Controlador (Gestión de reservas)
                                    </option>
                                    <option value="admin">
                                        Administrador (Acceso completo)
                                    </option>
                                </select>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800">
                                    Se enviará una invitación por email al usuario con
                                    instrucciones para acceder.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={!inviteEmail || !inviteName}
                                className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Enviar Invitación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {showEditModal && selectedController && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Editar Rol</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usuario
                                </label>
                                <p className="text-gray-900 font-semibold">
                                    {selectedController.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {selectedController.email}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nuevo Rol
                                </label>
                                <select
                                    value={selectedController.role}
                                    onChange={(e) =>
                                        setSelectedController({
                                            ...selectedController,
                                            role: e.target.value as
                                                | 'admin'
                                                | 'controller'
                                                | 'viewer',
                                        })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white"
                                >
                                    <option value="viewer">Visor (Solo lectura)</option>
                                    <option value="controller">
                                        Controlador (Gestión de reservas)
                                    </option>
                                    <option value="admin">
                                        Administrador (Acceso completo)
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateRole}
                                className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerAssignmentsPage;
