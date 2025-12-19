import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Edit, Trash2, Upload, Search } from 'lucide-react'
import ImportCSV from '../components/referencias/ImportCSV'
import EditReferencia from '../components/referencias/EditReferencia'

export default function Referencias() {
  const [referencias, setReferencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingReferencia, setEditingReferencia] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReferencias()
  }, [])

  const fetchReferencias = async () => {
    setLoading(true)
    // Supabase limita por defecto a 1000 registros. Usamos un límite alto.
    const { data, error, count } = await supabase
      .from('referencias')
      .select('*', { count: 'exact' })
      .order('nombre', { ascending: true })
      .limit(10000) // Límite alto para asegurar que se obtengan todas

    if (error) {
      console.error('Error fetching referencias:', error)
    } else {
      setReferencias(data || [])
      console.log(`Cargadas ${data?.length || 0} referencias de ${count} totales`)
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

      {/* Barra de búsqueda */}
      <div className="mb-4">
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
              {filteredReferencias.map((referencia) => (
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
