import { useState } from 'react';
import { User } from '../types';
import { mockUsers, mockRoles, mockProcessTypes } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users, UserCog, FolderKanban, Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from './ui/switch';

interface AdminPanelProps {
  currentUser: User;
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showNewProcessTypeDialog, setShowNewProcessTypeDialog] = useState(false);

  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
  });

  const [newProcessType, setNewProcessType] = useState({
    code: '',
    name: '',
    description: '',
  });

  const handleCreateUser = () => {
    console.log('Creating user:', newUser);
    setShowNewUserDialog(false);
    setNewUser({ full_name: '', email: '', password: '' });
  };

  const handleCreateProcessType = () => {
    console.log('Creating process type:', newProcessType);
    setShowNewProcessTypeDialog(false);
    setNewProcessType({ code: '', name: '', description: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Administración</h1>
        <p className="text-muted-foreground">
          Gestión de usuarios, roles y configuración del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockUsers.filter(u => u.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Roles Definidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockRoles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tipos de Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockProcessTypes.filter(pt => pt.active).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles">
            <UserCog className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="process-types">
            <FolderKanban className="w-4 h-4 mr-2" />
            Tipos de Proceso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuarios del Sistema</CardTitle>
                  <CardDescription>Gestiona los usuarios y sus permisos</CardDescription>
                </div>
                <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                      <DialogDescription>
                        Ingresa la información del nuevo usuario del sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                          id="full_name"
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                          placeholder="Dr. Juan Pérez"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="juan.perez@fiec.edu.ec"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Temporal</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Crear Usuario
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles del Sistema</CardTitle>
              <CardDescription>Define y gestiona los roles de usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRoles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Badge variant="outline">{role.code}</Badge>
                      </TableCell>
                      <TableCell>{role.name}</TableCell>
                      <TableCell className="max-w-md">{role.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process-types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tipos de Proceso</CardTitle>
                  <CardDescription>Crea y gestiona los tipos de procesos institucionales</CardDescription>
                </div>
                <Dialog open={showNewProcessTypeDialog} onOpenChange={setShowNewProcessTypeDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Tipo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Tipo de Proceso</DialogTitle>
                      <DialogDescription>
                        Define un nuevo tipo de proceso institucional
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input
                          id="code"
                          value={newProcessType.code}
                          onChange={(e) => setNewProcessType({ ...newProcessType, code: e.target.value.toUpperCase() })}
                          placeholder="EVAL_DOCENTE"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={newProcessType.name}
                          onChange={(e) => setNewProcessType({ ...newProcessType, name: e.target.value })}
                          placeholder="Evaluación Docente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                          id="description"
                          value={newProcessType.description}
                          onChange={(e) => setNewProcessType({ ...newProcessType, description: e.target.value })}
                          placeholder="Proceso de evaluación semestral..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewProcessTypeDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateProcessType}>
                        Crear Tipo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProcessTypes.map(type => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <Badge variant="outline">{type.code}</Badge>
                      </TableCell>
                      <TableCell>{type.name}</TableCell>
                      <TableCell className="max-w-md">{type.description}</TableCell>
                      <TableCell>
                        <Switch checked={type.active} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
