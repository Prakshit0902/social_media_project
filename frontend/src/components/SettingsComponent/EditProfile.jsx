import React, {useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconUser, IconAt, IconNotebook, IconDeviceFloppy, IconCamera, IconGenderMale, IconGenderFemale, IconCake } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAccountDetails} from '../../store/slices/userSlice'; // Assuming these thunks exist

export const EditProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth); // Assuming logged-in user is in auth slice

  const [formData, setFormData] = useState({
    profilePicture: '',
    fullname: '',
    email: '',
    bio: '',
    gender: '',
    dob: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        profilePicture: user.profilePicture || '',
        fullname: user.fullname || '',
        email: user.email || '',
        bio: user.bio || '',
        gender: user.gender || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '', // Format for date input
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    // This is a simplified handler. In a real app, you would
    // create a preview URL and prepare the file for upload.
    const file = e.target.files[0];
    if (file) {
      // Assuming you have a thunk for this
      // dispatch(updateUserProfilePicture(file));
      console.log("File selected for profile picture:", file.name);
      // For UI preview:
      setFormData(prev => ({ ...prev, profilePicture: URL.createObjectURL(file) }));
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // --- CONTROLLER MAPPING ---
      // 1. `updateAccountDetails` for fullname & email
      await dispatch(updateAccountDetails(formData)).unwrap();
      // In a real app, you'd show a success toast here
      console.log('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show an error toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="backdrop-blur-2xl bg-black/30 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload - uses `updateUserProfilePicture` */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover bg-black/20"
                />
                <label htmlFor="profilePictureInput" className="absolute -bottom-1 -right-1 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <IconCamera size={18} className="text-black"/>
                </label>
                <input id="profilePictureInput" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{user?.username}</h3>
                <p className="text-sm text-white/60">Update your profile picture.</p>
              </div>
            </div>

            {/* Form Fields - uses `updateAccountDetails` & `updateBio` */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <IconUser className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20} />
                <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="relative">
                <IconAt className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20} />
                <input type="text" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
            </div>
            
            <div className="relative">
              <IconNotebook className="absolute top-4 left-3 text-white/40" size={20} />
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Your Bio" rows="4" className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none">
              </textarea>
            </div>

            {/* Personal Details - uses logic from `registerBasicUserDetails` */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <IconCake className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20} />
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white/80 placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="relative">
                 {formData.gender === 'female' ? <IconGenderFemale className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20}/> : <IconGenderMale className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" size={20}/> }
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white/80 placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none">
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={isSaving || loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <IconDeviceFloppy size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};