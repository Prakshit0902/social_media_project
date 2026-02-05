"use client";
import React, { useCallback, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { IconEye, IconEyeOff, IconArrowRight, IconLoader2, IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, signupUser } from "../../store/slices/authSlice";
import { setUserLikedPosts } from "../../store/slices/postSlice";
import { motion } from "motion/react";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user, error } = useSelector((state) => state.auth);
  const [nameData, setNameData] = useState({ firstname: '', lastname: '' });
  const [formData, setFormData] = useState({ email: '', password: '', fullname: '' });
  const [confirmpassword, setConfirmPassword] = useState('');

  const signInButtonClick = () => {
    navigate('/');
  };

  const handleChange = useCallback(
    (e) => {
      setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    },
    []
  );

  const handleNameChange = (e) => {
    const { id, value } = e.target;
    setNameData(prev => {
      const updatedName = { ...prev, [id]: value };
      setFormData(prevForm => ({
        ...prevForm,
        fullname: `${updatedName.firstname} ${updatedName.lastname}`.trim(),
      }));
      return updatedName;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (!formData.fullname.trim()) {
      alert("Please enter your full name");
      return;
    }

    try {
      const result = await dispatch(signupUser(formData)).unwrap();
      dispatch(setUserLikedPosts([]));
      navigate('/complete-profile', { replace: true });
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  // Password strength indicators
  const passwordChecks = [
    { label: "At least 6 characters", check: formData.password.length >= 6 },
    { label: "Passwords match", check: confirmpassword && formData.password === confirmpassword },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Create Account
        </h2>
        <p className="text-neutral-400 text-sm">
          Join our community today
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <LabelInputContainer>
            <Label htmlFor="firstname" className="text-neutral-300 text-sm font-medium">
              First name
            </Label>
            <Input 
              id="firstname" 
              placeholder="John" 
              type="text" 
              onChange={handleNameChange}
              required
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname" className="text-neutral-300 text-sm font-medium">
              Last name
            </Label>
            <Input 
              id="lastname" 
              placeholder="Doe" 
              type="text" 
              onChange={handleNameChange}
              required
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
            />
          </LabelInputContainer>
        </div>

        {/* Email field */}
        <LabelInputContainer>
          <Label htmlFor="email" className="text-neutral-300 text-sm font-medium">
            Email Address
          </Label>
          <Input 
            id="email" 
            placeholder="you@example.com" 
            type="email" 
            onChange={handleChange}
            required
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
          />
        </LabelInputContainer>

        {/* Password field */}
        <LabelInputContainer>
          <Label htmlFor="password" className="text-neutral-300 text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              onChange={handleChange}
              required
              minLength={6}
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl pr-12 transition-all"
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

        {/* Confirm Password field */}
        <LabelInputContainer>
          <Label htmlFor="confirmpassword" className="text-neutral-300 text-sm font-medium">
            Confirm Password
          </Label>
          <Input 
            id="confirmpassword" 
            placeholder="••••••••" 
            type="password" 
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
          />
        </LabelInputContainer>

        {/* Password strength indicators */}
        {formData.password && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5"
          >
            {passwordChecks.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {item.check ? (
                  <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <IconX className="w-3.5 h-3.5 text-neutral-500" />
                )}
                <span className={item.check ? "text-emerald-400" : "text-neutral-500"}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Sign Up button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed mt-6"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <IconLoader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Sign in link */}
        <p className="text-center text-neutral-400 text-sm mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={signInButtonClick}
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
          >
            Sign in
          </button>
        </p>

        {/* Terms */}
        <p className="text-center text-neutral-500 text-xs mt-4">
          By signing up, you agree to our{" "}
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a>
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

export const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
