
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full border border-primary flex items-center justify-center">
          <span className="text-primary font-bold text-xs">AF</span>
        </div>
        <h1 className="text-xl font-bold text-text">AssetFlow</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-sm text-muted">
              <span className="font-medium text-text">{user.full_name || user.email}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-surface border border-border text-xs">
                {user.role}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
