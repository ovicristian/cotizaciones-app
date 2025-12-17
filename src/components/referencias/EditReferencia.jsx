import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Save } from 'lucide-react'

export default function EditReferencia({ referencia, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    familia: '',
    codigo_arancelario: '',
    precio_cop: '',
    peso_unitario: '',
    cantidad_minima_caja: '',
    alto: '',
    ancho: '',
    largo: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (referencia) {
      setFormData({
        nombre: referencia.nombre || '',
        descripcion: referencia.descripcion || '',
        familia: referencia.familia || '',
        codigo_arancelario: referencia.codigo_arancelario || '',
        precio_cop: referencia.precio_cop || '',
        peso_unitario: referencia.peso_unitario || '',
        cantidad_minima_caja: referencia.cantidad_minima_caja || '',
        alto: referencia.alto || '',
        ancho: referencia.ancho || '',
        largo: referencia.largo || ''
      })
    }
  }, [referencia])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('referencias')
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          familia: formData.familia,
          codigo_arancelario: formData.codigo_arancelario || null,
          precio_cop: parseFloat(formData.precio_cop) || null,
          peso_unitario: parseFloat(formData.peso_unitario) || null,
          cantidad_minima_caja: parseInt(formData.cantidad_minima_caja) || null,
          alto: parseFloat(formData.alto) || null,
          ancho: parseFloat(formData.ancho) || null,
          largo: parseFloat(formData.largo) || null
        })
        .eq('id', referencia.id)

      if (updateError) throw updateError

      onSuccess?.()
      onClose()
    } catch (err) {
      setError('Error al actualizar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Editar Referencia</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre/Referencia *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Familia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Familia
              </label>
              <input
                type="text"
                name="familia"
                value={formData.familia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Código Arancelario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posición Arancelaria / HTS Code
            </label>
            <input
              type="text"
              name="codigo_arancelario"
              value={formData.codigo_arancelario}
              onChange={handleChange}
              placeholder="Ej: 8481.80.99.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Precio COP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio COP
              </label>
              <input
                type="number"
                name="precio_cop"
                value={formData.precio_cop}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                name="peso_unitario"
                value={formData.peso_unitario}
                onChange={handleChange}
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cantidad mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cant. Mín/Caja
              </label>
              <input
                type="number"
                name="cantidad_minima_caja"
                value={formData.cantidad_minima_caja}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dimensiones */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alto (cm)
              </label>
              <input
                type="number"
                name="alto"
                value={formData.alto}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho (cm)
              </label>
              <input
                type="number"
                name="ancho"
                value={formData.ancho}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largo (cm)
              </label>
              <input
                type="number"
                name="largo"
                value={formData.largo}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
