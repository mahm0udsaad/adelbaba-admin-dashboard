"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type Permission = {
  id: number
  name: string
}

type GroupedPermissions = {
  [resource: string]: Permission[]
}

export function RoleCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await apiService.fetchPermissions()
        const permissionsData = res.data?.data || res.data || []
        
        setPermissions(permissionsData)
        
        if (permissionsData.length === 0) {
          toast({
            title: "تنبيه",
            description: "لا توجد صلاحيات في النظام. يجب إضافة الصلاحيات من قاعدة البيانات أولاً.",
            variant: "destructive",
          })
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "فشل تحميل الصلاحيات"
        console.error("[RoleCreate] Error loading permissions:", err)
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
    
    loadPermissions()
  }, [toast])

  // Group permissions by resource
  const groupedPermissions: GroupedPermissions = permissions.reduce((acc, permission) => {
    const parts = permission.name.split(".")
    const resource = parts.length > 1 ? parts[0] : "أخرى"
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {} as GroupedPermissions)

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
      
      await apiService.createRole({
        name: roleName.trim(),
        permissions: selectedPermissions,
      })
      
      toast({
        title: "نجح",
        description: "تم إنشاء الدور بنجاح",
      })
      
      router.push("/roles")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إضافة دور جديد</h1>
          <p className="text-gray-500 mt-1">قم بإدخال اسم الدور واختر الصلاحيات المناسبة</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/roles")}
          disabled={saving}
        >
          <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4 rotate-180 rtl:rotate-0" />
          العودة
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Role Name - Full Width */}
        <Card className="md:col-span-2 lg:col-span-5">
          <CardHeader>
            <CardTitle>معلومات الدور</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions - Grouped in 5 columns */}
        <Card className="md:col-span-2 lg:col-span-5">
          <CardHeader>
            <CardTitle>الصلاحيات</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              تم اختيار {selectedPermissions.length} من {permissions.length} صلاحية
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] rounded-md border p-6">
              {permissions.length > 0 ? (
                <div className="grid gap-8">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => {
                    const resourceIds = perms.map((p) => p.id)
                    const allSelected = resourceIds.every((id) => selectedPermissions.includes(id))
                    const someSelected = resourceIds.some((id) => selectedPermissions.includes(id))

                    return (
                      <div key={resource} className="space-y-4 shadow-sm w-full">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border-b bg-gray-50">
                          <Checkbox
                            id={`resource-${resource}`}
                            checked={allSelected}
                            onCheckedChange={() => toggleResourceGroup(resource)}
                            className={someSelected && !allSelected ? "opacity-50" : ""}
                          />
                          <Label
                            htmlFor={`resource-${resource}`}
                            className="font-semibold cursor-pointer flex-1 text-base"
                          >
                            {resource}
                          </Label>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            {perms.length}
                          </Badge>
                        </div>
                        <div className="space-y-3 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-center">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center gap-3 rtl:space-x-reverse py-1"
                            >
                              <Checkbox
                                id={`perm-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                className="h-5 w-5"
                              />
                              <Label
                                htmlFor={`perm-${permission.id}`}
                                className="text-sm cursor-pointer font-normal flex-1 leading-relaxed"
                              >
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
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/roles")}
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
      </div>
    </div>
  )
}

