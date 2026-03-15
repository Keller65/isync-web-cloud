"use client"

import { useState } from "react"
import { PencilSimple, Plus } from "@phosphor-icons/react"
import Avvvatars from "avvvatars-react"
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
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  MapPin,
  MapPinned,
} from "lucide-react"

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

const permissionConfig: { key: keyof UserPermissions; label: string; icon: React.ElementType }[] = [
  { key: "analiticas", label: "Analíticas", icon: LayoutDashboard },
  { key: "pedidos", label: "Pedidos", icon: ShoppingCart },
  { key: "cobros", label: "Cobros", icon: CreditCard },
  { key: "visitas", label: "Visitas", icon: MapPin },
  { key: "ubicaciones", label: "Ubicaciones", icon: MapPinned },
]

const accessLevelConfig: { value: AccessLevel; label: string }[] = [
  { value: "none", label: "Sin acceso" },
  { value: "read", label: "Ver" },
  { value: "write", label: "Editar" },
  { value: "full", label: "Completo" },
]

export default function Page() {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEditClick = (user: UserData) => {
    setSelectedUser(JSON.parse(JSON.stringify(user)))
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

  const getAccessConfig = (level: AccessLevel) => {
    return accessLevelConfig.find((c) => c.value === level) || accessLevelConfig[0]
  }

  const getPermissionCount = (permissions: UserPermissions) => {
    return Object.values(permissions).filter((p) => p !== "none").length
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona el acceso y permisos de tu equipo</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Nuevo usuario
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <Avvvatars value={user.email} style="shape" size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{user.name}</h3>
                <span className={`w-2 h-2 rounded-full ${user.active ? "bg-green-500" : "bg-muted-foreground"}`} />
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Permisos</p>
                <p className="font-medium">{getPermissionCount(user.permissions)} / 5</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Estado</p>
                <p className={`font-medium ${user.active ? "text-green-600" : "text-muted-foreground"}`}>
                  {user.active ? "Activo" : "Inactivo"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
              <PencilSimple size={20} />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle>Permisos de acceso</DialogTitle>
            <DialogDescription>
              Configura qué puede ver y hacer cada usuario en el sistema
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <Avvvatars value={selectedUser.email} style="shape" size={48} />
                  <div>
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${selectedUser.active ? "text-green-600" : "text-muted-foreground"}`}>
                    {selectedUser.active ? "Activo" : "Inactivo"}
                  </span>
                  <Switch
                    id="user-status"
                    checked={selectedUser.active}
                    onCheckedChange={handleToggleActive}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {permissionConfig.map(({ key, label, icon: Icon }) => {
                  const currentLevel = selectedUser.permissions[key]
                  const currentConfig = getAccessConfig(currentLevel)
                  
                  return (
                    <div
                      key={key}
                      className="group relative flex items-center justify-between p-4 border rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${currentLevel !== 'none' ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon size={20} className={currentLevel !== 'none' ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <span className="font-medium">{label}</span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        {accessLevelConfig.map((level) => {
                          const isSelected = currentLevel === level.value
                          return (
                            <button
                              key={level.value}
                              onClick={() => handlePermissionChange(key, level.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              {level.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{getPermissionCount(selectedUser.permissions)}</span> de {permissionConfig.length} módulos activos
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions} className="flex-1">
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
