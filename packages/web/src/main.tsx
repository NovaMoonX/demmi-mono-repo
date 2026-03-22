import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { store } from '@store/index';
import { initializeDemoSession } from '@store/slices/demoSlice';
import './index.css';

store.dispatch(initializeDemoSession());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
