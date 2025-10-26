import { useState } from 'react';
import { User, Notification } from '../types';
import { mockNotifications } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, BellOff, CheckCheck, Info, AlertCircle, FileText, Settings as SettingsIcon } from 'lucide-react';

interface NotificationPanelProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function NotificationPanel({ currentUser, onViewChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(
    mockNotifications.filter(n => n.user_id === currentUser.id)
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'REMINDER':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      case 'APPROVAL_PENDING':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'RETURNED':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'SYSTEM':
        return <SettingsIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'INFO': 'bg-blue-50 border-blue-200',
      'REMINDER': 'bg-yellow-50 border-yellow-200',
      'APPROVAL_PENDING': 'bg-orange-50 border-orange-200',
      'RETURNED': 'bg-red-50 border-red-200',
      'SYSTEM': 'bg-gray-50 border-gray-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const typeLabels: Record<string, string> = {
    'INFO': 'Información',
    'REMINDER': 'Recordatorio',
    'APPROVAL_PENDING': 'Pendiente de Firma',
    'RETURNED': 'Devuelto',
    'SYSTEM': 'Sistema',
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={`border rounded-lg p-4 space-y-3 transition-colors ${
        notification.is_read ? 'bg-white' : getNotificationColor(notification.type)
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span>{notification.title}</span>
              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-accent" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.body}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {new Date(notification.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <Badge variant="outline" className="text-xs">
                {typeLabels[notification.type] || notification.type}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        {!notification.is_read && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAsRead(notification.id)}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Marcar como leída
          </Button>
        )}
        {notification.process_instance_id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('process-detail', { processId: notification.process_instance_id })}
          >
            Ver Proceso
          </Button>
        )}
      </div>
    </div>
  );

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Notificaciones</h1>
          <p className="text-muted-foreground">
            Centro de notificaciones y actualizaciones del sistema
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sin Leer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {notifications.filter(n => n.type === 'REMINDER').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {notifications.filter(n => n.type === 'APPROVAL_PENDING').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Sin Leer ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Leídas ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(renderNotification)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No tienes notificaciones</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length > 0 ? (
            <div className="space-y-3">
              {unreadNotifications.map(renderNotification)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCheck className="w-12 h-12 mx-auto mb-4 text-green-600 opacity-50" />
                <p className="text-muted-foreground">No tienes notificaciones sin leer</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length > 0 ? (
            <div className="space-y-3">
              {readNotifications.map(renderNotification)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No tienes notificaciones leídas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
