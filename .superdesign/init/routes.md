# routes.md

Route mapping for the frontend (React Router v6).

## Router entry
- Source: `src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/layout/Footer';
import MainLayout from './components/layout/MainLayout';
import ProtectedLayout from './components/layout/ProtectedLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import Onboarding from './pages/auth/Onboarding';
import Home from './pages/dashboard/Home';
import PostItem from './pages/dashboard/PostItem';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';
import ClaimsManagement from './pages/dashboard/ClaimsManagement';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import CommunityGuidelines from './pages/legal/CommunityGuidelines';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/post" element={<PostItem />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/claims" element={<ClaimsManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <AppRoutes />
          </GoogleOAuthProvider>
        ) : (
          <AppRoutes />
        )}
      </AuthProvider>
    </Router>
  );
}

export default App;
```

## Route table

### Public auth
- `/login` → `src/pages/auth/Login.jsx`
- `/signup` → `src/pages/auth/Signup.jsx`
- `/verify-email` → `src/pages/auth/VerifyEmail.jsx`

### MainLayout (public pages)
- `/` → `src/pages/dashboard/Home.jsx` (home feed of lost/found items)
- `/onboarding` → `src/pages/auth/Onboarding.jsx` (university/campus onboarding)
- `/privacy` → `src/pages/legal/PrivacyPolicy.jsx`
- `/terms` → `src/pages/legal/Terms.jsx`
- `/community-guidelines` → `src/pages/legal/CommunityGuidelines.jsx`
- `/about` → `src/pages/About.jsx`
- `/how-it-works` → `src/pages/HowItWorks.jsx`

### ProtectedLayout (requires auth + verified email + university selected)
- `/post` → `src/pages/dashboard/PostItem.jsx` (post lost/found form)
- `/profile` → `src/pages/dashboard/Profile.jsx`
- `/notifications` → `src/pages/dashboard/Notifications.jsx`
- `/claims` → `src/pages/dashboard/ClaimsManagement.jsx`

