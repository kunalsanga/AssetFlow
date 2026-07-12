
import { NavLink } from 'react-router-dom';
import { cn } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Organization setup', path: '/organization', roles: ['admin'] },
    { name: 'Assets', path: '/assets' },
    { name: 'Allocation & Transfer', path: '/allocation' },
    { name: 'Resource Booking', path: '/booking' },
    { name: 'Maintenance', path: '/maintenance' },
    { name: 'Audit', path: '/audit' },
    { name: 'Reports', path: '/reports' },
    { name: 'Notifications', path: '/notifications' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-background min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          // RBAC logic for sidebar
          if (item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-surface text-primary border border-primary'
                    : 'text-muted hover:text-text hover:bg-surface'
                )
              }
            >
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
