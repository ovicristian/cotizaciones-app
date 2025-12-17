import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Edit, Trash2, Upload } from 'lucide-react'
import ImportCSV from '../components/referencias/ImportCSV'
import EditReferencia from '../components/referencias/EditReferencia'

export default function Referencias() {
  const [referencias, setReferencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingReferencia, setEditingReferencia] = useState(null)

  useEffect(() => {
    fetchReferencias()
  }, [])

  const fetchReferencias = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('referencias')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error fetching referencias:', error)
    } else {
      setReferencias(data || [])
    }
    setLoading(false)
  }

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : referencias.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay referencias registradas. Haz clic en "Nueva Referencia" para agregar una o importa un archivo CSV.
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
              {referencias.map((referencia) => (
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
