
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Laptop, 
  ArrowRightLeft, 
  CalendarClock, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Organization Setup', path: '/organization', icon: Building2, roles: ['admin'] },
  { name: 'Assets', path: '/assets', icon: Laptop },
  { name: 'Allocation & Transfer', path: '/allocation', icon: ArrowRightLeft },
  { name: 'Resource Booking', path: '/bookings', icon: CalendarClock },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Audit', path: '/audit', icon: ClipboardCheck },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex-col hidden md:flex sticky top-0 z-10">
      <div className="h-16 px-6 border-b border-border flex items-center shrink-0">
        <h1 className="text-xl font-bold text-text flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
            AF
          </div>
          <span className="truncate">AssetFlow</span>
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          if (item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted hover:text-text hover:bg-background/50"
              )}
            >
              <item.icon size={18} className={cn("shrink-0")} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border text-xs text-muted shrink-0 text-center">
        &copy; 2026 AssetFlow
      </div>
    </aside>
  );
};
