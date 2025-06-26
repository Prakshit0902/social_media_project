// src/layouts/SettingsLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconUserCircle, IconLock, IconShieldCheck } from '@tabler/icons-react';

const navLinks = [
  {
    path: '/dashboard/settings/profile',
    label: 'Edit Profile',
    icon: IconUserCircle,
  },
  {
    path: '/dashboard/settings/account',
    label: 'Account & Security',
    icon: IconLock,
  },
  // You can easily add more links here in the future
  // { path: '/dashboard/settings/notifications', label: 'Notifications', icon: IconBell },
];

export const SettingsLayout = () => {
  const location = useLocation();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col md:flex-row gap-8"
      >
        {/* Sidebar Navigation */}
        <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0">
          <div className="p-4 backdrop-blur-2xl bg-black/30 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 px-2">Settings</h2>
            <nav className="flex flex-row md:flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Area for Child Routes */}
        <main className="flex-1">
          {/* Outlet will render either <EditProfile /> or <Settings /> */}
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
};