import { type ReactNode, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { applyAdminTheme } from './adminTheme';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  useEffect(() => {
    applyAdminTheme();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2fb] via-[#f7f9fc] to-white">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-4 py-6 md:px-8 lg:px-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
