import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Cotizaciones from './pages/Cotizaciones'
import Referencias from './pages/Referencias'
import ConfiguracionEmpresa from './pages/ConfiguracionEmpresa'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="cotizaciones" element={<Cotizaciones />} />
          <Route path="referencias" element={<Referencias />} />
          <Route path="configuracion" element={<ConfiguracionEmpresa />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
