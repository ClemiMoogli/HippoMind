/**
 * Renderer entry point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './i18n';
import './styles/index.css';

// Load Tauri API if running in Tauri
import '@shared/tauri-api';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
