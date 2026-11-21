import { Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Dashboard from './pages/Dashboard';
import EspacePage from './pages/EspacePage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/espace/:id" element={<EspacePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
