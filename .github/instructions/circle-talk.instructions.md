# Circle-Talk to ZRocket UX Transfer Instructions

## Purpose
This file provides GitHub Copilot with instructions on how to transfer UX patterns and components from Circle-Talk to ZRocket, understanding the architectural differences between the two applications.

## Application Architecture Differences

### Circle-Talk (Source)
- **Mode**: Client-Side Rendered (CSR) SPA
- **Router**: React Router 7 Data Router (`createBrowserRouter`)
- **Build**: Vite + React SWC
- **Server**: Static file serving only
- **State**: Client-side state management with React Query
- **File Structure**: Traditional `src/` folder structure

### ZRocket (Target)
- **Mode**: Server-Side Rendering (SSR) capable, React Router 7 Framework
- **Router**: React Router 7 Framework Mode (file-based routing)
- **Build**: React Router dev tools + NestJS backend
- **Server**: Full-stack with NestJS API server
- **State**: Zero sync state + client state management
- **File Structure**: `app/` folder for routes, `src/` for backend

## Transferable UX Patterns

### ✅ Directly Transferable
These patterns can be copied with minimal changes:

1. **Individual Save Button Pattern**
   ```tsx
   // Pattern works in both apps
   const [data, setData] = useState(initialData);
   const hasChanges = JSON.stringify(data) !== JSON.stringify(initialData);
   
   <Button disabled={!hasChanges} onClick={handleSave}>
     Save Changes
   </Button>
   ```

2. **Granular State Management**
   - Section-specific state objects
   - Change detection logic
   - Form validation patterns

3. **UI Components**
   - Radix UI component usage
   - Tailwind CSS styling
   - Component composition patterns

4. **Layout Patterns**
   - Resizable panels
   - Sidebar layouts
   - Modal/dialog patterns

### ⚠️ Requires Adaptation

1. **Routing Implementation**
   
   **Circle-Talk (Data Router)**:
   ```tsx
   const router = createBrowserRouter([
     { path: "/preferences", element: <UserPreferencesPage /> }
   ]);
   ```
   
   **ZRocket (Framework Mode)**:
   ```tsx
   // File: app/routes/preferences.tsx
   export default function Preferences() {
     return <UserPreferencesPage />;
   }
   ```

2. **Navigation**
   
   **Circle-Talk**: Standard `useNavigate()` hook
   **ZRocket**: React Router 7 framework navigation

3. **Data Loading**
   
   **Circle-Talk**: React Query with manual fetching
   **ZRocket**: May use React Router loaders + Zero sync

## Component Transfer Guidelines

### Step 1: Identify Transferable Components
Look for components that focus on:
- Form handling and validation
- State management patterns
- UI composition
- User interaction patterns

### Step 2: Adapt for ZRocket Architecture

#### For Route Components:
1. **Extract UI Logic**: Separate business logic from routing
2. **Create Framework Route**: Convert to React Router 7 framework file structure
3. **Adapt Data Loading**: Use Zero sync instead of React Query where appropriate

#### For Shared Components:
1. **Copy Component**: Place in appropriate ZRocket location
2. **Update Imports**: Adjust path aliases if needed
3. **Test Integration**: Ensure compatibility with Zero state

### Step 3: File Location Mapping

| Circle-Talk Location | ZRocket Equivalent |
|---------------------|-------------------|
| `src/pages/` | `app/routes/` (as route files) |
| `src/components/` | `app/components/` or `src/components/` |
| `src/hooks/` | `app/hooks/` or `src/hooks/` |
| `src/lib/` | `app/lib/` or `src/lib/` |

## Specific UX Patterns to Transfer

### 1. Individual Save Buttons for Preferences

**Source**: Circle-Talk `UserPreferencesPage.tsx` tabs
**Target**: ZRocket preferences routes
**Adaptation**: Convert tabs to separate routes in ZRocket

