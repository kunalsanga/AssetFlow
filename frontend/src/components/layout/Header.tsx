import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-muted hover:text-text hover:bg-background rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Search */}
        <div className="hidden sm:flex items-center relative w-64 md:w-96">
          <Search size={18} className="absolute left-3 text-muted" />
          <input 
            type="text"
            placeholder="Search assets, users, or resources..."
            className="w-full bg-background border border-border rounded-full py-1.5 pl-10 pr-4 text-sm text-text placeholder-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-text hover:bg-background rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface"></span>
        </button>
        
        <div className="h-8 w-px bg-border mx-1"></div>
        
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-medium text-text leading-tight">{user?.full_name || 'User'}</span>
            <span className="text-xs text-muted capitalize leading-tight">{user?.role || 'Employee'}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors">
            <User size={18} />
          </div>
          <div className="absolute right-4 top-16 w-48 bg-surface border border-border shadow-lg rounded-md overflow-hidden hidden group-hover:block z-50">
            <div className="p-1">
              <button className="w-full text-left px-4 py-2 text-sm text-text hover:bg-background rounded-md transition-colors">Profile Settings</button>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-background rounded-md transition-colors"
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
