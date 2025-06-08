import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom' 

import './App.css'
import { LandingPage } from './components/LandingPage/LandingPage'
import { SignUpForm } from './components/LandingPage/SignUpForm'
import { LoginForm } from './components/LandingPage/LoginForm'
import AuthLayout from './layouts/AuthLayout'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<LoginForm />} />
          <Route path="register" element={<SignUpForm />} />
        </Route>
        {/* Add dashboard routes later here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
