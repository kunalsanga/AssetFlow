import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-[#A9C9DE] flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-text hover:bg-secondary rounded-xl transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center relative w-64 md:w-80">
          <Search size={16} className="absolute left-3.5 text-muted/70" />
          <input
            type="text"
            placeholder="Search assets, users, or resources..."
            className="w-full bg-secondary border border-border rounded-full py-2 pl-10 pr-4 text-sm text-text placeholder-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-primary hover:bg-secondary rounded-full transition-colors">
          <Bell size={20} className="text-[#17324D]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>

        <div className="h-7 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3 group cursor-pointer relative">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-text leading-tight">{user?.full_name || 'User'}</span>
            <span className="text-xs text-muted font-medium capitalize leading-tight mt-0.5">{user?.role || 'Employee'}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#2389C9] border-2 border-[#A9C9DE] flex items-center justify-center text-white group-hover:bg-deep-blue transition-colors shadow-sm">
            <User size={18} />
          </div>
          <div className="absolute right-0 top-12 w-48 bg-surface border border-border shadow-xl rounded-xl overflow-hidden hidden group-hover:block z-50">
            <div className="p-2 space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-text hover:bg-secondary hover:text-primary rounded-lg transition-colors">Profile Settings</button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm font-medium text-error hover:bg-coral-bg rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
