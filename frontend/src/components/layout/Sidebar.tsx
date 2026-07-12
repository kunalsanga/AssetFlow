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
  { name: 'Organization Setup', path: '/organization', icon: Building2, roles: ['super_admin', 'admin'] },
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
    <aside className="w-64 bg-[#2e1065] border-r border-[#4c1d95] h-screen flex-col hidden md:flex sticky top-0 z-10 text-white shadow-xl">
      <div className="h-20 px-6 border-b border-[#4c1d95] flex items-center shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#2e1065] flex items-center justify-center shrink-0 shadow-sm">
            AF
          </div>
          <span className="truncate tracking-tight">AssetFlow</span>
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
        {navItems.map((item) => {
          if (item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-white text-[#2e1065] font-semibold shadow-md translate-x-1" 
                  : "text-[#c4b5fd] hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon size={20} className={cn("shrink-0")} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-[#4c1d95] text-xs text-[#c4b5fd] shrink-0 text-center">
        &copy; 2026 AssetFlow
      </div>
    </aside>
  );
};
