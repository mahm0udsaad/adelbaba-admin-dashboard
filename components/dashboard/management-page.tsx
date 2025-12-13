"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
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

type Member = {
  id: number
  name: string
  email: string
  phone?: string
  roles?: MemberRole[]
  type: "admin" | "employee"
  is_active?: boolean
}

export function ManagementPage({
  initialMembers,
  initialType = "admin",
}: {
  initialMembers?: Member[]
  initialType?: "admin" | "employee"
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers ?? [])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [type, setType] = useState<"admin" | "employee" | "all">((initialType as any) ?? "admin")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [editRolesDialogOpen, setEditRolesDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { toast } = useToast()

  // Load members and roles
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [membersRes, rolesRes] = await Promise.all([
          apiService.fetchManagement(type === "all" ? "admin" : (type as any)),
          apiService.fetchRoles(),
        ])

        setMembers(membersRes.data?.data || membersRes.data || [])
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

    if (initialMembers === undefined) {
      loadData()
    } else {
      // Still load roles even if members are provided
      apiService
        .fetchRoles()
        .then((res) => {
          setRoles(res.data?.data || res.data || [])
        })
        .catch(() => {})
    }
  }, [initialMembers, type, toast])

  // Reload members when type changes
  useEffect(() => {
    if (initialMembers === undefined && type !== "all") {
      const load = async () => {
        try {
          setLoading(true)
          const res = await apiService.fetchManagement(type as any)
          setMembers(res.data?.data || res.data || [])
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "فشل تحميل البيانات")
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [type, initialMembers])

  const filtered = members.filter((m) => {
    const q = searchTerm.toLowerCase()
    const rolesText = Array.isArray(m.roles)
      ? (m.roles as any[]).map((r: any) => r?.name || r).join(",")
      : ""
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      rolesText.toLowerCase().includes(q)
    )
  })

  // Open edit roles dialog
  const handleEditRoles = async (member: Member) => {
    try {
      setLoading(true)
      setFormError(null)

      // Fetch full member details with roles
      const res = await apiService.fetchManagementUser(member.id)
      const fullMember = res.data?.data || res.data || member

      setSelectedMember(fullMember)
      // Extract role IDs from the member's roles
      const roleIds = fullMember.roles?.map((r: any) => r.id || r) || []
      setSelectedRoleIds(roleIds)
      setEditRolesDialogOpen(true)
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || err.message || "فشل تحميل بيانات المستخدم",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle role selection
  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  // Update user roles
  const handleUpdateRoles = async () => {
    if (!selectedMember) return

    try {
      setSaving(true)
      setFormError(null)

      // Get current member data
      const memberRes = await apiService.fetchManagementUser(selectedMember.id)
      const currentMember = memberRes.data?.data || memberRes.data || selectedMember

      // Prepare update data - keep existing fields and update roles
      const updateData: any = {
        name: currentMember.name,
        email: currentMember.email,
        phone: currentMember.phone || "",
        type: currentMember.type || "admin",
        is_active: currentMember.is_active !== undefined ? currentMember.is_active : true,
        roles: selectedRoleIds,
      }

      const res = await apiService.updateManagementUser(selectedMember.id, updateData)
      const updatedMember = res.data?.data || res.data

      // Update the member in the list
      setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? updatedMember : m)))

      toast({
        title: "نجح",
        description: "تم تحديث أدوار المستخدم بنجاح",
      })

      setEditRolesDialogOpen(false)
      setSelectedMember(null)
      setSelectedRoleIds([])
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحديث الأدوار"
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

  // Delete user
  const handleDelete = (member: Member) => {
    setSelectedMember(member)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return

    try {
      setSaving(true)
      await apiService.deleteManagementUser(selectedMember.id)

      setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id))

      toast({
        title: "نجح",
        description: "تم حذف المستخدم بنجاح",
      })

      setDeleteDialogOpen(false)
      setSelectedMember(null)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل حذف المستخدم"
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
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
        <Select onValueChange={(v) => setType(v as any)} defaultValue={initialType}>
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
        {loading && members.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الأدوار</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left rtl:text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مستخدمين"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(Array.isArray(m.roles) ? m.roles : []).map((r: any, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800">
                            {r?.name || r}
                          </Badge>
                        ))}
                        {(!m.roles || m.roles.length === 0) && (
                          <span className="text-gray-500 text-sm">لا توجد أدوار</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{m.type === "admin" ? "مدير" : "موظف"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={m.is_active ? "default" : "secondary"}
                        className={m.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {m.is_active ? "نشط" : "غير نشط"}
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
                          <DropdownMenuItem onClick={() => handleEditRoles(m)}>
                            <Edit className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                            تعديل الأدوار
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(m)}
                            className="text-red-600"
                          >
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
        )}
      </Card>

      {/* Edit Roles Dialog */}
      <Dialog open={editRolesDialogOpen} onOpenChange={setEditRolesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تعديل أدوار المستخدم</DialogTitle>
            <DialogDescription>
              {selectedMember && (
                <>
                  تعديل الأدوار للمستخدم: <strong>{selectedMember.name}</strong>
                </>
              )}
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
              <Label>الأدوار المتاحة</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {roles.length > 0 ? (
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoleIds.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="text-sm cursor-pointer font-normal flex-1"
                        >
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد أدوار متاحة
                  </div>
                )}
              </ScrollArea>
              <p className="text-sm text-gray-500">
                تم اختيار {selectedRoleIds.length} من {roles.length} دور
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditRolesDialogOpen(false)
                setSelectedMember(null)
                setSelectedRoleIds([])
                setFormError(null)
              }}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button onClick={handleUpdateRoles} disabled={saving}>
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
              هل أنت متأكد من حذف المستخدم "{selectedMember?.name}"؟ لا يمكن التراجع عن هذا
              الإجراء.
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
