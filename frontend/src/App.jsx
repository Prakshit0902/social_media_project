import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { initializeAuth } from './store/slices/authSlice';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import { DashBoardLayout } from './layouts/DashBoardLayout';
import { SettingsLayout } from './layouts/SettingsLayout';
import { ChatLayout } from './layouts/ChatLayout'; // Import the new ChatLayout

// Components
import { LoginForm } from './components/LandingPage/LoginForm';
import { SignUpForm } from './components/LandingPage/SignUpForm';
import { Home } from './components/DashBoard/Home';
import { ExploreSection } from './components/ExploreSection/ExploreSection';
import { UserProfileContainer } from './components/UserProfilePage/UserProfileContainer';
import { RegisterBasicDetails } from './components/LandingPage/RegisterBasicDetails';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import { EditProfile } from './components/SettingsComponent/EditProfile';
import { Settings } from './components/SettingsComponent/Settings';

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
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  if (!authChecked) {
    return <LoadingScreen message="Initializing Session..." />;
  }

  if (isTransitioning || (loading && isAuthenticated)) {
    return <LoadingScreen message="Updating Profile..." />;
  }

  const isProfileComplete = !!user?.username;

  if (isAuthenticated && loading && !isTransitioning) {
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
          
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<EditProfile />} />
            <Route path="account" element={<Settings />} />
          </Route>
        </Route>

        {/* --- ROUTE GROUP 4: NEW CHAT ROUTE --- */}
        <Route
          path="/dashboard/messages"
          element={
            isAuthenticated ? (
              isProfileComplete ? (
                <ChatLayout />
              ) : (
                <Navigate to="/complete-profile" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          {/* This nested route makes /dashboard/messages/:chatId work */}
          <Route path=":chatId" element={<></>} />
        </Route>
        
        {/* CATCH-ALL ROUTE */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={isAuthenticated ? (isProfileComplete ? "/dashboard" : "/complete-profile") : "/"} 
              replace 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;