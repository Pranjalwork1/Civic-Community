import React from 'react';
import ReactDOM from 'react-dom/client';
import { CivicProvider } from './context/CivicContext';
import { MainAppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CivicProvider>
      <MainAppContent />
    </CivicProvider>
  </React.StrictMode>
);
