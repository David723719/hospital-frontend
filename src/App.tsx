import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PacientesPage } from './pages/PacientesPage';
import { CamasPage } from './pages/CamasPage';
import { AdmisionesPage } from './pages/AdmisionesPage';
import { TratamientosPage } from './pages/TratamientosPage';
import { ReportesPage } from './pages/ReportesPage';
import { IntegracionesPage } from './pages/IntegracionesPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/camas" element={<CamasPage />} />
          <Route path="/admisiones" element={<AdmisionesPage />} />
          <Route path="/tratamientos" element={<TratamientosPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/integraciones" element={<IntegracionesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;