import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@components/Sidebar';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { disableDemo, clearDemoData } from '@store/slices/demoSlice';
import { join } from '@moondreamsdev/dreamer-ui/utils';

function Layout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);

  const handleExitDemo = async () => {
    await dispatch(clearDemoData());
    dispatch(disableDemo());
    navigate('/auth');
  };

  return (
    <div className={join('page transition-colors duration-200 flex flex-col', isDemoActive && 'pt-10')}>
      {isDemoActive && (
        <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-amber-500 dark:bg-amber-600 flex items-center justify-between px-4">
          <span className="text-sm font-medium text-white">
            🎭 Demo Mode — changes won't be saved
          </span>
          <button
            onClick={handleExitDemo}
            className="text-sm font-semibold text-white underline underline-offset-2 hover:no-underline transition-all"
          >
            Exit Demo
          </button>
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
