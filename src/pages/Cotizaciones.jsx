import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'
import CreateCotizacion from '../components/cotizaciones/CreateCotizacion'
import EditCotizacion from '../components/cotizaciones/EditCotizacion'
import { generateProformaPDF } from '../utils/pdfGenerator'

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCotizacion, setEditingCotizacion] = useState(null)

  useEffect(() => {
    fetchCotizaciones()
  }, [])

  const fetchCotizaciones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        clientes (nombre)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cotizaciones:', error)
    } else {
      setCotizaciones(data || [])
    }
    setLoading(false)
  }

  const handleGeneratePDF = async (cotizacionId) => {
    const result = await generateProformaPDF(cotizacionId)
    if (!result.success) {
      alert('Error al generar PDF: ' + result.error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Cotización
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : cotizaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cotizaciones registradas. Haz clic en "Nueva Cotización" para crear una.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Cotización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa de Cambio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vigencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cotizaciones.map((cotizacion) => (
                <tr key={cotizacion.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cotizacion.numero_cotizacion || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cotizacion.clientes?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cotizacion.tasa_cambio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cotizacion.vigencia ? new Date(cotizacion.vigencia).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cotizacion.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleGeneratePDF(cotizacion.id)}
                        className="text-green-600 hover:text-green-900" 
                        title="Ver PDF"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingCotizacion(cotizacion)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear Cotización */}
      {showCreateModal && (
        <CreateCotizacion
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchCotizaciones()
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Modal Editar Cotización */}
      {editingCotizacion && (
        <EditCotizacion
          cotizacion={editingCotizacion}
          onClose={() => setEditingCotizacion(null)}
          onSuccess={() => {
            fetchCotizaciones()
            setEditingCotizacion(null)
          }}
        />
      )}
    </div>
  )
}
