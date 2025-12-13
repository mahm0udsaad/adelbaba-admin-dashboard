"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, MoreHorizontal, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type Section = {
  id: number
  title: string
  type: "new" | "best_selling" | "popular" | "category"
  category_id?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

type Category = {
  id: number
  name: string
}

const SECTION_TYPES = [
  { value: "new", label: "جديد" },
  { value: "best_selling", label: "الأكثر مبيعاً" },
  { value: "popular", label: "شائع" },
  { value: "category", label: "فئة" },
]

export function SectionsPage({ initialSections }: { initialSections?: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initialSections ?? [])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form states
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    type: "new" | "best_selling" | "popular" | "category"
    category_id?: number
    is_active: boolean
  }>({
    title: "",
    type: "new",
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { toast } = useToast()

  // Load sections and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [sectionsRes, categoriesRes] = await Promise.all([
          apiService.fetchSections(),
          apiService.fetchCategories(),
        ])

        setSections(sectionsRes.data?.data || sectionsRes.data || [])
        setCategories(categoriesRes.data?.data || categoriesRes.data || [])
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

    if (initialSections === undefined) {
      loadData()
    } else {
      // Still load categories even if sections are provided
      apiService
        .fetchCategories()
        .then((res) => {
          setCategories(res.data?.data || res.data || [])
        })
        .catch(() => {})
    }
  }, [initialSections, toast])

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      type: "new",
      is_active: true,
    })
    setFormError(null)
    setSelectedSection(null)
  }

  // Open create dialog
  const handleCreate = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = async (section: Section) => {
    try {
      setLoading(true)
      resetForm()

      // Fetch full section details
      const res = await apiService.fetchSection(section.id)
      const fullSection = res.data?.data || res.data || section

      setSelectedSection(fullSection)
      setFormData({
        title: fullSection.title,
        type: fullSection.type,
        category_id: fullSection.category_id,
        is_active: fullSection.is_active,
      })
      setEditDialogOpen(true)
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || err.message || "فشل تحميل بيانات القسم",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Open delete dialog
  const handleDelete = (section: Section) => {
    setSelectedSection(section)
    setDeleteDialogOpen(true)
  }

  // Create section
  const handleCreateSection = async () => {
    if (!formData.title.trim()) {
      setFormError("عنوان القسم مطلوب")
      return
    }

    if (formData.type === "category" && !formData.category_id) {
      setFormError("يجب اختيار فئة عند اختيار نوع القسم كفئة")
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const res = await apiService.createSection({
        title: formData.title.trim(),
        type: formData.type,
        ...(formData.category_id && { category_id: formData.category_id }),
        is_active: formData.is_active,
      })

      const newSection = res.data?.data || res.data
      setSections((prev) => [newSection, ...prev])

      toast({
        title: "نجح",
        description: "تم إنشاء القسم بنجاح",
      })

      setCreateDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل إنشاء القسم"
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

  // Update section
  const handleUpdateSection = async () => {
    if (!selectedSection) return

    if (!formData.title.trim()) {
      setFormError("عنوان القسم مطلوب")
      return
    }

    if (formData.type === "category" && !formData.category_id) {
      setFormError("يجب اختيار فئة عند اختيار نوع القسم كفئة")
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const res = await apiService.updateSection(selectedSection.id, {
        title: formData.title.trim(),
        type: formData.type,
        ...(formData.category_id && { category_id: formData.category_id }),
        is_active: formData.is_active,
      })

      const updatedSection = res.data?.data || res.data
      setSections((prev) => prev.map((s) => (s.id === selectedSection.id ? updatedSection : s)))

      toast({
        title: "نجح",
        description: "تم تحديث القسم بنجاح",
      })

      setEditDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحديث القسم"
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

  // Delete section
  const handleDeleteSection = async () => {
    if (!selectedSection) return

    try {
      setSaving(true)
      await apiService.deleteSection(selectedSection.id)

      setSections((prev) => prev.filter((s) => s.id !== selectedSection.id))

      toast({
        title: "نجح",
        description: "تم حذف القسم بنجاح",
      })

      setDeleteDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل حذف القسم"
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getSectionTypeLabel = (type: string) => {
    return SECTION_TYPES.find((t) => t.value === type)?.label || type
  }

  const filteredSections = sections.filter((s) =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث عن قسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
          إضافة قسم جديد
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle>أقسام الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && sections.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أقسام"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left rtl:text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSectionTypeLabel(section.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={section.is_active ? "default" : "secondary"}
                          className={section.is_active ? "bg-green-100 text-green-800" : ""}
                        >
                          {section.is_active ? "نشط" : "غير نشط"}
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
                            <DropdownMenuItem onClick={() => handleEdit(section)}>
                              <Edit className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(section)}
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

      {/* Create Section Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة قسم جديد</DialogTitle>
            <DialogDescription>قم بإدخال تفاصيل القسم الجديد</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">عنوان القسم</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: منتجات جديدة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع القسم</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value, category_id: undefined })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="اختر نوع القسم" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "category" && (
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={formData.category_id?.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: parseInt(value) })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                نشط
              </Label>
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
            <Button onClick={handleCreateSection} disabled={saving}>
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

      {/* Edit Section Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل القسم</DialogTitle>
            <DialogDescription>قم بتعديل تفاصيل القسم</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">عنوان القسم</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: منتجات جديدة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">نوع القسم</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value, category_id: undefined })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="اختر نوع القسم" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "category" && (
              <div className="space-y-2">
                <Label htmlFor="edit-category">الفئة</Label>
                <Select
                  value={formData.category_id?.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active" className="cursor-pointer">
                نشط
              </Label>
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
            <Button onClick={handleUpdateSection} disabled={saving}>
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
              هل أنت متأكد من حذف القسم "{selectedSection?.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
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

