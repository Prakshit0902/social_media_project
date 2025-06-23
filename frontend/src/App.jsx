import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { fetchCurrentUser, refreshAccessToken } from './store/slices/authSlice';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import { DashBoardLayout } from './layouts/DashBoardLayout';
import { LoginForm } from './components/LandingPage/LoginForm';
import { SignUpForm } from './components/LandingPage/SignUpForm';
import { Home } from './components/DashBoard/Home';
import { ExploreSection } from './components/ExploreSection/ExploreSection';
import { UserProfileContainer } from './components/UserProfilePage/UserProfileContainer';
import { ProtectedRoute } from './components/UtilityComponent/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { user, authChecked, isAuthenticated, loading } = useSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        // First try to get current user
        const result = await dispatch(fetchCurrentUser()).unwrap();
        // If fetchCurrentUser fails, result will be rejected
      } catch (error) {
        // Only try refresh token if fetchCurrentUser failed
        try {
          await dispatch(refreshAccessToken()).unwrap();
        } catch (refreshError) {
          // Both failed, user is not authenticated
          console.log('User is not authenticated');
        }
      }
    };

    initAuth();
  }, [dispatch]);

  // Show loading while checking authentication
  if (!authChecked || loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />}>
          <Route index element={<LoginForm />} />
          <Route path="register" element={<SignUpForm />} />
        </Route>
        
        <Route path="/dashboard" element={isAuthenticated ? <DashBoardLayout /> : <Navigate to="/" replace />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<ExploreSection />} />
          <Route path="profile/:identifier" element={<UserProfileContainer />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;   