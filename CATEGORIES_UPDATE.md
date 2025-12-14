# تحديث صفحة التصنيفات - Categories Update

## نظرة عامة - Overview
تم تحديث صفحة إدارة التصنيفات لدعم عرض التسلسل الهرمي للتصنيفات (الأصلية والفرعية) بناءً على التحديثات الجديدة في الـ API.

The categories management page has been updated to support viewing the hierarchical structure of categories (parent and children) based on the new API updates.

---

## الميزات الجديدة - New Features

### 1. أوضاع العرض المتعددة - Multiple View Modes

#### 📋 كل التصنيفات (All Categories)
- عرض جميع التصنيفات (الأصلية والفرعية معاً)
- الوضع الافتراضي عند فتح الصفحة
- Shows all categories (both parent and child categories together)
- Default mode when opening the page

#### 📁 التصنيفات الرئيسية فقط (Parents Only)
- عرض التصنيفات الرئيسية فقط (التي لا تحتوي على تصنيف أب)
- مفيد للتنقل السريع بين التصنيفات الرئيسية
- Shows only parent categories (those without a parent)
- Useful for quick navigation between main categories

#### 🌳 عرض التصنيفات الفرعية (View Children)
- عرض التصنيفات الفرعية لتصنيف محدد
- يتم الوصول إليه من خلال زر "عرض" بجانب كل تصنيف رئيسي
- Shows child categories of a specific parent
- Accessed through the "View" button next to each parent category

---

### 2. التنقل الهرمي - Hierarchical Navigation

#### مسار التنقل (Breadcrumb)
```
كل التصنيفات ← [اسم التصنيف الأصلي]
All Categories ← [Parent Category Name]
```

- يظهر عند عرض التصنيفات الفرعية
- يمكن النقر على "كل التصنيفات" للعودة إلى العرض الشامل
- Shows when viewing child categories
- Click on "All Categories" to return to full view

#### أزرار التنقل (Navigation Buttons)
1. **كل التصنيفات** - All Categories
2. **التصنيفات الرئيسية فقط** - Parents Only
3. **Badge** يظهر اسم التصنيف الحالي عند عرض الفرعيات

---

### 3. عداد التصنيفات الفرعية - Children Counter

- عرض عدد التصنيفات الفرعية لكل تصنيف رئيسي
- زر تفاعلي "عرض (X)" حيث X هو عدد التصنيفات الفرعية
- Shows the count of child categories for each parent category
- Interactive "View (X)" button where X is the number of children

---

### 4. عمود جديد في الجدول - New Table Column

```
| الصورة | الاسم | الأيقونة | الفئة الأم | الفئات الفرعية | مميز | إجراءات |
| Image | Name | Icon | Parent | Children | Featured | Actions |
```

العمود الجديد: **الفئات الفرعية** - Children column:
- يظهر زر "عرض" للتصنيفات الرئيسية
- يخفي الزر للتصنيفات الفرعية
- "-" للتصنيفات التي لا تحتوي على فرعيات

---

## التحديثات التقنية - Technical Updates

### 1. API Integration

#### تحديث api.ts
```typescript
fetchCategories: (params?: { 
  page?: number; 
  search?: string; 
  parent_id?: number | string 
}) => api.get("/categories", { params })
```

الآن يدعم معامل `parent_id` لتصفية التصنيفات حسب التصنيف الأصلي.
Now supports `parent_id` parameter to filter categories by parent.

### 2. State Management

```typescript
const [currentParent, setCurrentParent] = useState<Category | null>(null)
const [viewMode, setViewMode] = useState<"all" | "parents" | "children">("all")
```

- **currentParent**: التصنيف الأصلي الحالي عند عرض الفرعيات
- **viewMode**: وضع العرض الحالي

### 3. Smart Loading

```typescript
const loadCategories = async (parentId?: number | null) => {
  const params: any = {}
  
  if (viewMode === "children" && parentId) {
    params.parent_id = parentId
  }
  
  const res = await apiService.fetchCategories(params)
  setCategories(res.data?.data || res.data || [])
}
```

- تحميل ذكي حسب وضع العرض
- استخدام `parent_id` فقط عند الحاجة
- Smart loading based on view mode
- Uses `parent_id` only when needed

### 4. Filtering Logic

```typescript
const filteredCategories = categories.filter((c) => {
  const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  
  if (viewMode === "parents") {
    return matchesSearch && !c.parent
  }
  
  return matchesSearch
})
```

