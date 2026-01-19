# User Roles System

Complete role-based access control (RBAC) system for Petagri.

## Roles

### 1. **Developer**

- Full system access for development and debugging
- Permissions: All (system, users, mitra, products, tenders, consultations, orders, reports)

### 2. **Owner Platform**

- Platform owner with full administrative access
- Permissions: System read/write, user management, all business operations, finance

### 3. **Admin Platform**

- Platform administrator with management capabilities
- Permissions: User management, approve mitra, manage products, view all operations

### 4. **Konsultan** (Consultant)

- Agricultural consultant providing expert advice
- Permissions: Manage consultations, farms, recommend products, create tenders from visits

### 5. **Mitra Toko** (Shop Partner)

- Shop partner managing products and orders
- Permissions: Manage own products, orders, bid on tenders, manage inventory

### 6. **Pemilik Kebun** (Farm Owner)

- Farm owner managing agricultural operations
- Permissions: Manage own farms, request consultations, view products, place orders

### 7. **Supir** (Driver)

- Driver managing deliveries and logistics
- Permissions: View assigned orders, update delivery status, manage routes

## Database Structure

### Tables

#### `roles`

```sql
- id (UUID, PK)
- name (VARCHAR, UNIQUE) - Snake_case identifier
- display_name (VARCHAR) - Human-readable name
- description (TEXT)
- permissions (JSONB) - Permission structure
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### `user_roles` (Junction Table)

```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- role_id (UUID, FK -> roles)
- assigned_at (TIMESTAMP)
- assigned_by (UUID, FK -> auth.users)
- UNIQUE(user_id, role_id)
```

## Setup Instructions

### 1. Run Migrations

Execute in Supabase SQL Editor:

```sql
-- Create roles and user_roles tables
\i database/migrations/20260119000002_create_roles_table.sql
```

### 2. Seed Roles

```sql
-- Insert default roles
\i database/seeds/005_roles_seed.sql
```

### 3. Create Test Users

**Option A: Via Supabase Dashboard**

1. Go to Authentication → Users
2. Create users with these emails:
   - developer@petagri.com
   - owner@petagri.com
   - admin@petagri.com
   - konsultan@petagri.com
   - mitra@petagri.com
   - pemilik@petagri.com
   - supir@petagri.com
3. Password: `Test123!`
4. Get their user IDs
5. Assign roles manually:

```sql
-- Get role IDs
SELECT id, name FROM roles;

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
('USER_ID_HERE', 'ROLE_ID_HERE');
```

**Option B: Via Application Code**

Create a script using the template in `database/seeds/006_users_with_roles_seed.sql`

## Usage in Code

### Hook: `useRole()`

```typescript
import { useRole } from "@/hooks/use-role";

function MyComponent() {
  const {
    roles,           // Array of user's roles
    isLoading,       // Loading state
    hasRole,         // (roleName) => Promise<boolean>
    hasPermission,   // (resource, action) => Promise<boolean>
    isAdmin,         // Boolean - is admin/owner/developer
    isKonsultan,     // Boolean - is consultant
    isMitraToko,     // Boolean - is shop partner
    isPemilikKebun,  // Boolean - is farm owner
    isSupir,         // Boolean - is driver
  } = useRole();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isKonsultan && <ConsultantDashboard />}
    </div>
  );
}
```

### Service Functions

```typescript
import {
	getRoles,
	getUserRoles,
	userHasRole,
	userHasPermission,
	assignRole,
	removeRole,
} from "@/services/roles";

// Get all active roles
const roles = await getRoles();

// Get user's roles
const userRoles = await getUserRoles(userId);

// Check if user has role
const isDeveloper = await userHasRole(userId, "developer");

// Check permission
const canDelete = await userHasPermission(userId, "products", "delete");

// Assign role (admin only)
await assignRole(userId, roleId);

// Remove role (admin only)
await removeRole(userId, roleId);
```

## Permission Structure

Permissions are stored as JSONB with this structure:

```json
{
	"resource_name": ["action1", "action2"],
	"products": ["read", "write", "delete"],
	"orders": ["read", "write", "manage_own"]
}
```

### Common Resources

- `system` - System-level operations
- `users` - User management
- `mitra` - Mitra partner management
- `products` - Product management
- `tenders` - Tender/bidding system
- `consultations` - Consultation services
- `orders` - Order management
- `deliveries` - Delivery/logistics
- `reports` - Reporting
- `finance` - Financial operations

### Common Actions

- `read` - View data
- `write` - Create/update data
- `delete` - Delete data
- `manage_own` - Manage own data only
- `manage_all` - Manage all data
- `approve` - Approve requests
- `export` - Export data

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

**roles table:**

- Anyone can view active roles
- Only admins can insert/update roles

**user_roles table:**

- Users can view their own roles
- Admins can view all role assignments
- Only admins can assign/remove roles

### Best Practices

1. **Never bypass RLS** - Always use authenticated users
2. **Check permissions** - Use `hasPermission()` before operations
3. **Principle of least privilege** - Assign minimal required roles
4. **Audit trail** - Track role assignments via `assigned_by`

## Examples

### Protect Admin Routes

```typescript
// app/admin/_layout.tsx
import { useRole } from "@/hooks/use-role";
import { Redirect } from "expo-router";

export default function AdminLayout() {
  const { isAdmin, isLoading } = useRole();

  if (isLoading) return <Loading />;
  if (!isAdmin) return <Redirect href="/" />;

  return <Stack />;
}
```

### Conditional UI

```typescript
function ProductCard({ product }) {
  const { hasPermission } = useRole();
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    hasPermission("products", "delete").then(setCanDelete);
  }, []);

  return (
    <View>
      <Text>{product.name}</Text>
      {canDelete && (
        <Button onPress={() => deleteProduct(product.id)}>
          Delete
        </Button>
      )}
    </View>
  );
}
```

### Role-Based Navigation

```typescript
function MenuScreen() {
  const { isAdmin, isKonsultan, isMitraToko } = useRole();

  const menuItems = [
    { key: "home", label: "Home", visible: true },
    { key: "admin", label: "Admin Panel", visible: isAdmin },
    { key: "consultations", label: "Consultations", visible: isKonsultan },
    { key: "products", label: "My Products", visible: isMitraToko },
  ].filter(item => item.visible);

  return <MenuGrid items={menuItems} />;
}
```

## Migration from Current System

If you have existing users without roles:

1. Run migrations to create tables
2. Seed roles
3. Assign default role to existing users:

```sql
-- Assign 'pemilik_kebun' role to all existing users without roles
INSERT INTO user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM auth.users u
CROSS JOIN roles r
WHERE r.name = 'pemilik_kebun'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id
  );
```
