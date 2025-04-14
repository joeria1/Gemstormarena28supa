
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { Toaster } from 'sonner';
import SoundIntegration from './components/SoundIntegration';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <SoundIntegration />
      <AppRoutes />
    </Router>
  );
}

export default App;