- تصفية محلية للتصنيفات الرئيسية
- دعم البحث في جميع الأوضاع
- Local filtering for parent categories
- Search support in all modes

---

## تجربة المستخدم - User Experience

### 1. رسائل فارغة ذكية - Smart Empty States

```
- "لا توجد فئات فرعية لـ [اسم التصنيف]" - عند عدم وجود فرعيات
- "لا توجد نتائج للبحث" - عند البحث دون نتائج
- "لا توجد فئات" - عند عدم وجود تصنيفات

- "No child categories for [Category Name]" - when no children exist
- "No search results" - when searching without results
- "No categories" - when no categories exist
```

### 2. تصميم متجاوب - Responsive Design

- أزرار التنقل تتكيف مع الشاشات الصغيرة
- Breadcrumb يظهر بشكل واضح على الموبايل
- Navigation buttons adapt to small screens
- Breadcrumb displays clearly on mobile

### 3. واجهة عربية - Arabic Interface

- جميع النصوص بالعربية [[memory:1354200]]
- تخطيط من اليمين إلى اليسار (RTL)
- أيقونات معكوسة بشكل صحيح للـ RTL
- All text in Arabic
- Right-to-left (RTL) layout
- Icons properly mirrored for RTL

---

## سيناريوهات الاستخدام - Usage Scenarios

### السيناريو 1: عرض جميع التصنيفات
1. افتح صفحة التصنيفات
2. الوضع الافتراضي: "كل التصنيفات"
3. شاهد جميع التصنيفات مع معلومات التصنيف الأصلي

### السيناريو 2: التنقل للتصنيفات الفرعية
1. انقر على زر "عرض (X)" بجانب أي تصنيف رئيسي
2. سيتم عرض التصنيفات الفرعية فقط
3. يظهر Breadcrumb للتنقل
4. انقر "كل التصنيفات" للعودة

### السيناريو 3: عرض التصنيفات الرئيسية فقط
1. انقر على زر "التصنيفات الرئيسية فقط"
2. سيتم إخفاء جميع التصنيفات الفرعية
3. مثالي للحصول على نظرة عامة على البنية

### السيناريو 4: البحث
- البحث يعمل في جميع الأوضاع
- يبحث في اسم التصنيف
- النتائج تتبع الوضع الحالي (all/parents/children)

---

## الملفات المعدلة - Modified Files

1. **lib/api.ts**
   - إضافة معامل `parent_id` لـ `fetchCategories`

2. **components/dashboard/categories-management-page.tsx**
   - إضافة state management للتنقل الهرمي
   - إضافة أزرار التنقل و breadcrumb
   - تحديث منطق التحميل والتصفية
   - إضافة عمود "التصنيفات الفرعية"
   - تحديث رسائل الحالة الفارغة

---

## الأيقونات المستخدمة - Icons Used

- 🏠 **Home**: للعودة إلى كل التصنيفات
- 📁 **FolderTree**: لعرض التصنيفات الفرعية
- ➡️ **ArrowRight**: للفصل في Breadcrumb (معكوس للـ RTL)

---

## الاختبار - Testing

### نقاط الاختبار الموصى بها:
1. ✅ عرض جميع التصنيفات
2. ✅ التبديل بين الأوضاع المختلفة
3. ✅ عرض التصنيفات الفرعية
4. ✅ التنقل باستخدام Breadcrumb
5. ✅ البحث في كل وضع
6. ✅ إنشاء تصنيف جديد (رئيسي وفرعي)
7. ✅ تعديل وحذف التصنيفات
8. ✅ عداد التصنيفات الفرعية دقيق

---

## ملاحظات للتطوير المستقبلي - Future Development Notes

### تحسينات محتملة:
1. **Pagination**: دعم الصفحات للتصنيفات الكثيرة
2. **Drag & Drop**: إعادة ترتيب التصنيفات
3. **Deep Nesting**: دعم أكثر من مستويين من التسلسل
4. **Bulk Actions**: عمليات جماعية على التصنيفات
5. **Export/Import**: تصدير واستيراد التصنيفات

---

## API Documentation Reference

Based on `categories.json`:
- **Endpoint**: `/api/v1/admin/categories`
- **Method**: GET
- **Query Parameters**:
  - `per_page`: عدد العناصر في الصفحة
  - `search`: البحث عن تصنيف
  - `parent_id`: تصفية حسب التصنيف الأصلي (جديد!)

---

تم التحديث بنجاح! ✨
Successfully Updated! ✨

