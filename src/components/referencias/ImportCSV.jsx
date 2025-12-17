import { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../lib/supabaseClient'
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react'

export default function ImportCSV({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setSuccess(null)

    // Parsear CSV para preview
    Papa.parse(selectedFile, {
      delimiter: ';',
      header: true,
      preview: 5,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data)
      },
      error: (error) => {
        setError('Error al leer el archivo: ' + error.message)
      }
    })
  }

  const handleImport = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)

    Papa.parse(file, {
      delimiter: ';',
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Obtener usuario actual
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            setError('Debes estar autenticado para importar')
            setLoading(false)
            return
          }

          // Transformar datos del CSV a formato de BD
          const referencias = results.data.map(row => {
            // Convertir comas a puntos en números decimales
            const convertirNumero = (valor) => {
              if (!valor) return null
              return parseFloat(valor.toString().replace(',', '.'))
            }

            return {
              nombre: row.REFERENCIA || row.referencia,
              descripcion: row.DESCRIPCION || row.descripcion,
              familia: row.familia || row.FAMILIA || null,
              precio_cop: convertirNumero(row.precio),
              peso_unitario: convertirNumero(row['PESO UNI']),
              cantidad_minima_caja: convertirNumero(row['CAN EMPAQUE']) || 
                                    convertirNumero(row.CANTIDAD) || null,
              alto: convertirNumero(row.ALTO),
              ancho: convertirNumero(row.ANCHO),
              largo: convertirNumero(row.LARGO),
              user_id: user.id
            }
          }).filter(ref => ref.nombre) // Filtrar filas sin nombre

          // Insertar en Supabase
          const { data, error: insertError } = await supabase
            .from('referencias')
            .insert(referencias)
            .select()

          if (insertError) {
            throw insertError
          }

          setSuccess(`✅ ${data.length} referencias importadas exitosamente`)
          setLoading(false)
          
          // Cerrar modal después de 2 segundos
          setTimeout(() => {
            onSuccess?.()
            onClose()
          }, 2000)

        } catch (err) {
          setError('Error al importar: ' + err.message)
          setLoading(false)
        }
      },
      error: (error) => {
        setError('Error al procesar CSV: ' + error.message)
        setLoading(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Importar Referencias desde CSV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Formato del CSV:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Separador: <code className="bg-blue-100 px-1 rounded">;</code> (punto y coma)</li>
              <li>• Columnas: REFERENCIA;DESCRIPCION;familia;precio;PESO UNI;CAN EMPAQUE;ALTO;ANCHO;LARGO</li>
              <li>• Decimales: Usar coma (,) o punto (.)</li>
              <li>• Precios en COP (pesos colombianos)</li>
            </ul>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Vista Previa (primeras 5 filas):
              </h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Referencia
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Descripción
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Familia
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Precio COP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.REFERENCIA || row.referencia}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {(row.DESCRIPCION || row.descripcion)?.substring(0, 50)}...
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.familia || row.FAMILIA}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          ${row.precio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload size={18} />
            {loading ? 'Importando...' : 'Importar Referencias'}
          </button>
        </div>
      </div>
    </div>
  )
}