```tsx
// Circle-Talk: Single page with tabs
<Tabs value={activeTab}>
  <TabsContent value="profile">
    <ProfileTab />
  </TabsContent>
</Tabs>

// ZRocket: Separate routes
// app/routes/preferences/profile.tsx
export default function ProfilePreferences() {
  return <ProfileTab />; // Reused component
}
```

### 2. Files Page Separation

**Source**: Circle-Talk `/files` route
**Target**: ZRocket `/files` route
**Adaptation**: Direct transfer with framework routing

```tsx
// Circle-Talk: router config
{ path: "/files", element: <FilesPage /> }

// ZRocket: file-based routing
// app/routes/files.tsx
export default function Files() {
  return <FilesPage />; // Reused component
}
```

### 3. Form State Management

**Pattern**: Granular form sections with individual save buttons
**Transfer**: Copy form logic, adapt data persistence layer

```tsx
// Transferable pattern (works in both apps)
function useFormSection(initialData, saveFunction) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  
  const hasChanges = JSON.stringify(data) !== JSON.stringify(initialData);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFunction(data);
      // Update initial data after save
    } finally {
      setIsSaving(false);
    }
  };
  
  return { data, setData, hasChanges, isSaving, handleSave };
}
```

## Code Transfer Checklist

### ✅ Before Transfer
- [ ] Identify the UX pattern to transfer
- [ ] Understand current ZRocket structure
- [ ] Plan route structure for framework mode
- [ ] Consider Zero sync integration

### ✅ During Transfer
- [ ] Copy component with minimal changes
- [ ] Update imports and paths
- [ ] Adapt routing approach
- [ ] Replace React Query with Zero sync if applicable
- [ ] Maintain TypeScript types

### ✅ After Transfer
- [ ] Test component integration
- [ ] Verify styling consistency
- [ ] Check accessibility
- [ ] Test responsive behavior
- [ ] Update routing configuration

## Common Pitfalls to Avoid

1. **Don't Copy Route Structure Directly**: ZRocket uses file-based routing
2. **Don't Assume Same Data Layer**: Circle-Talk uses React Query, ZRocket uses Zero
3. **Don't Ignore SSR Considerations**: ZRocket can be server-rendered
4. **Don't Skip Path Updates**: Adjust import paths for ZRocket structure

## Example Transfer: Individual Save Buttons

### 1. Identify Source Pattern
```tsx
// Circle-Talk: apps/circle-talk/src/pages/UserPreferencesPage.tsx
// Look for section-based save button implementation
```

### 2. Extract Reusable Logic
```tsx
// apps/zrocket/app/hooks/useFormSection.ts
export function useFormSection(initialData, saveFunction) {
  // ... transferable logic
}
```

### 3. Create ZRocket Route
```tsx
// apps/zrocket/app/routes/preferences/profile.tsx
import { useFormSection } from '~/hooks/useFormSection';

export default function ProfilePreferences() {
  const { data, setData, hasChanges, handleSave } = useFormSection(
    initialProfileData, 
    saveProfile
  );
  
  return (
    <div>
      {/* Form fields */}
      <Button disabled={!hasChanges} onClick={handleSave}>
        Save Profile
      </Button>
    </div>
  );
}
```

### 4. Update Route Configuration
```tsx
// apps/zrocket/app/routes.ts
route('preferences', 'routes/preferences/layout.tsx', [
  index('routes/preferences/index.tsx'),
  route('profile', 'routes/preferences/profile.tsx'),
  // ... other preference routes
]),
```

## Summary

When transferring UX patterns from Circle-Talk to ZRocket:
1. **Focus on UI/UX logic** rather than routing mechanics
2. **Adapt routing to framework mode** file structure
3. **Consider Zero sync** for data management
4. **Maintain component reusability** and composition patterns
5. **Test thoroughly** in ZRocket's SSR-capable environment

The goal is to bring Circle-Talk's proven UX improvements to ZRocket while respecting each application's architectural constraints and capabilities.
