"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MoreHorizontal, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type Permission = {
  id: number
  name: string
}

type Role = {
  id: number
  name: string
  permissions_count?: number
  permissions?: Permission[]
}

type GroupedPermissions = {
  [resource: string]: Permission[]
}

export function RolesPage({ initialRoles }: { initialRoles?: Role[] }) {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>(initialRoles ?? [])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Dialog states (only for view and delete)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Form states (only for view and delete)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  
  const { toast } = useToast()

  // Load roles and permissions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [rolesRes, permissionsRes] = await Promise.all([
          apiService.fetchRoles(),
          apiService.fetchPermissions(),
        ])
        
        console.log("[Roles] API Response:", rolesRes)
        console.log("[Permissions] API Response:", permissionsRes)
        
        const rolesData = rolesRes.data?.data || rolesRes.data || []
        const permissionsData = permissionsRes.data?.data || permissionsRes.data || []
        
        console.log("[Roles] Extracted data:", rolesData)
        console.log("[Permissions] Extracted data:", permissionsData)
        
        setRoles(rolesData)
        setPermissions(permissionsData)
        
        if (permissionsData.length === 0) {
          toast({
            title: "تنبيه",
            description: "لا توجد صلاحيات في النظام. يجب إضافة الصلاحيات من قاعدة البيانات أولاً.",
            variant: "destructive",
          })
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "فشل تحميل البيانات"
        console.error("[Roles] Error loading data:", err)
        setError(errorMessage)
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (initialRoles === undefined) {
      loadData()
    } else {
      // Still load permissions even if roles are provided
      apiService.fetchPermissions().then((res) => {
        console.log("[Permissions] API Response (fallback):", res)
        const permissionsData = res.data?.data || res.data || []
        console.log("[Permissions] Extracted data (fallback):", permissionsData)
        setPermissions(permissionsData)
        
        if (permissionsData.length === 0) {
          toast({
            title: "تنبيه",
            description: "لا توجد صلاحيات في النظام. يجب إضافة الصلاحيات من قاعدة البيانات أولاً.",
            variant: "destructive",
          })
        }
      }).catch((err) => {
        console.error("[Permissions] Error loading permissions:", err)
      })
    }
  }, [initialRoles, toast])

  // Group permissions by resource (e.g., "company.view" -> "company")
  const groupedPermissions: GroupedPermissions = permissions.reduce((acc, permission) => {
    const parts = permission.name.split(".")
    const resource = parts.length > 1 ? parts[0] : "أخرى"
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {} as GroupedPermissions)

  // Navigate to create page
  const handleCreate = () => {
    router.push("/roles/create")
  }

  // Navigate to edit page
  const handleEdit = (role: Role) => {
    router.push(`/roles/${role.id}/edit`)
  }

  // Open view dialog
  const handleView = async (role: Role) => {
    try {
      setLoading(true)
      const res = await apiService.fetchRole(role.id)
      const fullRole = res.data?.data || res.data || role
      setSelectedRole(fullRole)
      setViewDialogOpen(true)
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || err.message || "فشل تحميل بيانات الدور",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Open delete dialog
  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  // Delete role
  const handleDeleteRole = async () => {
    if (!selectedRole) return

    try {
      setSaving(true)
      await apiService.deleteRole(selectedRole.id)
      
      setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id))
      
      toast({
        title: "نجح",
        description: "تم حذف الدور بنجاح",
      })
      
      setDeleteDialogOpen(false)
      setSelectedRole(null)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل حذف الدور"
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredRoles = roles.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث عن دور..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
          إضافة دور جديد
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>الأدوار والصلاحيات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && roles.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أدوار"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>عدد الصلاحيات</TableHead>
                    <TableHead className="text-left rtl:text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          {role.permissions_count ?? role.permissions?.length ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(role)}>
                              <Eye className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              عرض الصلاحيات
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(role)}>
                              <Edit className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(role)}
                              className="text-red-600"
                            >
                              <Trash2 className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Role Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تفاصيل الدور: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              عرض جميع الصلاحيات المخصصة لهذا الدور ({selectedRole?.permissions?.length ?? 0} صلاحية)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <ScrollArea className="h-[600px] rounded-md border p-6">
                {selectedRole?.permissions && selectedRole.permissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => {
                      const rolePerms = selectedRole.permissions || []
                      const resourcePerms = perms.filter((p) =>
                        rolePerms.some((rp) => rp.id === p.id)
                      )

                      if (resourcePerms.length === 0) return null

                      return (
                        <Card key={resource} className="space-y-4 shadow-sm">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border-b bg-gray-50">
                            <Checkbox checked={true} disabled className="h-5 w-5" />
                            <Label className="font-semibold flex-1 text-base">
                              {resource}
                            </Label>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              {resourcePerms.length}
                            </Badge>
                          </div>
                          <div className="space-y-3 p-4">
                            {resourcePerms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-3 rtl:space-x-reverse py-1"
                              >
                                <Checkbox checked={true} disabled className="h-5 w-5" />
                                <Label className="text-sm font-normal flex-1 leading-relaxed">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد صلاحيات مخصصة لهذا الدور
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الدور "{selectedRole?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <Loader2 className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
