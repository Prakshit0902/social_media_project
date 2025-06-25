import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { initializeAuth } from './store/slices/authSlice';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import { DashBoardLayout } from './layouts/DashBoardLayout';

// Components
import { LoginForm } from './components/LandingPage/LoginForm';
import { SignUpForm } from './components/LandingPage/SignUpForm';
import { Home } from './components/DashBoard/Home';
import { ExploreSection } from './components/ExploreSection/ExploreSection';
import { UserProfileContainer } from './components/UserProfilePage/UserProfileContainer';
import { RegisterBasicDetails } from './components/LandingPage/RegisterBasicDetails';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';


function App() {
  const dispatch = useDispatch();
  const { 
    user, 
    authChecked, 
    isAuthenticated, 
    isTransitioning,
    loading 
  } = useSelector((state) => state.auth);
  
  const appInitialized = useRef(false);

  useEffect(() => {
    if (!appInitialized.current) {
      appInitialized.current = true;
      console.log("Initializing user session...");
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  // Show loading screen during initial auth check
  if (!authChecked) {
    return <LoadingScreen message="Initializing Session..." />;
  }

  // Show loading screen during any transition or loading state
  if (isTransitioning || (loading && isAuthenticated)) {
    return <LoadingScreen message="Updating Profile..." />;
  }

  // Derive profile completion status
  const isProfileComplete = !!user?.username;

  // Additional check: if authenticated but still loading, show loading screen
  if (isAuthenticated && loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ROUTE GROUP 1: PUBLIC AUTH ROUTES */}
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <AuthLayout />
            ) : (
              <Navigate to={isProfileComplete ? "/dashboard" : "/complete-profile"} replace />
            )
          }
        >
          <Route index element={<LoginForm />} />
          <Route path="register" element={<SignUpForm />} />
        </Route>

        {/* ROUTE GROUP 2: PROFILE COMPLETION ROUTE */}
        <Route
          path="/complete-profile"
          element={
            isAuthenticated ? (
              isProfileComplete ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthLayout />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<RegisterBasicDetails />} />
        </Route>

        {/* ROUTE GROUP 3: PROTECTED APPLICATION ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              isProfileComplete ? (
                <DashBoardLayout />
              ) : (
                <Navigate to="/complete-profile" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<Home />} />
          <Route path="explore" element={<ExploreSection />} />
          <Route path="profile/:identifier" element={<UserProfileContainer />} />
        </Route>
        
        {/* CATCH-ALL ROUTE */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={
                isAuthenticated 
                  ? (isProfileComplete ? "/dashboard" : "/complete-profile") 
                  : "/"
              } 
              replace 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;