"use client";
import React, { useState, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearTransition, registerBasicUserDetails } from "../../store/slices/authSlice"; 
import { LabelInputContainer } from "./SignUpForm";
import { IconUserCircle, IconUpload, IconCamera, IconArrowRight, IconLoader2, IconSparkles } from "@tabler/icons-react";
import { motion } from "motion/react";

export function RegisterBasicDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);

  // State for form fields
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !dob || !gender) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('dob', dob);
    formData.append('gender', gender);

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      await dispatch(registerBasicUserDetails(formData)).unwrap();
      navigate('/dashboard', { replace: true });
      setTimeout(() => {
        dispatch(clearTransition());
      }, 500);
    } catch (err) {
      console.error('Failed to update user details:', err);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 mb-4">
          <IconSparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Almost There!
        </h2>
        <p className="text-neutral-400 text-sm">
          Set up your profile to get started
        </p>
      </div>

      {/* Error message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
        >
          {error.message || error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Picture Input */}
        <div className="flex flex-col items-center mb-6">
          <Label className="text-neutral-300 text-sm font-medium mb-3">
            Profile Picture
          </Label>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group cursor-pointer"
            onClick={handleProfileClick}
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-1">
              <div className="w-full h-full rounded-full bg-black/60 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <IconUserCircle className="h-16 w-16 text-neutral-500" />
                )}
              </div>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="flex flex-col items-center gap-1">
                <IconCamera className="w-6 h-6 text-white" />
                <span className="text-white text-xs font-medium">Upload</span>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <p className="text-neutral-500 text-xs mt-2">Optional - Click to upload</p>
        </div>

        {/* Username field */}
        <LabelInputContainer>
          <Label htmlFor="username" className="text-neutral-300 text-sm font-medium">
            Username
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
            <Input 
              id="username" 
              placeholder="your_handle" 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
              required
              className="h-12 pl-8 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
            />
          </div>
          <p className="text-neutral-500 text-xs">This will be your unique identifier</p>
        </LabelInputContainer>

        {/* Date of Birth field */}
        <LabelInputContainer>
          <Label htmlFor="dob" className="text-neutral-300 text-sm font-medium">
            Date of Birth
          </Label>
          <Input 
            id="dob" 
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all [color-scheme:dark]"
          />
        </LabelInputContainer>

        {/* Gender field */}
        <LabelInputContainer>
          <Label htmlFor="gender" className="text-neutral-300 text-sm font-medium">
            Gender
          </Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="h-12 w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="" disabled className="bg-neutral-900">Select your gender</option>
            <option value="male" className="bg-neutral-900">Male</option>
            <option value="female" className="bg-neutral-900">Female</option>
            <option value="other" className="bg-neutral-900">Other</option>
            <option value="prefer_not_to_say" className="bg-neutral-900">Prefer not to say</option>
          </select>
        </LabelInputContainer>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed mt-6"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <IconLoader2 className="w-5 h-5 animate-spin" />
                Setting up your profile...
              </>
            ) : (
              <>
                Complete Profile
                <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-8 h-1 rounded-full bg-emerald-500" />
          <div className="w-8 h-1 rounded-full bg-emerald-500" />
          <div className="w-8 h-1 rounded-full bg-emerald-500/40" />
        </div>
        <p className="text-center text-neutral-500 text-xs">Step 2 of 3 - Profile Setup</p>
      </form>
    </motion.div>
  );
}