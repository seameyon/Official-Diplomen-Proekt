import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/authStore';
import { useThemeStore } from './context/themeStore';

// Layout
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Welcome from './pages/Welcome/Welcome';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Onboarding from './pages/Onboarding/Onboarding';
import Feed from './pages/Feed/Feed';
import RecipeDetail from './pages/Recipes/RecipeDetail';
import APIRecipeDetail from './pages/Recipes/APIRecipeDetail';
import CreateRecipe from './pages/Recipes/CreateRecipe';
import EditRecipe from './pages/Recipes/EditRecipe';
import Favorites from './pages/Favorites/Favorites';
import MealPlan from './pages/MealPlan/MealPlan';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import RegionPage from './pages/Regions/RegionPage';
import Admin from './pages/Admin/Admin';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Only redirect to onboarding if explicitly not completed
  if (user && user.hasCompletedOnboarding === false && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

// Guest Route wrapper
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/recipes" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Allow main admin OR users with isAdmin flag
  const isMainAdmin = user?.email === 'xzvelkosimeon@gmail.com';
  const hasAdminAccess = isMainAdmin || user?.isAdmin;
  
  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { theme } = useThemeStore();
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <div className={theme} style={{ overflow: 'hidden', maxWidth: '100vw' }}>
      {/* Fixed background layer to prevent white overscroll */}
      <div 
        className="fixed inset-0" 
        style={{ 
          backgroundColor: theme === 'dark' ? '#1a1612' : '#f5f0e8',
          zIndex: -10 
        }} 
      />
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{ 
          backgroundColor: theme === 'dark' ? '#1a1612' : '#f5f0e8',
          overflowX: 'hidden',
          maxWidth: '100vw',
          width: '100%'
        }}
      >
        <Routes>
          {/* Welcome page for unauthenticated users */}
          <Route path="/welcome" element={<Welcome />} />
          
          {/* Main layout routes */}
          <Route element={<MainLayout />}>
            {/* Home/Landing - accessible to all */}
            <Route path="/" element={<Landing />} />
            
            {/* Recipes - accessible to all */}
            <Route path="/recipes" element={<Feed />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/api/:id" element={<APIRecipeDetail />} />
            <Route path="/regions/:regionId" element={<RegionPage />} />
            
            {/* Protected routes */}
            <Route path="/recipes/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
            <Route path="/recipes/:id/edit" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Admin route */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
          
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          </Route>
          
          {/* Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#2d2520' : '#faf8f5',
              color: theme === 'dark' ? '#e8dcc8' : '#4a3525',
              borderRadius: '12px',
              padding: '16px',
              border: theme === 'dark' ? '2px solid #5a4535' : '2px solid #c49a6c',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: {
                primary: '#8bc34a',
                secondary: theme === 'dark' ? '#2d2520' : '#faf8f5',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: theme === 'dark' ? '#2d2520' : '#faf8f5',
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
