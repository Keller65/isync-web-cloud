"use client"

import { useState } from "react"
import { PencilSimple, User } from "@phosphor-icons/react"
import Avvvatars from "avvvatars-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

type AccessLevel = "none" | "read" | "write" | "full"

interface UserPermissions {
  analiticas: AccessLevel
  pedidos: AccessLevel
  cobros: AccessLevel
  visitas: AccessLevel
  ubicaciones: AccessLevel
}

interface UserData {
  id: string
  name: string
  email: string
  active: boolean
  avatarUrl?: string
  permissions: UserPermissions
}

const initialUsers: UserData[] = [
  {
    id: "1",
    name: "Juan Perez",
    email: "juan.perez@example.com",
    active: true,
    permissions: {
      analiticas: "full",
      pedidos: "write",
      cobros: "read",
      visitas: "none",
      ubicaciones: "read",
    },
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    active: false,
    permissions: {
      analiticas: "read",
      pedidos: "read",
      cobros: "none",
      visitas: "none",
      ubicaciones: "none",
    },
  },
  {
    id: "3",
    name: "Carlos Sanchez",
    email: "carlos.sanchez@example.com",
    active: true,
    permissions: {
      analiticas: "full",
      pedidos: "full",
      cobros: "full",
      visitas: "full",
      ubicaciones: "full",
    },
  },
]

const permissionLabels: Record<keyof UserPermissions, string> = {
  analiticas: "Analíticas",
  pedidos: "Pedidos",
  cobros: "Cobros",
  visitas: "Visitas",
  ubicaciones: "Ubicaciones",
}

export default function Page() {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEditClick = (user: UserData) => {
    setSelectedUser(JSON.parse(JSON.stringify(user))) // Deep copy to avoid direct mutation
    setIsModalOpen(true)
  }

  const handleSavePermissions = () => {
    if (selectedUser) {
      setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user)))
      setIsModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handleToggleActive = (checked: boolean) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, active: checked })
    }
  }

  const handlePermissionChange = (key: keyof UserPermissions, value: AccessLevel) => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        permissions: {
          ...selectedUser.permissions,
          [key]: value,
        },
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button>Nuevo Usuario</Button>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avvvatars value={user.email} style="shape" size={40} />
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.active ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                    <PencilSimple size={20} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Configuración de Usuario</DialogTitle>
            <DialogDescription>
              Administra el acceso y permisos de {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <Avvvatars value={selectedUser.email} style="shape" size={60} />
                <div className="grid gap-1">
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <Switch
                    id="user-status"
                    checked={selectedUser.active}
                    onCheckedChange={handleToggleActive}
                  />
                  <Label htmlFor="user-status">{selectedUser.active ? "Habilitado" : "Deshabilitado"}</Label>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <Label className="text-base font-bold text-brand-primary">Permisos por Pantalla</Label>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid gap-6">
                    {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((key) => (
                      <div key={key} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <Label className="font-semibold text-sm">{permissionLabels[key]}</Label>
                          <span className="text-xs text-muted-foreground capitalize">
                            Nivel: {selectedUser.permissions[key] === 'none' ? 'Sin acceso' : selectedUser.permissions[key]}
                          </span>
                        </div>
                        <Tabs 
                          value={selectedUser.permissions[key]} 
                          onValueChange={(v) => handlePermissionChange(key, v as AccessLevel)}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="none">Ninguno</TabsTrigger>
                            <TabsTrigger value="read">Ver</TabsTrigger>
                            <TabsTrigger value="write">Editar</TabsTrigger>
                            <TabsTrigger value="full">Full</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePermissions}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}