import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconLock, IconEye, IconShieldCheck, IconLogout, IconAlertTriangle } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, makeProfilePrivateOrPublic } from '../../store/slices/userSlice';

// A reusable toggle switch component
const ToggleSwitch = ({ enabled, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-white/80 text-sm">{label}</span>
    <div className="relative">
      <div className={`block w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-white/10'}`}></div>
      <motion.div
        className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        onClick={onChange}
      />
    </div>
  </label>
);

export const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const {loading : userSliceLoading} = useSelector((state) => state.user)

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!"); // Replace with a better notification
      return;
    }
    setIsUpdatingPassword(true);
    try {
      // --- CONTROLLER MAPPING ---
      // Uses `changePassword`
      await dispatch(changePassword({ oldPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })).unwrap();
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePrivacyToggle = async () => {
    setIsTogglingPrivacy(true);
    try {
      // --- CONTROLLER MAPPING ---
      // Uses `makeProfilePrivateOrPublic`
      await dispatch(makeProfilePrivateOrPublic(user?.isPrivate)).unwrap();
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    } finally {
      setIsTogglingPrivacy(false);
    }
  }
  
  const handleLogout = () => {
      // --- CONTROLLER MAPPING ---
      // Uses `logoutUser`
      dispatch(logoutUser());
      // Navigating to the login page will likely happen within the thunk or a root-level useEffect hook listening to auth state
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold text-white">Settings</h1>

        {/* --- Change Password Card - uses `changePassword` --- */}
        <div className="backdrop-blur-xl bg-black/30 p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><IconLock size={20}/> Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))} placeholder="Current Password" required className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
            <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))} placeholder="New Password" required className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
            <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))} placeholder="Confirm New Password" required className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
            <div className="flex justify-end">
              <motion.button type="submit" whileTap={{ scale: 0.95 }} disabled={isUpdatingPassword} className="px-5 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all">
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </motion.button>
            </div>
          </form>
        </div>

        {/* --- Privacy Settings Card - uses `makeProfilePrivateOrPublic` & `makeProfileVerified` --- */}
        <div className="backdrop-blur-xl bg-black/30 p-6 rounded-2xl border border-white/10 space-y-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2"><IconEye size={20}/> Privacy</h3>
            <div className="p-4 bg-black/20 rounded-lg">
                <ToggleSwitch 
                  label="Private Account" 
                  enabled={user?.isPrivate} 
                  onChange={isTogglingPrivacy ? null : handlePrivacyToggle} 
                  
                />
                <p className="text-xs text-white/50 mt-2">When your account is private, only people you approve can see your photos, videos, and profile.</p>
            </div>
            {/* `makeProfileVerified` is usually an admin task, so we show it as a disabled status */}
            <div className="p-4 bg-black/20 rounded-lg flex items-center justify-between opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                    <IconShieldCheck size={24} className={user?.isVerified ? 'text-blue-400' : 'text-white/40'}/>
                    <div>
                        <h4 className="font-semibold text-white">Verified Account</h4>
                        <p className="text-xs text-white/50">Verification is handled by administrators.</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${user?.isVerified ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-white/60'}`}>
                    {user?.isVerified ? 'Active' : 'Not Verified'}
                </span>
            </div>
        </div>

        {/* --- Danger Zone - uses `logoutUser` --- */}
        <div className="backdrop-blur-xl bg-black/30 p-6 rounded-2xl border border-red-500/30">
            <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-4"><IconAlertTriangle size={20}/> Danger Zone</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-white">Log Out</h4>
                        <p className="text-xs text-white/50">You will be returned to the login screen.</p>
                    </div>
                    <motion.button onClick={handleLogout} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors">
                        <IconLogout size={16} />
                        Log Out
                    </motion.button>
                </div>
                 <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                        <h4 className="font-medium text-red-400">Deactivate Account</h4>
                        <p className="text-xs text-white/50">This action is permanent and cannot be undone.</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 transition-colors">
                        Deactivate
                    </motion.button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};