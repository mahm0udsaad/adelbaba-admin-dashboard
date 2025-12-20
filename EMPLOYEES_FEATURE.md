# Employee Management Feature Documentation

## Overview
This document describes the newly implemented Employee Management feature that allows administrators to create, view, edit, and delete employee and admin accounts through a dedicated interface.

## Implementation Details

### 1. New Files Created

#### `/app/employees/page.tsx`
- Server component that serves as the entry point for the employees page
- Implements dynamic rendering with Suspense for loading states
- Provides seamless integration with the Next.js App Router

#### `/components/dashboard/employees-page.tsx`
- Main client component for employee management
- Comprehensive CRUD (Create, Read, Update, Delete) functionality
- Mobile-first responsive design with optimized table views
- Real-time search and filtering capabilities

### 2. Features Implemented

#### Employee Listing
- Displays all employees and admins in a responsive table
- Shows key information: name, email, phone, roles, type, and status
- Mobile-optimized layout with hidden columns on smaller screens
- Real-time search across all fields
- Filter by type: Admin, Employee, or All

#### Create New Employee
- Full-featured dialog form with validation
- Required fields: Name, Email, Password, Password Confirmation, Roles
- Optional fields: Phone
- Selectable fields:
  - Type: Admin or Employee
  - Active Status: Toggle switch
  - Roles: Multi-select with checkboxes from available roles
- Real-time validation with error messages
- Password confirmation matching
- Minimum role selection requirement (at least 1 role)

#### Edit Employee
- Pre-populated form with existing employee data
- All fields editable including roles and status
- Password update is optional (leave blank to keep existing)
- Type change support (convert employee to admin or vice versa)
- Active/Inactive status toggle
- Role reassignment with visual feedback

#### Delete Employee
- Confirmation dialog before deletion
- Safe deletion with error handling
- Automatic list refresh after deletion

#### Search & Filter
- Real-time search across:
  - Employee name
  - Email address
  - Phone number
  - Role names
- Type filter: Admin, Employee, or All
- Instant results without page reload

### 3. API Integration

The feature integrates with the following backend endpoints from `employes.json`:

```
GET    /api/v1/admin/management?type={type}     - List admins/employees
POST   /api/v1/admin/management                 - Create new employee
GET    /api/v1/admin/management/{id}            - Get employee details
PUT    /api/v1/admin/management/{id}            - Update employee
DELETE /api/v1/admin/management/{id}            - Delete employee
GET    /api/v1/admin/roles                      - Get available roles
```

All API functions are already implemented in `/lib/api.ts`:
- `apiService.fetchManagement(type)`
- `apiService.createManagementUser(data)`
- `apiService.fetchManagementUser(id)`
- `apiService.updateManagementUser(id, data)`
- `apiService.deleteManagementUser(id)`
- `apiService.fetchRoles()`

### 4. Navigation Integration

The employees page has been added to the main navigation in `/components/app-shell.tsx`:
- Menu item: "الموظفون والمديرون" (Employees and Admins)
- Icon: UserCog
- Route: `/employees`
- Position: After "المستخدمون" (Users) in the sidebar

### 5. Data Validation

#### Create Employee Validation:
- Name: Required, non-empty
- Email: Required, non-empty, valid email format
- Password: Required
- Password Confirmation: Required, must match password
- Roles: At least one role must be selected
- Phone: Optional
- Type: Required (admin or employee)
- Active Status: Boolean (default: true)

#### Update Employee Validation:
- Same as create, except password is optional
- If password is provided, confirmation must match
- All other validations remain the same

### 6. UI/UX Features

#### Mobile-First Design
- Responsive table that adapts to screen sizes
- Stacked information on mobile devices
- Full-screen dialogs on mobile
- Touch-friendly buttons and controls

#### Visual Feedback
- Loading spinners during API calls
- Toast notifications for success/error messages
- Inline error alerts in forms
- Active/inactive status badges
- Role badges with color coding
- Disabled states during operations

#### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Form labels for all inputs
- Focus management in dialogs
- Clear error messages

#### User Experience
- Automatic list refresh after operations
- Non-blocking operations
- Clear action confirmations
- Helpful placeholder text
- Progress indicators
- RTL (Right-to-Left) support for Arabic

### 7. Error Handling

The implementation includes comprehensive error handling:
- Network errors
- API validation errors
- Authentication errors
- Permission errors
- Data format errors
- User-friendly error messages in Arabic

### 8. State Management

The component manages multiple states:
- Employee list data
- Available roles
- Search term
- Type filter
- Loading states
- Dialog open/close states
- Form data
- Selected employee
- Saving states
- Error states

