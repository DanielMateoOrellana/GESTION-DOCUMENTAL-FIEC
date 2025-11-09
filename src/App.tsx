import { useState } from 'react';
import { SidebarProvider } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import { Login } from './components/Login';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { ProcessList } from './components/ProcessList';
import { ProcessDetail } from './components/ProcessDetail';
import { NotificationPanel } from './components/NotificationPanel';
import { AdminPanel } from './components/AdminPanel';
import { ReportsPanel } from './components/ReportsPanel';
import { CompliancePanel } from './components/CompliancePanel';
import { TagManager } from './components/TagManager';
import { TemplateManager } from './components/TemplateManager';
import { User } from './types';
import { mockUsers } from './data/mockData';
import { Bell } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import logoEspol from 'figma:asset/2793a7bad49c6296879d99578377c2b3f531f7e5.png';

type ViewType = 'dashboard' | 'processes' | 'process-detail' | 'notifications' | 'reports' | 'admin' | 'compliance' | 'tags' | 'templates';

interface ViewData {
  processId?: number;
  action?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [viewData, setViewData] = useState<ViewData>({});
  const [unreadNotifications] = useState(2);

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      alert('Credenciales inválidas. Use: carlos.mendoza@fiec.edu.ec / password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
    setViewData({});
  };

  const handleViewChange = (view: string, data?: any) => {
    setCurrentView(view as ViewType);
    setViewData(data || {});
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />;
      case 'processes':
        return <ProcessList currentUser={currentUser} onViewChange={handleViewChange} />;
      case 'process-detail':
        return viewData.processId ? (
          <ProcessDetail
            processId={viewData.processId}
            currentUser={currentUser}
            onBack={() => handleViewChange('processes')}
          />
        ) : (
          <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />
        );
      case 'notifications':
        return <NotificationPanel currentUser={currentUser} onViewChange={handleViewChange} />;
      case 'reports':
        return <ReportsPanel currentUser={currentUser} />;
      case 'compliance':
        return <CompliancePanel currentUser={currentUser} onViewChange={handleViewChange} />;
      case 'admin':
        return <AdminPanel currentUser={currentUser} />;
      case 'tags':
        return <TagManager currentUser={currentUser} />;
      case 'templates':
        return <TemplateManager currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />;
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => handleViewChange('notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-accent">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-secondary">
            {renderView()}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}