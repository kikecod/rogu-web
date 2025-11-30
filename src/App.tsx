import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import AuthModal from '@/auth/components/AuthModal';

// Páginas de dueños
import HostSpaceOwnerPage from './modules/admin-owner/pages/HostSpacePage';
import AdminSpacesOwnerPage from './modules/admin-owner/pages/AdminSpacesPage';
import OwnerModePage from './modules/admin-owner/pages/OwnerModePage';
import ResenasPage from './modules/analytics/pages/ResenasPage';

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
import VenueManagementPage from '@/venues/pages/VenueManagementPage';
import VenueCreationPage from '@/venues/pages/VenueCreationPage';
import FieldManagementPage from '@/fields/pages/FieldManagementPage';
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

// ----- INICIO DE SECCIÓN FUSIONADA -----
// Importación de la rama 'modo-duenio'
import { VerificacionesPage } from '@/admin-panel/verificaciones';
// Importaciones de la rama 'dev'
import SedeCanchasPage from '@/admin-panel/sedes/canchas/pages/SedeCanchasPage';
import SedeCanchaDetailPage from '@/admin-panel/sedes/canchas/pages/SedeCanchaDetailPage';
import SedeCanchaFormPage from '@/admin-panel/sedes/canchas/pages/SedeCanchaFormPage';
// ----- FIN DE SECCIÓN FUSIONADA -----

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
                                        path={ROUTES.owner.hostSpace}
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'CLIENTE']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <HostSpaceOwnerPage />
                                                </ProtectedRoute>
                                        }
                                />

                                <Route
                                        path={ROUTES.owner.mode}
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <OwnerModePage />
                                                </ProtectedRoute>
                                        }
                                />

                                <Route
                                        path={ROUTES.owner.venueDetailPattern}
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <VenueManagementPage />
                                                </ProtectedRoute>
                                        }
                                />

                                <Route
                                        path={ROUTES.owner.venueFieldManagementPattern}
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <FieldManagementPage />
                                                </ProtectedRoute>
                                        }
                                />

                                <Route
                                        path={ROUTES.owner.resenas}
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <ResenasPage />
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
                                <Route
                                        path="/admin-spaces"
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <AdminSpacesOwnerPage />
                                                </ProtectedRoute>
                                        }
                                />
                                <Route
                                        path={ROUTES.owner.createVenue}
                                        element={
                                                <ProtectedRoute requiredRoles={['ADMIN', 'DUENIO']} redirectTo={ROUTES.home} showUnauthorized={true}>
                                                        <VenueCreationPage />
                                                </ProtectedRoute>
                                        }
                                />
                        </Routes>
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