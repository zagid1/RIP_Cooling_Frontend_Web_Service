// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux'; // <-- Импорт
import { store } from './store'; // <-- Импорт

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}> {/* <-- Оборачиваем App */}
      <App />
    </Provider>
  </React.StrictMode>,
);