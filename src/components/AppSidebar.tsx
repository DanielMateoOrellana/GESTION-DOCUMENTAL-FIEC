import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  Settings,
  LogOut,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { User } from "../types";
import logoEspol from "figma:asset/2793a7bad49c6296879d99578377c2b3f531f7e5.png";

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
}

export function AppSidebar({
  currentView,
  onViewChange,
  currentUser,
  onLogout,
}: AppSidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { id: "processes", label: "Procesos", icon: FolderKanban },
    {
      id: "notifications",
      label: "Notificaciones",
      icon: Bell,
    },
    { id: "reports", label: "Reportes", icon: BarChart3 },
    { id: "admin", label: "Administración", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex flex-col gap-3">
          <img 
            src={logoEspol} 
            alt="ESPOL Logo" 
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <div>
            <h2 className="text-sidebar-foreground">FIEC</h2>
            <p className="text-xs text-sidebar-foreground/70">
              Gestión Documental
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={currentView === item.id}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
              <span className="text-sidebar-primary-foreground text-sm">
                {currentUser.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-sidebar-foreground truncate">
                {currentUser.full_name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Button({ children, ...props }: any) {
  return <button {...props}>{children}</button>;
}