import React, { useState, useEffect } from 'react';
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
    Loader2,
    Building2,
} from 'lucide-react';
import { controllerAssignmentService, type Persona } from '../services/controller-assignment.service';
import { sedesService } from '../../admin-panel/sedes/services/sedes.service';
import { useAuth } from '../../auth/hooks/useAuth';

interface Controller {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'controller' | 'viewer';
    status: 'active' | 'pending' | 'inactive';
    assignedVenues: number;
    assignedVenueIds?: number[];
    lastActive?: string;
    idPersona?: number; // ID from backend
}

interface Venue {
    idSede: number;
    nombre: string;
    direccion?: string;
    ciudad?: string;
}

const OwnerAssignmentsPage: React.FC = () => {
    const { user } = useAuth();
    const [controllers, setControllers] = useState<Controller[]>([]); // Start with empty array
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedController, setSelectedController] = useState<Controller | null>(null);
    const [selectedVenuesToRemove, setSelectedVenuesToRemove] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Venues state
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loadingVenues, setLoadingVenues] = useState(false);

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
    const [turno, setTurno] = useState<string>('Mañana');
    const [searchedPerson, setSearchedPerson] = useState<Persona | null>(null);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Assignment workflow state
    const [loadingAssignment, setLoadingAssignment] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [loadingControllers, setLoadingControllers] = useState(false);

    // Load owner's venues on mount
    useEffect(() => {
        const loadVenues = async () => {
            if (!user?.idPersona) {
                console.log('No user idPersona available');
                return;
            }

            setLoadingVenues(true);
            try {
                console.log('Loading venues for owner:', user.idPersona);
                const response = await sedesService.getAll({
                    idDuenio: user.idPersona,
                });
                console.log('Venues loaded:', response.sedes);
                setVenues(response.sedes);
            } catch (error) {
                console.error('Error loading venues:', error);
            } finally {
                setLoadingVenues(false);
            }
        };

        loadVenues();
    }, [user]);

    // Load controllers from backend on mount
    useEffect(() => {
        const loadControllers = async () => {
            if (!user?.idPersona) return;

            setLoadingControllers(true);
            try {
                // Get all trabaja assignments
                const assignments = await controllerAssignmentService.getAllAssignments();

                // Filter assignments for owner's venues
                const ownerVenueIds = venues.map(v => v.idSede);
                const relevantAssignments = assignments.filter(a =>
                    ownerVenueIds.includes(a.idSede)
                );

                // Group by controller (idPersonaOpe) and count assignments
                const controllerMap = new Map<number, {
                    person: any;
                    venueCount: number;
                    email: string;
                    name: string;
                    venueIds: number[];
                }>();

                for (const assignment of relevantAssignments) {
                    const idPersona = assignment.idPersonaOpe;

                    if (controllerMap.has(idPersona)) {
                        const existing = controllerMap.get(idPersona)!;
                        existing.venueCount++;
                        existing.venueIds.push(assignment.idSede);
                    } else {
                        // Get persona info from controlador relation
                        const persona = assignment.controlador?.persona;
                        if (persona) {
                            controllerMap.set(idPersona, {
                                person: persona,
                                venueCount: 1,
                                email: persona.usuario?.correo || persona.correo || '',
                                name: `${persona.nombres} ${persona.paterno} ${persona.materno || ''}`,
                                venueIds: [assignment.idSede],
                            });
                        }
                    }
                }

                // Convert map to controller array
                const loadedControllers: Controller[] = Array.from(controllerMap.entries()).map(
                    ([idPersona, data]) => ({
                        id: idPersona,
                        idPersona: idPersona,
                        name: data.name,
                        email: data.email,
                        role: 'controller',
                        status: 'active',
                        assignedVenues: data.venueCount,
                        assignedVenueIds: data.venueIds,
                    })
                );

                setControllers(loadedControllers);
            } catch (error) {
                console.error('Error loading controllers:', error);
            } finally {
                setLoadingControllers(false);
            }
        };

        // Only load controllers after venues are loaded
        if (venues.length > 0) {
            loadControllers();
        }
    }, [venues, user]);

    const handleSearch = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        setSearchedPerson(null);

        if (!inviteEmail) {
            setErrorMessage('Por favor ingrese un correo electrónico');
            return;
        }

        setLoadingSearch(true);

        try {
            const persona = await controllerAssignmentService.searchPersonByEmail(inviteEmail);
            // Ensure email is present, fallback to searched email if missing
            setSearchedPerson({
                ...persona,
                correo: persona.correo || inviteEmail
            });
            setSuccessMessage(`✅ Persona encontrada: ${persona.nombres} ${persona.paterno}`);
        } catch (error: any) {
            console.error('Error searching person:', error);
            if (error.response?.status === 404) {
                setErrorMessage('❌ No se encontró una persona registrada con ese correo.');
            } else if (error.response?.data?.message) {
                setErrorMessage(`❌ Error: ${error.response.data.message}`);
            } else {
                setErrorMessage('❌ Ocurrió un error al buscar la persona.');
            }
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleAssign = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!searchedPerson || !selectedVenue) {
            setErrorMessage('Por favor busque una persona y seleccione una sede');
            return;
        }

        setLoadingAssignment(true);

        try {
            // Check if person is controller
            let controlador = await controllerAssignmentService.checkIfController(searchedPerson.idPersona);

            // Create controller if doesn't exist
            if (!controlador) {
                const createData = {
                    idPersonaOpe: searchedPerson.idPersona,
                    idSede: selectedVenue,
                    codigoEmpleado: `CTRL${searchedPerson.idPersona}`,
                    activo: true,
                    turno: turno,
                };
                controlador = await controllerAssignmentService.createController(createData);
            }

            // Assign to venue
            await controllerAssignmentService.assignToVenue({
                idPersonaOpe: searchedPerson.idPersona,
                idSede: selectedVenue,
            });

            const venueName = venues.find((v) => v.idSede === selectedVenue)?.nombre || 'la sede';
            const personName = `${searchedPerson.nombres} ${searchedPerson.paterno} ${searchedPerson.materno || ''}`;

            setSuccessMessage(
                `✅ ${personName} ha sido asignado como controlador a ${venueName} exitosamente.`
            );

            // Reload page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('Error assigning controller:', error);

            if (error.response?.data?.message) {
                setErrorMessage(`❌ Error: ${error.response.data.message}`);
            } else {
                setErrorMessage('❌ Ocurrió un error al asignar el controlador.');
            }
        } finally {
            setLoadingAssignment(false);
        }
    };


    const handleDelete = (controller: Controller) => {
        if (!controller.idPersona) {
            alert('No se puede eliminar este controlador (falta información del backend)');
            return;
        }

        setSelectedController(controller);
        setSelectedVenuesToRemove([]);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedController?.idPersona || selectedVenuesToRemove.length === 0) {
            alert('Por favor seleccione al menos una sede');
            return;
        }

        setDeletingId(selectedController.id);

        try {
            // Remove from each selected venue
            for (const idSede of selectedVenuesToRemove) {
                await controllerAssignmentService.removeAssignment(
                    selectedController.idPersona,
                    idSede
                );
            }

            // Update controller's assigned venues count
            const remainingVenues = selectedController.assignedVenues - selectedVenuesToRemove.length;

            if (remainingVenues <= 0) {
                // Remove from list if no venues left
                setControllers(controllers.filter((c) => c.id !== selectedController.id));
            } else {
                // Update assigned venues count
                setControllers(
                    controllers.map((c) =>
                        c.id === selectedController.id
                            ? { ...c, assignedVenues: remainingVenues }
                            : c
                    )
                );
            }

            setShowDeleteModal(false);
            setSelectedController(null);
            setSelectedVenuesToRemove([]);
        } catch (error: any) {
            console.error('Error removing controller:', error);
            alert('Error al eliminar el controlador de la(s) sede(s)');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleVenueSelection = (idSede: number) => {
        setSelectedVenuesToRemove((prev) =>
            prev.includes(idSede)
                ? prev.filter((id) => id !== idSede)
                : [...prev, idSede]
        );
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 font-medium"
                >
                    <UserPlus className="w-5 h-5" />
                    Agregar Controlador
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

                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingControllers ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                                            <p>Cargando controladores...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : controllers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No hay controladores asignados.
                                    </td>
                                </tr>
                            ) : (
                                controllers
                                    .filter((c) =>
                                        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((controller) => (
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
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(controller)}
                                                        disabled={deletingId === controller.id}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId === controller.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Agregar Controlador</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Error Message */}
                            {errorMessage && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in">
                                    <p className="text-sm text-red-800">{errorMessage}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in">
                                    <p className="text-sm text-green-800">{successMessage}</p>
                                </div>
                            )}

                            {/* Step 1: Search by Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email del Controlador *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => {
                                            setInviteEmail(e.target.value);
                                            setSearchedPerson(null);
                                        }}
                                        placeholder="usuario@ejemplo.com"
                                        disabled={loadingSearch || loadingAssignment}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={!inviteEmail || loadingSearch || loadingAssignment}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {loadingSearch ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                Buscar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Person Data Display */}
                            {searchedPerson && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-green-900 mb-2">Persona Encontrada</h4>
                                    <div className="space-y-1 text-sm text-green-800">
                                        <p><strong>Nombre:</strong> {searchedPerson.nombres} {searchedPerson.paterno} {searchedPerson.materno}</p>
                                        <p><strong>Correo:</strong> {searchedPerson.correo}</p>
                                        {searchedPerson.telefono && (
                                            <p><strong>Teléfono:</strong> {searchedPerson.telefono}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Venue and Assign */}
                            {searchedPerson && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sede a Asignar *
                                        </label>
                                        <select
                                            value={selectedVenue || ''}
                                            onChange={(e) => setSelectedVenue(Number(e.target.value))}
                                            disabled={loadingAssignment || loadingVenues}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Seleccione una sede</option>
                                            {venues.map((venue) => (
                                                <option key={venue.idSede} value={venue.idSede}>
                                                    {venue.nombre} - {venue.ciudad}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Turno
                                        </label>
                                        <select
                                            value={turno}
                                            onChange={(e) => setTurno(e.target.value)}
                                            disabled={loadingAssignment}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="Mañana">Mañana</option>
                                            <option value="Tarde">Tarde</option>
                                            <option value="Noche">Noche</option>
                                            <option value="Completo">Completo</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-800">
                                        {!searchedPerson
                                            ? 'Busca primero a la persona por email para verificar sus datos.'
                                            : 'Selecciona la sede y turno, luego haz clic en "Asignar" para asignar el controlador.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setSearchedPerson(null);
                                    setInviteEmail('');
                                    setSelectedVenue(null);
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                }}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            {searchedPerson && (
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedVenue || loadingAssignment}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                >
                                    {loadingAssignment ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Asignando...
                                        </>
                                    ) : (
                                        'Asignar'
                                    )}
                                </button>
                            )}
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedController && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Quitar Controlador</h3>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedController(null);
                                    setSelectedVenuesToRemove([]);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="font-semibold text-gray-900">{selectedController.name}</p>
                                <p className="text-sm text-gray-600">{selectedController.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccione de qué sede(s) quitar al controlador:
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3">
                                    {venues.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No hay sedes disponibles
                                        </p>
                                    ) : (
                                        venues
                                            .filter((venue) => selectedController.assignedVenueIds?.includes(venue.idSede))
                                            .map((venue) => (
                                                <label
                                                    key={venue.idSede}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVenuesToRemove.includes(venue.idSede)}
                                                        onChange={() => toggleVenueSelection(venue.idSede)}
                                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{venue.nombre}</p>
                                                        <p className="text-xs text-gray-500">{venue.ciudad}</p>
                                                    </div>
                                                </label>
                                            ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">
                                        Al quitar el controlador de todas las sedes, se desactivará automáticamente y perderá el rol de controlador.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedController(null);
                                    setSelectedVenuesToRemove([]);
                                }}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={selectedVenuesToRemove.length === 0 || deletingId !== null}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                {deletingId ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    `Quitar de ${selectedVenuesToRemove.length} sede(s)`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerAssignmentsPage;
