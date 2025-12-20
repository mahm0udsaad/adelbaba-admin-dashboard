"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, MoreHorizontal, Edit, Trash2, Loader2, Plus, UserPlus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type Role = {
  id: number
  name: string
}

type MemberRole = {
  id: number
  name: string
  isActive?: number
}

type Employee = {
  id: number
  name: string
  email: string
  phone?: string
  roles?: MemberRole[]
  type: "admin" | "employee"
  is_active?: boolean
}

type FormData = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  type: "admin" | "employee"
  is_active: boolean
  roles: number[]
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  type: "employee",
  is_active: true,
  roles: [],
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"admin" | "employee" | "all">("employee")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { toast } = useToast()

  // Load employees and roles
  useEffect(() => {
    loadData()
  }, [typeFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [employeesRes, rolesRes] = await Promise.all([
        apiService.fetchManagement(typeFilter === "all" ? "employee" : typeFilter),
        apiService.fetchRoles(),
      ])

      setEmployees(employeesRes.data?.data || employeesRes.data || [])
      setRoles(rolesRes.data?.data || rolesRes.data || [])
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحميل البيانات"
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

  const filtered = employees.filter((e) => {
    const q = searchTerm.toLowerCase()
    const rolesText = Array.isArray(e.roles)
      ? e.roles.map((r: any) => r?.name || r).join(",")
      : ""
    return (
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.phone?.toLowerCase().includes(q) ||
      rolesText.toLowerCase().includes(q)
    )
  })

  // Open create dialog
  const handleCreate = () => {
    setFormData(initialFormData)
    setFormError(null)
    setCreateDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = async (employee: Employee) => {
    try {
      setLoading(true)
      setFormError(null)

      // Fetch full employee details
      const res = await apiService.fetchManagementUser(employee.id)
      const fullEmployee = res.data?.data || res.data || employee

      setSelectedEmployee(fullEmployee)
      setFormData({
        name: fullEmployee.name || "",
        email: fullEmployee.email || "",
        phone: fullEmployee.phone || "",
        password: "",
        password_confirmation: "",
        type: fullEmployee.type || "employee",
        is_active: fullEmployee.is_active !== undefined ? fullEmployee.is_active : true,
        roles: fullEmployee.roles?.map((r: any) => r.id || r) || [],
      })
      setEditDialogOpen(true)
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || err.message || "فشل تحميل بيانات الموظف",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission for create
  const handleCreateSubmit = async () => {
    try {
      setSaving(true)
      setFormError(null)

      // Validation
      if (!formData.name.trim()) {
        setFormError("الاسم مطلوب")
        return
      }
      if (!formData.email.trim()) {
        setFormError("البريد الإلكتروني مطلوب")
        return
      }
      if (!formData.password) {
        setFormError("كلمة المرور مطلوبة")
        return
      }
      if (formData.password !== formData.password_confirmation) {
        setFormError("كلمة المرور وتأكيدها غير متطابقتين")
        return
      }
      if (formData.roles.length === 0) {
        setFormError("يجب اختيار دور واحد على الأقل")
        return
      }

      const res = await apiService.createManagementUser(formData)
      const newEmployee = res.data?.data || res.data

      // Refresh the list
      await loadData()

      toast({
        title: "نجح",
        description: "تم إنشاء الموظف بنجاح",
      })

      setCreateDialogOpen(false)
      setFormData(initialFormData)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل إنشاء الموظف"
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

  // Handle form submission for edit
  const handleEditSubmit = async () => {
    if (!selectedEmployee) return

    try {
      setSaving(true)
      setFormError(null)

      // Validation
      if (!formData.name.trim()) {
        setFormError("الاسم مطلوب")
        return
      }
      if (!formData.email.trim()) {
        setFormError("البريد الإلكتروني مطلوب")
        return
      }
      if (formData.password && formData.password !== formData.password_confirmation) {
        setFormError("كلمة المرور وتأكيدها غير متطابقتين")
        return
      }
      if (formData.roles.length === 0) {
        setFormError("يجب اختيار دور واحد على الأقل")
        return
      }

      // Prepare update data - only include password if it was provided
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: formData.type,
        is_active: formData.is_active,
        roles: formData.roles,
      }

      if (formData.password) {
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }

      const res = await apiService.updateManagementUser(selectedEmployee.id, updateData)
      const updatedEmployee = res.data?.data || res.data

      // Refresh the list
      await loadData()

      toast({
        title: "نجح",
        description: "تم تحديث الموظف بنجاح",
      })

      setEditDialogOpen(false)
      setSelectedEmployee(null)
      setFormData(initialFormData)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحديث الموظف"
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

  // Delete employee
  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return

    try {
      setSaving(true)
      await apiService.deleteManagementUser(selectedEmployee.id)

      // Refresh the list
      await loadData()

      toast({
        title: "نجح",
        description: "تم حذف الموظف بنجاح",
      })

      setDeleteDialogOpen(false)
      setSelectedEmployee(null)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل حذف الموظف"
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Toggle role selection
  const toggleRole = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId)
        : [...prev.roles, roleId],
    }))
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
          <UserPlus className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
          إضافة موظف جديد
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث بالاسم أو البريد أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Select onValueChange={(v) => setTypeFilter(v as any)} defaultValue="employee">
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">المديرون</SelectItem>
            <SelectItem value="employee">الموظفون</SelectItem>
            <SelectItem value="all">الكل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {loading && employees.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead className="hidden md:table-cell">البريد</TableHead>
                  <TableHead className="hidden lg:table-cell">الهاتف</TableHead>
                  <TableHead className="hidden lg:table-cell">الأدوار</TableHead>
                  <TableHead className="hidden sm:table-cell">النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left rtl:text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد موظفين"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{e.name}</span>
                          <span className="md:hidden text-xs text-gray-500">{e.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{e.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{e.phone || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {(Array.isArray(e.roles) ? e.roles : []).map((r: any, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800">
                              {r?.name || r}
                            </Badge>
                          ))}
                          {(!e.roles || e.roles.length === 0) && (
                            <span className="text-gray-500 text-sm">لا توجد أدوار</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{e.type === "admin" ? "مدير" : "موظف"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={e.is_active ? "default" : "secondary"}
                          className={e.is_active ? "bg-green-100 text-green-800" : ""}
                        >
                          {e.is_active ? "نشط" : "غير نشط"}
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
                            <DropdownMenuItem onClick={() => handleEdit(e)}>
                              <Edit className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(e)} className="text-red-600">
                              <Trash2 className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>أدخل معلومات الموظف الجديد</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الموظف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">النوع *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">تأكيد كلمة المرور *</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, password_confirmation: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">حساب نشط</Label>
            </div>

            <div className="space-y-2">
              <Label>الأدوار *</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {roles.length > 0 ? (
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={`role-create-${role.id}`}
                          checked={formData.roles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label
                          htmlFor={`role-create-${role.id}`}
                          className="text-sm cursor-pointer font-normal flex-1"
                        >
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">لا توجد أدوار متاحة</div>
                )}
              </ScrollArea>
              <p className="text-sm text-gray-500">
                تم اختيار {formData.roles.length} من {roles.length} دور
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setFormData(initialFormData)
                setFormError(null)
              }}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "إنشاء الموظف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            <DialogDescription>
              {selectedEmployee && <>تعديل معلومات: <strong>{selectedEmployee.name}</strong></>}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الموظف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">رقم الهاتف</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">النوع *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">كلمة المرور الجديدة (اختياري)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="اتركه فارغًا للاحتفاظ بالقديم"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password_confirmation">تأكيد كلمة المرور</Label>
                <Input
                  id="edit-password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, password_confirmation: e.target.value })
                  }
                  placeholder="اتركه فارغًا للاحتفاظ بالقديم"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">حساب نشط</Label>
            </div>

            <div className="space-y-2">
              <Label>الأدوار *</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {roles.length > 0 ? (
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={`role-edit-${role.id}`}
                          checked={formData.roles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label
                          htmlFor={`role-edit-${role.id}`}
                          className="text-sm cursor-pointer font-normal flex-1"
                        >
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">لا توجد أدوار متاحة</div>
                )}
              </ScrollArea>
              <p className="text-sm text-gray-500">
                تم اختيار {formData.roles.length} من {roles.length} دور
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setSelectedEmployee(null)
                setFormData(initialFormData)
                setFormError(null)
              }}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الموظف "{selectedEmployee?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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

