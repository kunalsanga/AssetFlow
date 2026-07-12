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
    <aside className="w-64 bg-[#1565A8] border-r border-[#0f4d85] h-screen flex-col hidden md:flex sticky top-0 z-10 text-white shadow-lg">
      {/* Logo header */}
      <div className="h-20 px-6 border-b border-white/10 flex items-center shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#39C2D7] text-white flex items-center justify-center shrink-0 shadow-md font-black text-sm">
            AF
          </div>
          <span className="truncate tracking-tight text-white font-bold">AssetFlow</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-[#2FA7D8] text-white font-semibold shadow-md"
                  : "text-blue-100 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-5 border-t border-white/10 text-xs text-blue-200 shrink-0 text-center">
        &copy; 2026 AssetFlow
      </div>
    </aside>
  );
};
