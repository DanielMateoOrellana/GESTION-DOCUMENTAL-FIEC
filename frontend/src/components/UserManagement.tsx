import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { User, Role, UserRole } from '../types';
import { mockUsers, mockRoles } from '../data/mockData';
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserManagementProps {
  currentUser: User;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [userRoles, setUserRoles] = useState<UserRole[]>([
    { user_id: 1, role_id: 1, created_at: '2024-01-15T08:00:00Z' }, // Carlos - Admin
    { user_id: 1, role_id: 2, created_at: '2024-01-15T08:00:00Z' }, // Carlos - Decano
    { user_id: 2, role_id: 3, created_at: '2024-01-15T08:00:00Z' }, // María - Subdecano
    { user_id: 2, role_id: 5, created_at: '2024-01-15T08:00:00Z' }, // María - Secretaría
    { user_id: 3, role_id: 4, created_at: '2024-01-15T08:00:00Z' }, // Juan - Director
  ]);
  
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // New user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserActive, setNewUserActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const getUserRoles = (userId: number): Role[] => {
    const roleIds = userRoles.filter(ur => ur.user_id === userId).map(ur => ur.role_id);
    return mockRoles.filter(r => roleIds.includes(r.id));
  };

  const handleCreateUser = () => {
    // Validate minimum data
    if (!newUserName || !newUserEmail) {
      toast.error('Por favor complete los datos mínimos (nombre y email)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast.error('Por favor ingrese un email válido');
      return;
    }

    // Check if email already exists
    if (users.find(u => u.email === newUserEmail)) {
      toast.error('El email ya está registrado');
      return;
    }

    const newUser: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      full_name: newUserName,
      email: newUserEmail,
      is_active: newUserActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    
    // Create user roles if any selected
    if (selectedRoles.length > 0) {
      const newUserRoles: UserRole[] = selectedRoles.map(roleId => ({
        user_id: newUser.id,
        role_id: roleId,
        created_at: new Date().toISOString()
      }));
      setUserRoles([...userRoles, ...newUserRoles]);
      toast.success(`Usuario creado exitosamente con ${selectedRoles.length} rol(es) asignado(s). Los permisos se aplican inmediatamente.`);
    } else {
      toast.success('Usuario creado exitosamente');
    }

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserActive(true);
    setSelectedRoles([]);
    setIsCreatingUser(false);
  };

  const handleOpenRoleAssignment = (userId: number) => {
    setSelectedUserId(userId);
    const currentRoles = userRoles.filter(ur => ur.user_id === userId).map(ur => ur.role_id);
    setSelectedRoles(currentRoles);
    setIsEditingRoles(true);
  };

  const handleSaveRoles = () => {
    if (selectedUserId === null) return;

    // Remove existing roles for this user
    const otherUserRoles = userRoles.filter(ur => ur.user_id !== selectedUserId);
    
    // Add new roles
    const newUserRoles: UserRole[] = selectedRoles.map(roleId => ({
      user_id: selectedUserId,
      role_id: roleId,
      created_at: new Date().toISOString()
    }));

    setUserRoles([...otherUserRoles, ...newUserRoles]);
    toast.success('Roles actualizados exitosamente. Los permisos se han aplicado inmediatamente.');
    
    setIsEditingRoles(false);
    setSelectedUserId(null);
    setSelectedRoles([]);
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleToggleUserActive = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, is_active: !u.is_active, updated_at: new Date().toISOString() } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(`Usuario ${user?.full_name} ${!user?.is_active ? 'activado' : 'desactivado'}`);
  };

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Administración de Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Gestión de usuarios y asignación de roles
          </p>
        </div>
        <Button onClick={() => setIsCreatingUser(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Roles Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Roles del Sistema</CardTitle>
          <CardDescription>
            Roles disponibles para asignar a los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockRoles.map(role => (
              <div key={role.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <div>{role.name}</div>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const roles = getUserRoles(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {roles.length > 0 ? (
                          roles.map(role => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggleUserActive(user.id)}
                        />
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRoleAssignment(user.id)}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Roles
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los datos mínimos del usuario y asigne roles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Nombre Completo *</Label>
              <Input
                id="user-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Ej: Dr. Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="juan.perez@fiec.edu.ec"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="user-active"
                checked={newUserActive}
                onCheckedChange={setNewUserActive}
              />
              <Label htmlFor="user-active">Usuario activo</Label>
            </div>

            <div>
              <Label className="mb-3 block">Asignar Roles (Opcional)</Label>
              <div className="space-y-2 border rounded-lg p-4">
                {mockRoles.map(role => (
                  <div key={role.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => handleToggleRole(role.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                        {role.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Los roles y permisos se aplicarán inmediatamente al guardar
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingUser(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Roles Dialog */}
      <Dialog open={isEditingRoles} onOpenChange={setIsEditingRoles}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Roles</DialogTitle>
            <DialogDescription>
              {selectedUser && `Gestionar roles para ${selectedUser.full_name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {mockRoles.map(role => (
              <div key={role.id} className="flex items-start gap-3">
                <Checkbox
                  id={`edit-role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => handleToggleRole(role.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={`edit-role-${role.id}`} className="cursor-pointer">
                    {role.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingRoles(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRoles}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
