"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, MoreHorizontal, Plus, Edit, Trash2, Loader2, Image as ImageIcon, FolderTree, ArrowRight, Home } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
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

type Category = {
  id: number
  name: string
  icon?: string
  image?: string
  parent?: {
    id: number
    name: string
  } | null
  featured: boolean
  created_at?: string
  updated_at?: string
}

export function CategoriesManagementPage({ initialCategories }: { initialCategories?: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentParent, setCurrentParent] = useState<Category | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "parents" | "children">("all")

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    icon: string
    parent_id?: number
    featured: boolean
    image?: File | null
  }>({
    name: "",
    icon: "",
    featured: false,
    image: null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { toast } = useToast()

  // Load categories
  const loadCategories = async (parentId?: number | null) => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {}
      
      if (viewMode === "parents") {
        // For parent view, we want categories without parents
        // The API returns parent field as null for top-level categories
      } else if (viewMode === "children" && parentId) {
        params.parent_id = parentId
      }

      const res = await apiService.fetchCategories(params)
      setCategories(res.data?.data || res.data || [])
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحميل الفئات"
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

  useEffect(() => {
    if (initialCategories === undefined || viewMode !== "all" || currentParent !== null) {
      loadCategories(currentParent?.id)
    }
  }, [viewMode, currentParent])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      featured: false,
      image: null,
    })
    setImagePreview(null)
    setFormError(null)
    setSelectedCategory(null)
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open create dialog
  const handleCreate = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = async (category: Category) => {
    try {
      setLoading(true)
      resetForm()

      // Fetch full category details
      const res = await apiService.fetchCategory(category.id)
      const fullCategory = res.data?.data || res.data || category

      setSelectedCategory(fullCategory)
      setFormData({
        name: fullCategory.name,
        icon: fullCategory.icon || "",
        parent_id: fullCategory.parent?.id,
        featured: fullCategory.featured,
        image: null,
      })
      setImagePreview(fullCategory.image || null)
      setEditDialogOpen(true)
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || err.message || "فشل تحميل بيانات الفئة",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Open delete dialog
  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  // View children of a category
  const handleViewChildren = (category: Category) => {
    setCurrentParent(category)
    setViewMode("children")
  }

  // Go back to all categories
  const handleBackToAll = () => {
    setCurrentParent(null)
    setViewMode("all")
  }

  // View only parent categories
  const handleViewParents = () => {
    setCurrentParent(null)
    setViewMode("parents")
  }

  // Create category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      setFormError("اسم الفئة مطلوب")
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())
      formDataToSend.append("icon", formData.icon || "")
      formDataToSend.append("featured", formData.featured ? "1" : "0")
      if (formData.parent_id) {
        formDataToSend.append("parent_id", formData.parent_id.toString())
      }
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      const res = await apiService.createCategory(formDataToSend)
      const newCategory = res.data?.data || res.data

      setCategories((prev) => [newCategory, ...prev])

      toast({
        title: "نجح",
        description: "تم إنشاء الفئة بنجاح",
      })

      setCreateDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل إنشاء الفئة"
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

  // Update category
  const handleUpdateCategory = async () => {
    if (!selectedCategory) return

    if (!formData.name.trim()) {
      setFormError("اسم الفئة مطلوب")
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())
      formDataToSend.append("icon", formData.icon || "")
      formDataToSend.append("featured", formData.featured ? "1" : "0")
      if (formData.parent_id) {
        formDataToSend.append("parent_id", formData.parent_id.toString())
      }
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      const res = await apiService.updateCategory(selectedCategory.id, formDataToSend)
      const updatedCategory = res.data?.data || res.data

      setCategories((prev) => prev.map((c) => (c.id === selectedCategory.id ? updatedCategory : c)))

      toast({
        title: "نجح",
        description: "تم تحديث الفئة بنجاح",
      })

      setEditDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل تحديث الفئة"
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

  // Delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      setSaving(true)
      await apiService.deleteCategory(selectedCategory.id)

      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id))

      toast({
        title: "نجح",
        description: "تم حذف الفئة بنجاح",
      })

      setDeleteDialogOpen(false)
      resetForm()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "فشل حذف الفئة"
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const parentCategories = categories.filter((c) => !c.parent)

  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (viewMode === "parents") {
      return matchesSearch && !c.parent
    }
    
    return matchesSearch
  })
  
  // Count children for each category
  const getChildrenCount = (categoryId: number) => {
    return categories.filter((c) => c.parent?.id === categoryId).length
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      {(viewMode === "children" && currentParent) && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleBackToAll} className="cursor-pointer flex items-center gap-1">
                <Home className="h-3 w-3" />
                كل الفئات
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{currentParent.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث عن فئة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rtl:pl-3 rtl:pr-10"
            />
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
            إضافة فئة جديدة
          </Button>
        </div>
        
        {/* View Mode Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={handleBackToAll}
          >
            <Home className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
            كل الفئات
          </Button>
          <Button
            variant={viewMode === "parents" ? "default" : "outline"}
            size="sm"
            onClick={handleViewParents}
          >
            <FolderTree className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
            الفئات الرئيسية فقط
          </Button>
          {currentParent && (
            <Badge variant="secondary" className="text-sm py-1.5 px-3">
              عرض فئات فرعية لـ: {currentParent.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>الفئات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {viewMode === "children" && currentParent
                ? `لا توجد فئات فرعية لـ "${currentParent.name}"`
                : searchTerm
                ? "لا توجد نتائج للبحث"
                : "لا توجد فئات"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الأيقونة</TableHead>
                    <TableHead>الفئة الأم</TableHead>
                    <TableHead>الفئات الفرعية</TableHead>
                    <TableHead>مميز</TableHead>
                    <TableHead className="text-left rtl:text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        {category.icon ? (
                          <span className="text-sm text-gray-600">{category.icon}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {category.parent ? (
                          <Badge variant="outline">{category.parent.name}</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!category.parent && viewMode !== "children" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChildren(category)}
                            className="text-xs"
                          >
                            <FolderTree className="ml-1 rtl:mr-1 rtl:ml-0 h-3 w-3" />
                            عرض ({getChildrenCount(category.id)})
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.featured ? "default" : "secondary"}
                          className={category.featured ? "bg-amber-100 text-amber-800" : ""}
                        >
                          {category.featured ? "نعم" : "لا"}
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
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
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

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة فئة جديدة</DialogTitle>
            <DialogDescription>قم بإدخال تفاصيل الفئة الجديدة</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">اسم الفئة</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: إلكترونيات"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">الأيقونة (Font Awesome)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="مثال: fas fa-laptop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">الفئة الأم (اختياري)</Label>
              <Select
                value={formData.parent_id?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value ? parseInt(value) : undefined })
                }
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder="اختر الفئة الأم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فئة أم</SelectItem>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">الصورة</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                فئة مميزة
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
            <Button onClick={handleCreateCategory} disabled={saving}>
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

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الفئة</DialogTitle>
            <DialogDescription>قم بتعديل تفاصيل الفئة</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم الفئة</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: إلكترونيات"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon">الأيقونة (Font Awesome)</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="مثال: fas fa-laptop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parent">الفئة الأم (اختياري)</Label>
              <Select
                value={formData.parent_id?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parent_id: value === "none" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="اختر الفئة الأم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فئة أم</SelectItem>
                  {parentCategories
                    .filter((c) => c.id !== selectedCategory?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">الصورة (اختياري - اتركه فارغاً للاحتفاظ بالصورة الحالية)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="edit-featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="edit-featured" className="cursor-pointer">
                فئة مميزة
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
            <Button onClick={handleUpdateCategory} disabled={saving}>
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
              هل أنت متأكد من حذف الفئة "{selectedCategory?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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

