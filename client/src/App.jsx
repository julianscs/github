import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import CalendarPage from './pages/CalendarPage'
import FormacionesPage from './pages/FormacionesPage'
import FormadoresPage from './pages/FormadoresPage'
import ClientesPage from './pages/ClientesPage'
import CategoriasPage from './pages/CategoriasPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/calendario" replace />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="formaciones" element={<FormacionesPage />} />
        <Route path="formadores" element={<FormadoresPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
      </Route>
    </Routes>
  )
}
