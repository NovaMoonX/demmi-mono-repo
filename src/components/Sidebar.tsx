import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Button } from '@moondreamsdev/dreamer-ui/components';
import { Toggle } from '@moondreamsdev/dreamer-ui/components';
import { useTheme } from '@moondreamsdev/dreamer-ui/hooks';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { DotsVertical } from '@moondreamsdev/dreamer-ui/symbols';
import { useAuth } from '@hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { disableDemo, clearDemoData } from '@store/slices/demoSlice';

type Tab = {
  id: string;
  label: string;
  emoji: string;
  path: string;
};

const tabs: Tab[] = [
  { id: 'chat', label: 'Chat', emoji: '💬', path: '/' },
  { id: 'meals', label: 'Meals', emoji: '🍽️', path: '/meals' },
  { id: 'ingredients', label: 'Ingredients', emoji: '🍎', path: '/ingredients' },
  { id: 'calendar', label: 'Calendar', emoji: '📅', path: '/calendar' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logOut } = useAuth();
  const dispatch = useAppDispatch();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleSignOut = async () => {
    await logOut();
    handleClose();
  };

  const handleExitDemo = async () => {
    await dispatch(clearDemoData());
    dispatch(disableDemo());
    handleClose();
    navigate('/auth');
  };

  const handleClose = () => {
    setIsMobileOpen(false);
    setIsAnimating(true);
    // Wait for the closing animation (300ms) to complete before showing the button
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile menu button - only show when menu is closed and not animating */}
      {!isMobileOpen && !isAnimating && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-1.5 rounded-lg bg-card border border-border md:hidden"
          aria-label="Toggle menu"
        >
          <DotsVertical className="size-5 text-foreground" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={join(
          'fixed left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300 flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          isDemoActive ? 'top-10' : 'top-0'
        )}
      >
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <img
              src={'/logo.svg'}
              alt="Demmi logo"
              className="h-9 w-9"
            />
            <div>
              <p className="text-lg font-semibold text-foreground">Demmi</p>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <nav className="flex-1 p-4 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
            Navigation
          </h2>
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={join(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                )}
              >
                <span className="text-xl">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section: Theme toggle and Account */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Theme toggle */}
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-foreground/80">Dark Mode</span>
            <Toggle
              checked={resolvedTheme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>

          {/* Account section */}
          <div className="px-3 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar
                preset="astronaut"
                size="sm"
                alt="User account"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground" title={isDemoActive ? 'Demo Mode' : (user?.email || '')}>
                  {isDemoActive ? 'Demo Mode' : user?.email}
                </p>
              </div>
            </div>

            {isDemoActive ? (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleExitDemo}
              >
                Exit Demo
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
