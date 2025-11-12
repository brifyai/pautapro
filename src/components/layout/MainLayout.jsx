import React, { useState } from 'react';
import HorizontalNav from './HorizontalNav';
import BreadcrumbNav from './BreadcrumbNav';

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar horizontal (restaurado) */}
      <HorizontalNav />

      <div className="flex">

        {/* Contenido principal */}
        <main className="flex-1 transition-all duration-300 ml-0">
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