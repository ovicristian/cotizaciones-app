import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Edit, Trash2, FileText, Search, FileDown } from 'lucide-react'
import CreateCotizacion from '../components/cotizaciones/CreateCotizacion'
import EditCotizacion from '../components/cotizaciones/EditCotizacion'
import { generateProformaPDF } from '../utils/pdfGenerator'
import { generateProformaWord } from '../utils/wordGenerator'
import { generateProformaExcel } from '../utils/excelGenerator'

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCotizacion, setEditingCotizacion] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleGenerateWord = async (cotizacionId) => {
    const result = await generateProformaWord(cotizacionId)
    if (!result.success) {
      alert('Error al generar documento Word: ' + result.error)
    }
  }

  const handleGenerateExcel = async (cotizacionId) => {
    const result = await generateProformaExcel(cotizacionId)
    if (!result.success) {
      alert('Error al generar archivo Excel: ' + result.error)
    }
  }

  const handleDelete = async (cotizacion) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la cotización ${cotizacion.numero_cotizacion}?\n\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmDelete) return

    try {
      // Primero eliminar las referencias asociadas
      const { error: refsError } = await supabase
        .from('cotizacion_referencias')
        .delete()
        .eq('cotizacion_id', cotizacion.id)

      if (refsError) throw refsError

      // Luego eliminar la cotización
      const { error: cotizacionError } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', cotizacion.id)

      if (cotizacionError) throw cotizacionError

      // Actualizar la lista
      await fetchCotizaciones()
      alert('Cotización eliminada correctamente')
    } catch (error) {
      console.error('Error al eliminar cotización:', error)
      alert('Error al eliminar cotización: ' + error.message)
    }
  }

  const filteredCotizaciones = cotizaciones.filter(cot => {
    const term = searchTerm.toLowerCase()
    return (
      cot.numero_cotizacion?.toLowerCase().includes(term) ||
      cot.clientes?.nombre?.toLowerCase().includes(term) ||
      cot.contacto_nombre?.toLowerCase().includes(term) ||
      cot.modo_transporte?.toLowerCase().includes(term) ||
      cot.incoterm?.toLowerCase().includes(term)
    )
  })

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

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por número, cliente, contacto, modo de transporte o incoterm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : cotizaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cotizaciones registradas. Haz clic en "Nueva Cotización" para crear una.
          </div>
        ) : filteredCotizaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron cotizaciones que coincidan con la búsqueda.
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
              {filteredCotizaciones.map((cotizacion) => (
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
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleGeneratePDF(cotizacion.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded transition-colors" 
                      >
                        <FileText size={16} />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                      <button 
                        onClick={() => handleGenerateWord(cotizacion.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors" 
                      >
                        <FileDown size={16} />
                        <span className="text-sm font-medium">Word</span>
                      </button>
                      <button 
                        onClick={() => handleGenerateExcel(cotizacion.id)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-900 hover:bg-green-50 px-3 py-1.5 rounded transition-colors" 
                      >
                        <FileDown size={16} />
                        <span className="text-sm font-medium">Excel</span>
                      </button>
                      <button 
                        onClick={() => setEditingCotizacion(cotizacion)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded transition-colors"
                      >
                        <Edit size={16} />
                        <span className="text-sm font-medium">Editar</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(cotizacion)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm font-medium">Eliminar</span>
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
