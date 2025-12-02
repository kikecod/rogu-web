import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import AuthModal from '@/auth/components/AuthModal';

// Páginas de dueños
// Páginas de dueños
import OwnerLayout from './modules/admin-owner/layout/OwnerLayout';
import OwnerDashboardPage from './modules/admin-owner/pages/OwnerDashboardPage';
import OwnerSpacesPage from './modules/admin-owner/pages/OwnerSpacesPage';
import OwnerSpaceDetailPage from './modules/admin-owner/pages/OwnerSpaceDetailPage';
import OwnerEditSedePage from './modules/admin-owner/pages/OwnerEditSedePage';
import OwnerReviewsPage from './modules/admin-owner/pages/OwnerReviewsPage';
import OwnerFieldsPage from './modules/admin-owner/pages/OwnerFieldsPage';
import OwnerBookingsPage from './modules/admin-owner/pages/OwnerBookingsPage';
import OwnerAnalyticsPage from './modules/admin-owner/pages/OwnerAnalyticsPage';
import OwnerAssignmentsPage from './modules/admin-owner/pages/OwnerAssignmentsPage';
import OwnerSettingsPage from './modules/admin-owner/pages/OwnerSettingsPage';
import HostSpaceOwnerPage from './modules/admin-owner/pages/HostSpacePage';
import FieldCreationPage from './modules/fields/pages/FieldCreationPage';
import FieldManagementPage from './modules/admin-owner/pages/FieldManagementPage';

// import TestRolesPage from '@/core/pages/TestRolesPage'; // Página de desarrollo
import ProfilePage from '@/user-profile/pages/ProfilePage';
import { AuthProvider } from '@/auth/states/AuthProvider';
import { useAuth, type User } from '@/auth/hooks/useAuth';
import { ModeProvider } from './core/context/ModeContext';
import AboutUsPage from '@/core/pages/AboutUsPage';
import HowItWorksPage from '@/core/pages/HowItWorksPage';
import FAQPage from '@/core/pages/FAQPage';
import TermsPage from '@/core/pages/TermsPage';
import FieldDetailPage from '@/fields/pages/FieldDetailPage';
import VenueDetailPage from '@/venues/pages/VenueDetailPage';
import VenueCreationPage from '@/venues/pages/VenueCreationPage';
import CheckoutPage from '@/bookings/pages/CheckoutPage';
import BookingConfirmationPage from '@/bookings/pages/BookingConfirmationPage';
import EsperandoPagoPage from '@/bookings/pages/EsperandoPagoPage';
import MyBookingsPage from '@/bookings/pages/MyBookingsPage';
import FavoritesPage from './modules/favorites/pages/FavoritesPage';
import ProtectedRoute from '@/core/routing/ProtectedRoute';

import NewDashboardPage from '@/admin-panel/dashboard/pages/NewDashboardPage';
import UsuariosListPage from '@/admin-panel/usuarios/pages/UsuariosListPage';
import UsuarioDetallePage from '@/admin-panel/usuarios/pages/UsuarioDetallePage';
import UsuarioFormPage from '@/admin-panel/usuarios/pages/UsuarioFormPage';
import SedesListPage from '@/admin-panel/sedes/pages/SedesListPage';
import SedeFormPage from '@/admin-panel/sedes/pages/SedeFormPage';
import SedeDetallePage from '@/admin-panel/sedes/pages/SedeDetallePage';

// Importación de la rama 'modo-duenio'
import { VerificacionesPage } from '@/admin-panel/verificaciones';
// Importaciones de la rama 'dev'
import SedeCanchasPage from '@/admin-panel/sedes/canchas/pages/SedeCanchasPage';
import SedeCanchaDetailPage from '@/admin-panel/sedes/canchas/pages/SedeCanchaDetailPage';
import SedeCanchaFormPage from '@/admin-panel/sedes/canchas/pages/SedeCanchaFormPage';

import AdminLayout from '@/admin-panel/layout/AdminLayout';
import { ROUTES } from '@/config/routes';
import HomeRouter from './core/routing/HomeRouter';

