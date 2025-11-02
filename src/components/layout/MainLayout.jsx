import React, { useState } from 'react';
import ModernNavbar from './ModernNavbar';
import CollapsibleSidebar from './CollapsibleSidebar';
import BreadcrumbNav from './BreadcrumbNav';

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar superior */}
      <ModernNavbar
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar lateral */}
        <CollapsibleSidebar collapsed={sidebarCollapsed} />

        {/* Contenido principal */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            {/* Breadcrumb navigation */}
            <BreadcrumbNav />

            {/* Contenido de la página */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;