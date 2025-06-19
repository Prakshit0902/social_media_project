import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchCurrentUser, refreshAccessToken } from './store/slices/authSlice'; // update path accordingly
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import { DashBoardLayout } from './layouts/DashBoardLayout';
import { LoginForm } from './components/LandingPage/LoginForm';
import { SignUpForm } from './components/LandingPage/SignUpForm';
import { Home } from './components/DashBoard/Home';
import { ExploreSection } from './components/ExploreSection/ExploreSection';

function App() {
  const dispatch = useDispatch();
  const { user, authChecked,isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    
    if (!isAuthenticated && authChecked) {
      dispatch(refreshAccessToken())
    }
  }, []);

  if (!authChecked) {
    return <div className="w-full h-screen flex items-center justify-center">Checking auth...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="dashboard" /> : <AuthLayout />}>
          <Route index element={<LoginForm />} />
          <Route path="register" element={<SignUpForm />} />
        </Route>
        <Route path="dashboard" element={user ? <DashBoardLayout /> : <Navigate to="/" />} >
          <Route  index element = {<Home />} />
          <Route path='explore' element = {<ExploreSection/>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App
