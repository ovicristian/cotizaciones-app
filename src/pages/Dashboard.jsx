import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, FileText, Package } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalCotizaciones: 0,
    totalReferencias: 0,
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Obtener total de clientes
      const { count: clientesCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })

      // Obtener total de cotizaciones
      const { count: cotizacionesCount } = await supabase
        .from('cotizaciones')
        .select('*', { count: 'exact', head: true })

      // Obtener total de referencias
      const { count: referenciasCount } = await supabase
        .from('referencias')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalClientes: clientesCount || 0,
        totalCotizaciones: cotizacionesCount || 0,
        totalReferencias: referenciasCount || 0,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Clientes</h3>
            <Users className="text-blue-900" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {stats.loading ? '...' : stats.totalClientes}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Cotizaciones</h3>
            <FileText className="text-blue-900" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {stats.loading ? '...' : stats.totalCotizaciones}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Referencias</h3>
            <Package className="text-blue-900" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {stats.loading ? '...' : stats.totalReferencias}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bienvenido al Sistema de Cotizaciones</h2>
        <p className="text-gray-600">
          Usa el menú lateral para navegar entre las diferentes secciones: Clientes, Cotizaciones y Referencias.
        </p>
      </div>
    </div>
  )
}
