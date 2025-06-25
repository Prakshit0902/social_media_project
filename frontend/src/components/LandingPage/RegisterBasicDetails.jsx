"use client";
import React, { useState, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// We'll assume you create this new action in your authSlice
import { clearTransition, registerBasicUserDetails } from "../../store/slices/authSlice"; 
import { BottomGradient, LabelInputContainer } from "./SignUpForm"; // Re-using from SignUpForm
import { IconUserCircle, IconUpload } from "@tabler/icons-react";

export function RegisterBasicDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error,user } = useSelector((state) => state.auth);


  // State for form fields
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [profilePicture, setProfilePicture] = useState(null); // To hold the file object
  const [previewUrl, setPreviewUrl] = useState(null); // To hold the image preview URL

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a temporary URL for preview
    }
  };

  const handleProfileClick = () => {
    // Trigger the hidden file input
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
      
      // Navigate and then clear transition flag
      navigate('/dashboard', { replace: true });
      
      // Clear the transition flag after a brief delay
      setTimeout(() => {
        dispatch(clearTransition());
      }, 500);

    } catch (err) {
      console.error('Failed to update user details:', err);
    }
  }

  return (
    <div className="shadow-input w-full h-full rounded-none bg-white/10 backdrop-blur-sm p-4 md:rounded-2xl dark:bg-black/10">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
        Complete Your Profile
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Let's get you set up with some basic information.
      </p>

      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error.message || error}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Profile Picture Input */}
        <div className="flex flex-col items-center mb-8">
            <Label className="mb-2">Profile Picture (Optional)</Label>
            <div 
                className="relative w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={handleProfileClick}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                    <IconUserCircle className="h-16 w-16 text-neutral-500" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <IconUpload className="h-8 w-8 text-white" />
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" // Hide the default file input
                accept="image/*"
            />
        </div>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            placeholder="your_unique_handle" 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input 
            id="dob" 
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-8">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className={cn(
              `flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm file:border-0 file:bg-transparent 
               file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
               focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
               disabled:cursor-not-allowed disabled:opacity-50
               dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
               group-hover/input:shadow-none transition duration-400`
            )}
          >
            <option value="" disabled>Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Complete Profile →'}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}