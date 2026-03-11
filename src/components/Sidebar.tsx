import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Button } from '@moondreamsdev/dreamer-ui/components';
import { Toggle } from '@moondreamsdev/dreamer-ui/components';
import { useTheme } from '@moondreamsdev/dreamer-ui/hooks';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { DotsVertical } from '@moondreamsdev/dreamer-ui/symbols';
import { useAuth } from '@hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { endDemoSession } from '@store/slices/demoSlice';
import { Link } from 'react-router-dom';

type Tab = {
  id: string;
  label: string;
  emoji: string;
  path: string;
};

const tabs: Tab[] = [
  { id: 'chat', label: 'Chat', emoji: '💬', path: '/chat' },
  { id: 'meals', label: 'Meals', emoji: '🍽️', path: '/meals' },
  {
    id: 'ingredients',
    label: 'Ingredients',
    emoji: '🍎',
    path: '/ingredients',
  },
  { id: 'calendar', label: 'Calendar', emoji: '📅', path: '/calendar' },
  { id: 'shopping-list', label: 'Shopping List', emoji: '🛒', path: '/shopping-list' },
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
    await dispatch(endDemoSession());
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
          className={join(
            'bg-card border-border fixed left-4 z-50 rounded-lg border p-1.5 md:hidden',
            isDemoActive ? 'top-14' : 'top-4',
          )}
          aria-label='Toggle menu'
        >
          <DotsVertical className='text-foreground size-5' />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden'
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={join(
          'bg-card border-border fixed left-0 z-40 flex w-64 flex-col border-r transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          isDemoActive ? 'top-10 h-[calc(100%-40px)]' : 'top-0 h-full',
        )}
      >
        <div className='px-4 pt-5 pb-2'>
          <Link to='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
            <img src={'/logo.svg'} alt='Demmi logo' className='h-9 w-9' />
            <div>
              <p className='text-foreground text-lg font-semibold'>Demmi</p>
            </div>
          </Link>
        </div>

        {/* Tabs section */}
        <nav className='flex-1 space-y-2 p-4'>
          <h2 className='text-muted-foreground mb-4 px-3 text-xs font-semibold tracking-wider uppercase'>
            Navigation
          </h2>
          {tabs.map((tab) => {
            const isCurrentTab = currentPath === tab.path;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={join(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isCurrentTab
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                )}
              >
                <span className='text-xl'>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section: Theme toggle and Account */}
        <div className='border-border space-y-4 border-t p-4'>
          {/* Theme toggle */}
          <div className='flex items-center justify-between px-3'>
            <span className='text-foreground/80 text-sm'>Dark Mode</span>
            <Toggle
              checked={resolvedTheme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label='Toggle dark mode'
            />
          </div>

          {/* Account section */}
          <div className='space-y-3 px-3'>
            <div className='flex items-center gap-3'>
              <Avatar preset='astronaut' size='sm' alt='User account' />
              <div className='min-w-0 flex-1'>
                <p
                  className='text-foreground truncate text-sm font-medium'
                  title={isDemoActive ? 'Demo Mode' : user?.email || ''}
                >
                  {isDemoActive ? 'Demo Mode' : user?.email}
                </p>
              </div>
            </div>

            {isDemoActive ? (
              <Button
                variant='secondary'
                size='sm'
                className='w-full'
                onClick={handleExitDemo}
              >
                Exit Demo
              </Button>
            ) : (
              <Button
                variant='secondary'
                size='sm'
                className='w-full'
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
