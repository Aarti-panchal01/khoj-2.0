# pages.md

Key pages and their local dependency trees (UI-relevant).

## / (Home Feed)
Entry: `src/pages/dashboard/Home.jsx`

Dependencies:
- `src/pages/dashboard/Home.jsx`
  - `src/lib/constants.js` (CATEGORIES)
  - `src/components/ui/Card.jsx`
  - `src/components/ui/Badge.jsx`
  - `src/components/ui/Input.jsx`
  - `src/components/ui/Select.jsx`
  - `src/components/ui/Button.jsx`
  - `src/components/ui/ItemDetailModal.jsx`
    - `src/components/ui/Badge.jsx`
    - `src/components/ui/Button.jsx`
    - `src/components/ui/Card.jsx`
    - `src/components/ui/ClaimModal.jsx`
      - `src/components/ui/Button.jsx`
      - `src/components/ui/Card.jsx`
      - `src/lib/apiClient.js` (ClaimsAPI)
    - `src/lib/apiClient.js` (format, navigate, etc.)
  - `src/context/AuthContext.jsx` (useAuth)
  - `src/lib/apiClient.js` (ItemsAPI, UniversityAPI)

Also relevant globals:
- `src/index.css`
- `tailwind.config.js`
- `src/components/layout/Navbar.jsx`
- `src/components/layout/MainLayout.jsx`

## /post (Post Item Form)
Entry: `src/pages/dashboard/PostItem.jsx`

Dependencies:
- `src/pages/dashboard/PostItem.jsx`
  - `src/lib/apiClient.js` (ItemsAPI, UploadAPI)
  - `src/lib/constants.js` (CATEGORIES)
  - `src/components/ui/Card.jsx`
  - `src/components/ui/Input.jsx`
  - `src/components/ui/Select.jsx`
  - `src/components/ui/Button.jsx`

Also relevant globals:
- `src/index.css`
- `tailwind.config.js`
- `src/components/layout/Navbar.jsx`
- `src/components/layout/ProtectedLayout.jsx`

## Item Detail (Modal)
Entry: `src/components/ui/ItemDetailModal.jsx`

Dependencies:
- `src/components/ui/ItemDetailModal.jsx`
  - `src/components/ui/Badge.jsx`
  - `src/components/ui/Button.jsx`
  - `src/components/ui/Card.jsx`
  - `src/components/ui/ClaimModal.jsx`
    - `src/components/ui/Button.jsx`
    - `src/components/ui/Card.jsx`
    - `src/lib/apiClient.js` (ClaimsAPI)

