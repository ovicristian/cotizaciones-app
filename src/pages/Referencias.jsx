import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Edit, Trash2, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import ImportCSV from '../components/referencias/ImportCSV'
import EditReferencia from '../components/referencias/EditReferencia'

export default function Referencias() {
  const [referencias, setReferencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingReferencia, setEditingReferencia] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchReferencias()
  }, [])

  const fetchReferencias = async () => {
    setLoading(true)
    
    try {
      // Cargar todas las referencias usando paginación
      let allReferencias = []
      let from = 0
      const pageSize = 1000 // Máximo permitido por Supabase
      let hasMore = true

      while (hasMore) {
        const { data, error, count } = await supabase
          .from('referencias')
          .select('*', { count: 'exact' })
          .order('nombre', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) {
          console.error('Error fetching referencias:', error)
          hasMore = false
        } else {
          allReferencias = [...allReferencias, ...(data || [])]
          console.log(`Página cargada: ${data?.length || 0} referencias. Total acumulado: ${allReferencias.length}`)
          
          // Si obtuvimos menos registros que el tamaño de página, ya no hay más
          hasMore = data && data.length === pageSize
          from += pageSize
        }
      }

      setReferencias(allReferencias)
      console.log(`✅ Total de referencias cargadas: ${allReferencias.length}`)
    } catch (error) {
      console.error('Error general al cargar referencias:', error)
    }
    
    setLoading(false)
  }

  const filteredReferencias = referencias.filter(ref => {
    const term = searchTerm.toLowerCase()
    return (
      ref.nombre?.toLowerCase().includes(term) ||
      ref.descripcion?.toLowerCase().includes(term) ||
      ref.familia?.toLowerCase().includes(term) ||
      ref.codigo?.toLowerCase().includes(term) ||
      ref.codigo_arancelario?.toLowerCase().includes(term)
    )
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredReferencias.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReferencias = filteredReferencias.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Referencias</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Upload size={20} />
            Importar CSV
          </button>
          <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2">
            <Plus size={20} />
            Nueva Referencia
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y contador */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción, familia, código o HTS Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {!loading && (
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredReferencias.length)} de {filteredReferencias.length} referencias
            {searchTerm && ` (filtradas de ${referencias.length} totales)`}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : referencias.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay referencias registradas. Haz clic en "Nueva Referencia" para agregar una o importa un archivo CSV.
          </div>
        ) : filteredReferencias.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron referencias que coincidan con la búsqueda.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Familia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HTS Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peso (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio COP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cant. Mín/Caja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentReferencias.map((referencia) => (
                <tr key={referencia.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {referencia.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {referencia.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referencia.familia}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referencia.codigo_arancelario || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referencia.peso_unitario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${referencia.precio_cop?.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referencia.cantidad_minima_caja}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingReferencia(referencia)}
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
        
        {/* Controles de paginación */}
        {!loading && filteredReferencias.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {itemsPerPage} referencias por página
            </div>
          </div>
        )}
      </div>

      {/* Modal de Importación */}
      {showImportModal && (
        <ImportCSV
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false)
            fetchReferencias()
          }}
        />
      )}

      {/* Modal de Edición */}
      {editingReferencia && (
        <EditReferencia
          referencia={editingReferencia}
          onClose={() => setEditingReferencia(null)}
          onSuccess={() => {
            setEditingReferencia(null)
            fetchReferencias()
          }}
        />
      )}
    </div>
  )
}
