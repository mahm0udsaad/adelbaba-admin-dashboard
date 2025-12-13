"use client"

import { useEffect, useState } from "react"
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
  const [roles, setRoles] = useState<Role[]>(initialRoles ?? [])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Form states
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
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

  // Reset form
  const resetForm = () => {
    setRoleName("")
    setSelectedPermissions([])
    setFormError(null)
    setSelectedRole(null)
  }

  // Open create dialog
  const handleCreate = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = async (role: Role) => {
    try {
      setLoading(true)
      resetForm()
      
      // Fetch full role details with permissions
      const res = await apiService.fetchRole(role.id)
      const fullRole = res.data?.data || res.data || role
      
      setSelectedRole(fullRole)
      setRoleName(fullRole.name)
      setSelectedPermissions(fullRole.permissions?.map((p) => p.id) || [])
      setEditDialogOpen(true)
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

  // Toggle permission selection
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  // Toggle all permissions in a resource group
  const toggleResourceGroup = (resource: string) => {
    const resourcePermissions = groupedPermissions[resource] || []
    const resourceIds = resourcePermissions.map((p) => p.id)
    const allSelected = resourceIds.every((id) => selectedPermissions.includes(id))
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !resourceIds.includes(id)))
    } else {
      setSelectedPermissions((prev) => {
        const newIds = resourceIds.filter((id) => !prev.includes(id))
        return [...prev, ...newIds]
      })
    }
  }

  // Create role
  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setFormError("اسم الدور مطلوب")
      return
    }
    
    if (selectedPermissions.length === 0) {
      setFormError("يجب اختيار صلاحية واحدة على الأقل")
      return
    }

    try {
      setSaving(true)
      setFormError(null)
      
      const res = await apiService.createRole({
        name: roleName.trim(),
        permissions: selectedPermissions,
      })
      
      const newRole = res.data?.data || res.data
      setRoles((prev) => [...prev, newRole])
      
      toast({
        title: "نجح",
        description: "تم إنشاء الدور بنجاح",
      })
      
      setCreateDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل إنشاء الدور"
      setFormError(errorMessage)
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Update role
  const handleUpdateRole = async () => {
    if (!selectedRole) return
    
    if (!roleName.trim()) {
      setFormError("اسم الدور مطلوب")
      return
    }
    
    if (selectedPermissions.length === 0) {
      setFormError("يجب اختيار صلاحية واحدة على الأقل")
      return
    }

    try {
      setSaving(true)
      setFormError(null)
      
      const res = await apiService.updateRole(selectedRole.id, {
        name: roleName.trim(),
        permissions: selectedPermissions,
      })
      
      const updatedRole = res.data?.data || res.data
      setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? updatedRole : r)))
      
      toast({
        title: "نجح",
        description: "تم تحديث الدور بنجاح",
      })
      
      setEditDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحديث الدور"
      setFormError(errorMessage)
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
      resetForm()
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

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>إضافة دور جديد</DialogTitle>
            <DialogDescription>
              قم بإدخال اسم الدور واختر الصلاحيات المناسبة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role-name">اسم الدور</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="مثال: مدير المبيعات"
              />
            </div>

            <div className="space-y-2">
              <Label>الصلاحيات</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {permissions.length > 0 ? (
                  <div className="space-y-4">
                    {Object.keys(groupedPermissions).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">لا توجد صلاحيات متاحة</p>
                        <p className="text-sm text-gray-400">
                          يجب إضافة الصلاحيات في قاعدة البيانات أولاً
                        </p>
                      </div>
                    ) : (
                      Object.entries(groupedPermissions).map(([resource, perms]) => {
                        const resourceIds = perms.map((p) => p.id)
                        const allSelected = resourceIds.every((id) => selectedPermissions.includes(id))
                        const someSelected = resourceIds.some((id) => selectedPermissions.includes(id))

                        return (
                          <div key={resource} className="space-y-2">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox
                                id={`resource-${resource}`}
                                checked={allSelected}
                                onCheckedChange={() => toggleResourceGroup(resource)}
                                className={someSelected && !allSelected ? "opacity-50" : ""}
                              />
                              <Label
                                htmlFor={`resource-${resource}`}
                                className="font-semibold cursor-pointer"
                              >
                                {resource}
                              </Label>
                            </div>
                            <div className="mr-6 rtl:ml-6 rtl:mr-0 space-y-2">
                              {perms.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2 rtl:space-x-reverse"
                                >
                                  <Checkbox
                                    id={`perm-${permission.id}`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <Label
                                    htmlFor={`perm-${permission.id}`}
                                    className="text-sm cursor-pointer font-normal"
                                  >
                                    {permission.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">لا توجد صلاحيات متاحة في النظام</p>
                    <p className="text-sm text-gray-400 mb-4">
                      يرجى التأكد من وجود صلاحيات في قاعدة البيانات
                    </p>
                    <Alert className="text-right">
                      <AlertTitle>ملاحظة</AlertTitle>
                      <AlertDescription>
                        يجب إضافة الصلاحيات (Permissions) في قاعدة البيانات من خلال الـ Backend.
                        <br />
                        مثال: company.view, company.create, company.update, company.delete
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </ScrollArea>
              <p className="text-sm text-gray-500">
                تم اختيار {selectedPermissions.length} من {permissions.length} صلاحية
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button onClick={handleCreateRole} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تعديل الدور</DialogTitle>
            <DialogDescription>
              قم بتعديل اسم الدور والصلاحيات
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-role-name">اسم الدور</Label>
              <Input
                id="edit-role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="مثال: مدير المبيعات"
              />
            </div>

            <div className="space-y-2">
              <Label>الصلاحيات</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {permissions.length > 0 ? (
                  <div className="space-y-4">
                    {Object.keys(groupedPermissions).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">لا توجد صلاحيات متاحة</p>
                        <p className="text-sm text-gray-400">
                          يجب إضافة الصلاحيات في قاعدة البيانات أولاً
                        </p>
                      </div>
                    ) : (
                      Object.entries(groupedPermissions).map(([resource, perms]) => {
                    const resourceIds = perms.map((p) => p.id)
                    const allSelected = resourceIds.every((id) => selectedPermissions.includes(id))
                    const someSelected = resourceIds.some((id) => selectedPermissions.includes(id))

                    return (
                      <div key={resource} className="space-y-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox
                            id={`edit-resource-${resource}`}
                            checked={allSelected}
                            onCheckedChange={() => toggleResourceGroup(resource)}
                            className={someSelected && !allSelected ? "opacity-50" : ""}
                          />
                          <Label
                            htmlFor={`edit-resource-${resource}`}
                            className="font-semibold cursor-pointer"
                          >
                            {resource}
                          </Label>
                        </div>
                        <div className="mr-6 rtl:ml-6 rtl:mr-0 space-y-2">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2 rtl:space-x-reverse"
                            >
                              <Checkbox
                                id={`edit-perm-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <Label
                                htmlFor={`edit-perm-${permission.id}`}
                                className="text-sm cursor-pointer font-normal"
                              >
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">لا توجد صلاحيات متاحة في النظام</p>
                    <p className="text-sm text-gray-400 mb-4">
                      يرجى التأكد من وجود صلاحيات في قاعدة البيانات
                    </p>
                    <div className="max-w-md mx-auto">
                      <Alert className="text-right">
                        <AlertTitle>ملاحظة</AlertTitle>
                        <AlertDescription>
                          يجب إضافة الصلاحيات (Permissions) في قاعدة البيانات من خلال الـ Backend.
                          <br />
                          مثال: company.view, company.create, company.update, company.delete
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <p className="text-sm text-gray-500">
                تم اختيار {selectedPermissions.length} من {permissions.length} صلاحية
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                resetForm()
              }}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button onClick={handleUpdateRole} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Role Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تفاصيل الدور: {selectedRole?.name}</DialogTitle>
            <DialogDescription>عرض جميع الصلاحيات المخصصة لهذا الدور</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">الصلاحيات ({selectedRole?.permissions?.length ?? 0})</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4 mt-2">
                {selectedRole?.permissions && selectedRole.permissions.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => {
                      const rolePerms = selectedRole.permissions || []
                      const resourcePerms = perms.filter((p) =>
                        rolePerms.some((rp) => rp.id === p.id)
                      )

                      if (resourcePerms.length === 0) return null

                      return (
                        <div key={resource} className="space-y-2">
                          <div className="font-semibold text-base">{resource}</div>
                          <div className="mr-6 rtl:ml-6 rtl:mr-0 space-y-2">
                            {resourcePerms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-2 rtl:space-x-reverse"
                              >
                                <Checkbox checked={true} disabled />
                                <Label className="text-sm font-normal">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
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