### 9. Form Fields

#### Create/Edit Form Fields:

**Basic Information:**
- Name (text input, required)
- Email (email input, required)
- Phone (text input, optional)

**Authentication:**
- Password (password input, required for create, optional for edit)
- Password Confirmation (password input, required when password is set)

**Settings:**
- Type (select: employee/admin, required)
- Active Status (switch, default: true)

**Permissions:**
- Roles (multi-select checkboxes, at least 1 required)
  - Displays all available roles from the system
  - Shows count of selected roles
  - Scrollable list for many roles

### 10. API Request/Response Format

#### Create Employee Request:
```json
{
  "name": "Employee Name",
  "email": "employee@example.com",
  "phone": "05xxxxxxxx",
  "password": "password123",
  "password_confirmation": "password123",
  "roles": [1, 3],
  "type": "employee",
  "is_active": true
}
```

#### Update Employee Request:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "05xxxxxxxx",
  "password": "newpassword123",  // optional
  "password_confirmation": "newpassword123",  // optional
  "roles": [1, 2, 3],
  "type": "admin",
  "is_active": false
}
```

#### Response Format:
```json
{
  "message": "Success message",
  "data": {
    "id": 628,
    "name": "Employee Name",
    "email": "employee@example.com",
    "phone": "05xxxxxxxx",
    "roles": [
      {
        "id": 1,
        "name": "Support",
        "isActive": 1
      }
    ]
  }
}
```

### 11. Security Considerations

- Authentication required (Bearer token)
- Authorization checked via roles/permissions
- Password confirmation required
- No password exposure in responses
- Secure password handling
- CSRF protection via API layer

### 12. Performance Optimizations

- Lazy loading with Suspense
- Optimized re-renders
- Efficient search filtering
- Pagination ready (API supports it)
- Minimal re-fetches
- Optimistic UI updates

## Usage Instructions

### Accessing the Page
1. Navigate to the sidebar menu
2. Click on "الموظفون والمديرون" (Employees and Admins)
3. The page will load with the list of employees

### Creating a New Employee
1. Click the "إضافة موظف جديد" (Add New Employee) button
2. Fill in the required fields
3. Select at least one role
4. Choose the type (Admin or Employee)
5. Set the active status
6. Click "إنشاء الموظف" (Create Employee)

### Editing an Employee
1. Click the three-dot menu (⋮) next to the employee
2. Select "تعديل" (Edit)
3. Update the desired fields
4. Optionally change the password
5. Click "حفظ التغييرات" (Save Changes)

### Deleting an Employee
1. Click the three-dot menu (⋮) next to the employee
2. Select "حذف" (Delete)
3. Confirm the deletion in the dialog
4. Click "حذف" (Delete) to confirm

### Searching and Filtering
1. Use the search box to filter by name, email, phone, or role
2. Use the type dropdown to filter by Admin, Employee, or All
3. Results update instantly

## Testing Checklist

- [ ] Page loads correctly at `/employees`
- [ ] Employee list displays properly
- [ ] Search functionality works
- [ ] Filter by type works
- [ ] Create employee form opens
- [ ] Create employee validation works
- [ ] Create employee submits successfully
- [ ] Edit employee form pre-populates
- [ ] Edit employee updates successfully
- [ ] Password update (optional) works
- [ ] Delete confirmation appears
- [ ] Delete employee works
- [ ] Toast notifications appear
- [ ] Error handling works
- [ ] Mobile responsive design works
- [ ] RTL layout works correctly
- [ ] Navigation link works

## Future Enhancements

Potential improvements for future iterations:
1. Pagination controls for large datasets
2. Export to CSV/Excel functionality
3. Bulk operations (bulk delete, bulk role assignment)
4. Advanced filtering (by role, by status, by date)
5. Employee activity logs
6. Password reset functionality
7. Email verification
8. Profile picture upload
9. Advanced search with filters
10. Sort by columns

## Troubleshooting

### Common Issues:

**Issue: "فشل تحميل البيانات" (Failed to load data)**
- Check network connection
- Verify authentication token
- Check API endpoint availability

**Issue: "فشل إنشاء الموظف" (Failed to create employee)**
- Verify all required fields are filled
- Check password confirmation matches
- Ensure at least one role is selected
- Check for duplicate email

**Issue: Navigation link not showing**
- Clear browser cache
- Verify app-shell.tsx was updated
- Check user permissions

## Support

For issues or questions, refer to:
- API documentation: `employes.json`
- API integration guide: `API_INTEGRATION.md`
- API client functions: `lib/api.ts`

