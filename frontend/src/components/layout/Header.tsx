import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-muted hover:text-text hover:bg-background rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Search */}
        <div className="hidden sm:flex items-center relative w-64 md:w-96">
          <Search size={18} className="absolute left-4 text-muted/70" />
          <input 
            type="text"
            placeholder="Search assets, users, or resources..."
            className="w-full bg-background border border-border rounded-full py-2.5 pl-12 pr-4 text-sm text-text placeholder-muted/70 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2.5 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
        </button>
        
        <div className="h-8 w-px bg-border mx-1"></div>
        
        <div className="flex items-center gap-3 group cursor-pointer relative">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-text leading-tight">{user?.full_name || 'User'}</span>
            <span className="text-xs text-muted font-medium capitalize leading-tight mt-0.5">{user?.role || 'Employee'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shadow-sm">
            <User size={20} />
          </div>
          <div className="absolute right-0 top-14 w-48 bg-surface border border-border shadow-xl rounded-xl overflow-hidden hidden group-hover:block z-50">
            <div className="p-2 space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-text hover:bg-background hover:text-primary rounded-lg transition-colors">Profile Settings</button>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
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
