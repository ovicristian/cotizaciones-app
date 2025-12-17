import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Save, Building2 } from 'lucide-react'

export default function ConfiguracionEmpresa() {
  const [config, setConfig] = useState({
    nombre: '',
    nit: '',
    vendedor: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    telefono: '',
    email: '',
    banco_nombre: '',
    banco_cuenta: '',
    banco_swift: '',
    banco_aba: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [configId, setConfigId] = useState(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setConfig(data)
      setConfigId(data.id)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (configId) {
        // Actualizar existente
        const { error } = await supabase
          .from('empresa_config')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('id', configId)

        if (error) throw error
      } else {
        // Crear nueva
        const { data, error } = await supabase
          .from('empresa_config')
          .insert([{
            ...config,
            user_id: user.id
          }])
          .select()
          .single()

        if (error) throw error
        setConfigId(data.id)
      }

      setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 size={32} className="text-blue-900" />
        <h1 className="text-3xl font-bold text-gray-800">Configuración de Empresa</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Básica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={config.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIT / NIF / VAT
                </label>
                <input
                  type="text"
                  name="nit"
                  value={config.nit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Vendedor
                </label>
                <input
                  type="text"
                  name="vendedor"
                  value={config.vendedor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={config.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Dirección</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={config.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={config.ciudad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  name="pais"
                  value={config.pais}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={config.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Información Bancaria */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Datos Banco / Bank Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Banco
                </label>
                <input
                  type="text"
                  name="banco_nombre"
                  value={config.banco_nombre || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  name="banco_cuenta"
                  value={config.banco_cuenta || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código SWIFT
                </label>
                <input
                  type="text"
                  name="banco_swift"
                  value={config.banco_swift || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código ABA / Routing
                </label>
                <input
                  type="text"
                  name="banco_aba"
                  value={config.banco_aba || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Mensaje */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Botón */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