const AppContent = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    const handleLoginClick = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const handleSignupClick = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleAuthModalClose = () => {
        setIsAuthModalOpen(false);
    };

    const handleSwitchAuthMode = () => {
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
    };

    const handleLoginSuccess = (userData: User) => {
        setIsAuthModalOpen(false);

        // Redirigir según el rol del usuario
        if (userData.roles?.includes('ADMIN')) {
            navigate(ROUTES.admin.dashboard);
            // Los clientes permanecen en la página actual
        };
    };

    return (
        <div className="App flex flex-col min-h-screen">
            <Navbar
                onLoginClick={handleLoginClick}
                onSignupClick={handleSignupClick}
                onLogout={handleLogout}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleAuthModalClose}
                mode={authMode}
                onSwitchMode={handleSwitchAuthMode}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* Fusión: Usamos el contenedor main de 'dev' para el padding, pero las rutas de 'Mejoras-duenio' */}
            <main className="flex-grow pt-20">
                <Routes>
                    <Route path={ROUTES.home} element={<HomeRouter />} />

                    {/* Página de desarrollo - comentada */}
                    {/* <Route path="/test-roles" element={<TestRolesPage />} /> */}

                    {/* Páginas públicas */}
                    <Route path={ROUTES.about} element={<AboutUsPage />} />
                    <Route path={ROUTES.howItWorks} element={<HowItWorksPage />} />
                    <Route path={ROUTES.faq} element={<FAQPage />} />
                    <Route path={ROUTES.terms} element={<TermsPage />} />

                    {/* Venue y fields */}
                    <Route path={ROUTES.venuePattern} element={<VenueDetailPage />} />
                    <Route path={ROUTES.venueFieldPattern} element={<FieldDetailPage />} />

                    {/* Legacy */}
                    <Route path={ROUTES.fieldPattern} element={<FieldDetailPage />} />
                    <Route path={ROUTES.sedePattern} element={<VenueDetailPage />} />

                    {/* Booking */}
                    <Route path={ROUTES.checkout} element={<CheckoutPage />} />
                    <Route path={ROUTES.bookingConfirmationPattern} element={<BookingConfirmationPage />} />
                    <Route path={ROUTES.bookingConfirmationBase} element={<BookingConfirmationPage />} />
                    <Route path={ROUTES.esperandoPago} element={<EsperandoPagoPage />} />

                    <Route path={ROUTES.bookings} element={<MyBookingsPage />} />
                    <Route path={ROUTES.profile} element={<ProfilePage />} />

                    {/* Favoritos PROTEGIDO */}
                    <Route
                        path={ROUTES.favoritos}
                        element={
                            <ProtectedRoute redirectTo={ROUTES.home} showUnauthorized={false}>
                                <FavoritesPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Panel de administración - PROTEGIDO SOLO ADMIN */}
                    <Route
                        path={ROUTES.admin.dashboard}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo="/" showUnauthorized={true}>
                                <AdminLayout>
                                    <NewDashboardPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.usuarios}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <UsuariosListPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.admin.usuariosNuevo}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <UsuarioFormPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.admin.usuarioDetallePattern}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <UsuarioDetallePage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.admin.usuarioEditarPattern}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <UsuarioFormPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.verificaciones}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <VerificacionesPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.sedes}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedesListPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.sedesNueva}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeFormPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/sedes/:id"
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeDetallePage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/sedes/:id/editar"
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeFormPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.sedesCanchasPattern}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeCanchasPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.sedesCanchasCrearPattern}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeCanchaFormPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.admin.sedeCanchaDetallePattern}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeCanchaDetailPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.admin.sedeCanchaEditarPattern}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <AdminLayout>
                                    <SedeCanchaFormPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas Dueños (owner) - PROTEGIDO ADMIN o DUENIO */}
                    <Route
                        path="/owner"
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <OwnerLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<OwnerDashboardPage />} />
                        <Route path="spaces" element={<OwnerSpacesPage />} />
                        <Route path="spaces/:id" element={<OwnerSpaceDetailPage />} />
                        <Route path="spaces/:id/edit" element={<OwnerEditSedePage />} />
                        <Route path="spaces/:id/fields/new" element={<FieldCreationPage />} />
                        <Route path="spaces/:id/fields/:idCancha" element={<FieldManagementPage />} />
                        <Route path="fields" element={<OwnerFieldsPage />} />
                        <Route path="bookings" element={<OwnerBookingsPage />} />
                        <Route path="reviews" element={<OwnerReviewsPage />} />
                        <Route path="analytics" element={<OwnerAnalyticsPage />} />
                        <Route path="assignments" element={<OwnerAssignmentsPage />} />
                        <Route path="settings" element={<OwnerSettingsPage />} />
                    </Route>

                    {/* Ruta independiente para crear sede (fuera del layout si es necesario o mantener como estaba) */}
                    <Route
                        path={ROUTES.owner.createVenue}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <VenueCreationPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Ruta para Host Space (verificación inicial) */}
                    <Route
                        path={ROUTES.owner.hostSpace}
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN', 'CLIENTE']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <HostSpaceOwnerPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas legacy - PROTEGIDAS ADMIN o DUENIO */}
                    <Route
                        path="/host"
                        element={
                            <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                <HostSpaceOwnerPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <ModeProvider>
                <Router>
                    <AppContent />
                </Router>
            </ModeProvider>
        </AuthProvider>
    );
}

export default App;