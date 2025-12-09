import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { startMockingSocial } from '@sidekick-monorepo/internship-backend';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'production') {
    await startMockingSocial('/test-fe');
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});