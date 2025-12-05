import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProcessListSimple } from './components/ProcessListSimple';
import { ProcessDetailSimple } from './components/ProcessDetailSimple';
import { AdminPanel } from './components/AdminPanel';
import { CompliancePanelSimple } from './components/CompliancePanelSimple';
import { TemplateManagerSimple } from './components/TemplateManagerSimple';
import { ProcessTypesList } from './components/ProcessTypesList';
import { Login } from './components/Login';
import { AppSidebar } from './components/AppSidebar';
import logoEspol from 'figma:asset/2793a7bad49c6296879d99578377c2b3f531f7e5.png';
import { Toaster } from './components/ui/sonner';
import { SidebarProvider } from './components/ui/sidebar';
import { useAuth } from './auth/AuthContext';
import type { User } from './types';
import { Register } from './components/Register';

type ViewType =
  | 'dashboard'
  | 'processes'
  | 'process-detail'
  | 'admin'
  | 'compliance'
  | 'templates'
  | 'process-types';

interface ViewData {
  processId?: number;
  action?: string;
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [viewData, setViewData] = useState<ViewData>({});
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');


  const handleViewChange = (view: string, data?: any) => {
    setCurrentView(view as ViewType);
    setViewData(data || {});
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
    setViewData({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground">Cargando sesión...</span>
      </div>
    );
  }

  if (!user) {
  return (
    <>
      {authMode === 'login' ? (
        <Login onSwitchToRegister={() => setAuthMode('register')} />
      ) : (
        <Register onSwitchToLogin={() => setAuthMode('login')} />
      )}
      <Toaster />
    </>
  );
}


  const currentUser: User = user; // ya viene mapeado desde AuthContext

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />
        );
      case 'processes':
        return (
          <ProcessListSimple
            currentUser={currentUser}
            onViewChange={handleViewChange}
          />
        );
      case 'templates':
        return <TemplateManagerSimple currentUser={currentUser} />;
      case 'process-types':
        return (
          <ProcessTypesList
            currentUser={currentUser}
            onViewChange={handleViewChange}
          />
        );
      case 'process-detail':
        return viewData.processId ? (
          <ProcessDetailSimple
            processId={viewData.processId}
            currentUser={currentUser}
            onBack={() => handleViewChange('processes')}
          />
        ) : (
          <Dashboard
            currentUser={currentUser}
            onViewChange={handleViewChange}
          />
        );
      case 'admin':
        return <AdminPanel currentUser={currentUser} />;
      case 'compliance':
        return (
          <CompliancePanelSimple
            currentUser={currentUser}
            onViewChange={handleViewChange}
          />
        );
      default:
        return (
          <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="border-b bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={logoEspol}
                  alt="ESPOL"
                  className="h-6 w-auto object-contain"
                />
                <h2 className="text-muted-foreground">
                  Sistema de Gestión Documental - FIEC
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {currentUser.full_name} ({currentUser.role})
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-secondary">{renderView()}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
