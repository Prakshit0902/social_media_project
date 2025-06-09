import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchCurrentUser } from './store/slices/userSlice'; // update path accordingly
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import { DashBoardLayout } from './layouts/DashBoardLayout';
import { LoginForm } from './components/LandingPage/LoginForm';
import { SignUpForm } from './components/LandingPage/SignUpForm';

function App() {
  const dispatch = useDispatch();
  const { user, authChecked } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, []);

  if (!authChecked) {
    return <div className="w-full h-screen flex items-center justify-center">Checking auth...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <AuthLayout />}>
          <Route index element={<LoginForm />} />
          <Route path="register" element={<SignUpForm />} />
        </Route>
        <Route path="/dashboard" element={user ? <DashBoardLayout /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App
