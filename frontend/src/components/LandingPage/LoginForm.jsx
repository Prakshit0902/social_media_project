"use client";
import React, { useCallback } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { IconEye, IconEyeOff, IconArrowRight, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { useDispatch , useSelector} from "react-redux";
import { fetchCurrentUser, loginUser } from "../../store/slices/authSlice";
import { setUserLikedPosts } from "../../store/slices/postSlice";
import { motion } from "motion/react";


export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {loading, error, user} = useSelector((state) => state.auth)

  const [formData,setFormData] = useState({identifier : '' , password : ''})

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(formData)).unwrap()
      
      if (result.user && result.user.likedPosts) {
        dispatch(setUserLikedPosts(result.user.likedPosts));
      }
      await dispatch(fetchCurrentUser()).unwrap()
      navigate('/dashboard',{replace : true})
    } catch (err) {
      console.error('Login failed:', err);
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  const signUpButtonClick = () => {
    navigate('/register')
  }

  if (user){
    navigate('/dashboard')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-neutral-400 text-sm">
          Sign in to continue your journey
        </p>
      </div>

      {/* Error message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email/Username field */}
        <LabelInputContainer>
          <Label htmlFor="identifier" className="text-neutral-300 text-sm font-medium">
            Email or Username
          </Label>
          <Input 
            id="identifier" 
            placeholder="you@example.com" 
            type="text" 
            onChange={handleChange}
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
          />
        </LabelInputContainer>

        {/* Password field */}
        <LabelInputContainer>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-neutral-300 text-sm font-medium">
              Password
            </Label>
            <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl pr-12 transition-all"
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </LabelInputContainer>

        {/* Sign In button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <IconLoader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Sign up link */}
        <p className="text-center text-neutral-400 text-sm mt-8">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={signUpButtonClick}
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
          >
            Create one
          </button>
        </p>
      </form>
    </motion.div>
  );
}

export function BottomGradient() {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
