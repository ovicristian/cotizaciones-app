import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import Select from 'react-select'

export default function EditCotizacion({ cotizacion, onClose, onSuccess }) {
  const [clientes, setClientes] = useState([])
  const [referencias, setReferencias] = useState([])
  const [formData, setFormData] = useState({
    numero_cotizacion: cotizacion.numero_cotizacion || '',
    cliente_id: cotizacion.cliente_id,
    contacto_nombre: cotizacion.contacto_nombre || '',
    tasa_cambio: cotizacion.tasa_cambio,
    vigencia: cotizacion.vigencia || '',
    modo_transporte: cotizacion.modo_transporte || '',
    incoterm: cotizacion.incoterm || '',
    peso_total: cotizacion.peso_total || '',
    unidades_carga: cotizacion.unidades_carga || '',
    dimension_l: cotizacion.dimension_l || '',
    dimension_w: cotizacion.dimension_w || '',
    dimension_h: cotizacion.dimension_h || ''
  })
  const [selectedRefs, setSelectedRefs] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingRefs, setLoadingRefs] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClientes()
    fetchReferencias()
    fetchCotizacionReferencias()
  }, [])

  const fetchClientes = async () => {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre')
    setClientes(data || [])
  }

  const fetchReferencias = async () => {
    const { data } = await supabase
      .from('referencias')
      .select('*')
      .order('nombre')
    setReferencias(data || [])
  }

  const fetchCotizacionReferencias = async () => {
    setLoadingRefs(true)
    const { data } = await supabase
      .from('cotizacion_referencias')
      .select('*')
      .eq('cotizacion_id', cotizacion.id)
    
    if (data) {
      setSelectedRefs(data.map(ref => ({
        id: ref.id,
        referencia_id: ref.referencia_id,
        cantidad: ref.cantidad,
        precio_modificado_cop: ref.precio_modificado_cop || '',
        numero_caja: ref.numero_caja || ''
      })))
    }
    setLoadingRefs(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddReferencia = () => {
    setSelectedRefs([...selectedRefs, { referencia_id: '', cantidad: 1, precio_modificado_cop: '', numero_caja: '' }])
  }

  const handleRemoveReferencia = async (index) => {
    const ref = selectedRefs[index]
    
    // Si tiene id, eliminar de la base de datos
    if (ref.id) {
      const { error } = await supabase
        .from('cotizacion_referencias')
        .delete()
        .eq('id', ref.id)
      
      if (error) {
        setError('Error al eliminar referencia: ' + error.message)
        return
      }
    }
    
    setSelectedRefs(selectedRefs.filter((_, i) => i !== index))
  }

  const handleReferenciaChange = (index, field, value) => {
    const updated = [...selectedRefs]
    updated[index][field] = value
    setSelectedRefs(updated)
  }

  const calcularCajasAutomaticamente = () => {
    const updated = [...selectedRefs]
    let numeroCajaActual = 1
    const cajasPorFamilia = {} // { familia: { capacidad, cantidad_actual, numero_caja } }

    updated.forEach(ref => {
      const referencia = referencias.find(r => r.id === ref.referencia_id)
      if (!referencia) return

      const familia = referencia.familia
      const cantidad = parseInt(ref.cantidad) || 0
      const capacidadCaja = parseInt(referencia.cantidad_minima_caja) || 0

      // Si no tiene familia o no tiene capacidad definida, asignar caja individual
      if (!familia || capacidadCaja === 0) {
        ref.numero_caja = numeroCajaActual
        numeroCajaActual++
        return
      }

      // Si la familia no existe en el tracker, inicializarla
      if (!cajasPorFamilia[familia]) {
        cajasPorFamilia[familia] = {
          capacidad: capacidadCaja,
          cantidad_actual: 0,
          numero_caja: numeroCajaActual
        }
        numeroCajaActual++
      }

      const familiaInfo = cajasPorFamilia[familia]
      
      // Distribuir la cantidad en cajas
      let cantidadRestante = cantidad
      
      while (cantidadRestante > 0) {
        const espacioDisponible = familiaInfo.capacidad - familiaInfo.cantidad_actual
        
        if (espacioDisponible > 0) {
          // Cabe en la caja actual
          const cantidadEnEstaCaja = Math.min(cantidadRestante, espacioDisponible)
          ref.numero_caja = familiaInfo.numero_caja
          familiaInfo.cantidad_actual += cantidadEnEstaCaja
          cantidadRestante -= cantidadEnEstaCaja
          
          // Si llenamos la caja, crear una nueva
          if (familiaInfo.cantidad_actual >= familiaInfo.capacidad) {
            familiaInfo.numero_caja = numeroCajaActual
            numeroCajaActual++
            familiaInfo.cantidad_actual = 0
          }
        } else {
          // Necesitamos una nueva caja
          familiaInfo.numero_caja = numeroCajaActual
          numeroCajaActual++
          familiaInfo.cantidad_actual = 0
        }
      }
    })

    setSelectedRefs(updated)
  }

  const ordenarPorNumeroCaja = () => {
    const updated = [...selectedRefs].sort((a, b) => {
      const cajaA = parseInt(a.numero_caja) || 999999
      const cajaB = parseInt(b.numero_caja) || 999999
      return cajaA - cajaB
    })
    setSelectedRefs(updated)
  }

  const calcularUnidadesCarga = () => {
    // Obtener el número de cajas únicas
    const cajasUnicas = new Set(
      selectedRefs
        .filter(ref => ref.numero_caja && ref.numero_caja !== '')
        .map(ref => parseInt(ref.numero_caja))
    )
    
    const totalCajas = cajasUnicas.size
    
    if (totalCajas > 0) {
      setFormData(prev => ({
        ...prev,
        unidades_carga: totalCajas.toString()
      }))
    }
  }

  const calcularPesoTotal = () => {
    // Calcular peso total: suma de (peso_unitario * cantidad) de cada referencia
    const pesoTotal = selectedRefs.reduce((total, ref) => {
      const referencia = referencias.find(r => r.id === ref.referencia_id)
      if (!referencia) {
        console.log('Referencia no encontrada para ref:', ref)
        return total
      }
      
      const pesoUnitario = parseFloat(referencia.peso_unitario) || 0
      const cantidad = parseInt(ref.cantidad) || 0
      const subtotal = pesoUnitario * cantidad
      
      console.log(`${referencia.nombre}: ${pesoUnitario}kg × ${cantidad} = ${subtotal}kg`)
      
      return total + subtotal
    }, 0)
    
    console.log('Peso total calculado:', pesoTotal)
    
    setFormData(prev => ({
      ...prev,
      peso_total: pesoTotal.toFixed(2)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Actualizar cotización
      const { error: cotizacionError } = await supabase
        .from('cotizaciones')
        .update({
          numero_cotizacion: formData.numero_cotizacion,
          cliente_id: formData.cliente_id,
          contacto_nombre: formData.contacto_nombre,
          tasa_cambio: parseFloat(formData.tasa_cambio),
          vigencia: formData.vigencia,
          modo_transporte: formData.modo_transporte,
          incoterm: formData.incoterm,
          peso_total: formData.peso_total ? parseFloat(formData.peso_total) : null,
          unidades_carga: formData.unidades_carga ? parseInt(formData.unidades_carga) : null,
          dimension_l: formData.dimension_l ? parseFloat(formData.dimension_l) : null,
          dimension_w: formData.dimension_w ? parseFloat(formData.dimension_w) : null,
          dimension_h: formData.dimension_h ? parseFloat(formData.dimension_h) : null
        })
        .eq('id', cotizacion.id)

      if (cotizacionError) throw cotizacionError

      // Actualizar/insertar referencias
      for (const ref of selectedRefs) {
        const refData = {
          cotizacion_id: cotizacion.id,
          referencia_id: ref.referencia_id,
          cantidad: parseInt(ref.cantidad),
          precio_modificado_cop: ref.precio_modificado_cop ? parseFloat(ref.precio_modificado_cop) : null,
          numero_caja: ref.numero_caja ? parseInt(ref.numero_caja) : null
        }

        if (ref.id) {
          // Actualizar existente
          const { error } = await supabase
            .from('cotizacion_referencias')
            .update(refData)
            .eq('id', ref.id)
          
          if (error) throw error
        } else {
          // Insertar nueva
          const { error } = await supabase
            .from('cotizacion_referencias')
            .insert([refData])
          
          if (error) throw error
        }
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError('Error al actualizar cotización: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Editar Cotización</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos Generales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Datos Generales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Número de Cotización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Cotización *
                </label>
                <input
                  type="text"
                  name="numero_cotizacion"
                  value={formData.numero_cotizacion}
                  onChange={handleChange}
                  required
                  placeholder="COT-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.pais}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre de Contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre / Name (Contacto)
                </label>
                <input
                  type="text"
                  name="contacto_nombre"
                  value={formData.contacto_nombre}
                  onChange={handleChange}
                  placeholder="Persona de contacto del cliente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tasa de Cambio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa de Cambio (COP/USD) *
                </label>
                <input
                  type="number"
                  name="tasa_cambio"
                  value={formData.tasa_cambio}
                  onChange={handleChange}
                  required
                  step="0.01"
                  placeholder="4000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <small className="text-gray-500">Ej: 4000 = $4,000 COP por $1 USD</small>
              </div>
            </div>

            {/* Vigencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vigencia (Válida hasta)
              </label>
              <input
                type="date"
                name="vigencia"
                value={formData.vigencia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Transport and Trade Info */}
          <div className="grid grid-cols-2 gap-4">
            {/* Modo de Transporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo de Transporte
              </label>
              <select
                name="modo_transporte"
                value={formData.modo_transporte}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                <option value="Marítimo">Marítimo</option>
                <option value="Aéreo">Aéreo</option>
                <option value="Terrestre">Terrestre</option>
                <option value="Multimodal">Multimodal</option>
              </select>
            </div>

            {/* Incoterm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incoterm
              </label>
              <select
                name="incoterm"
                value={formData.incoterm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                <option value="EXW">EXW - Ex Works</option>
                <option value="FCA">FCA - Free Carrier</option>
                <option value="CPT">CPT - Carriage Paid To</option>
                <option value="CIP">CIP - Carriage and Insurance Paid To</option>
                <option value="DAP">DAP - Delivered at Place</option>
                <option value="DPU">DPU - Delivered at Place Unloaded</option>
                <option value="DDP">DDP - Delivered Duty Paid</option>
                <option value="FAS">FAS - Free Alongside Ship</option>
                <option value="FOB">FOB - Free on Board</option>
                <option value="CFR">CFR - Cost and Freight</option>
                <option value="CIF">CIF - Cost, Insurance and Freight</option>
              </select>
            </div>

            {/* Peso Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Total (kg)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="peso_total"
                  value={formData.peso_total}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={calcularPesoTotal}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  title="Calcular automáticamente basado en peso de referencias"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Unidades de Carga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidades de Carga
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="unidades_carga"
                  value={formData.unidades_carga}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={calcularUnidadesCarga}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  title="Calcular automáticamente basado en # de cajas"
                >
                  Auto
                </button>
              </div>
            </div>
          </div>

          {/* Dimensiones */}
          <div className="grid grid-cols-3 gap-4">
            {/* Largo (L) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largo / Length (m)
              </label>
              <input
                type="number"
                name="dimension_l"
                value={formData.dimension_l}
                onChange={handleChange}
                step="0.01"
                placeholder="1.2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ancho (W) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho / Width (m)
              </label>
              <input
                type="number"
                name="dimension_w"
                value={formData.dimension_w}
                onChange={handleChange}
                step="0.01"
                placeholder="0.8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Alto (H) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alto / Height (m)
              </label>
              <input
                type="number"
                name="dimension_h"
                value={formData.dimension_h}
                onChange={handleChange}
                step="0.01"
                placeholder="1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Referencias */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">Referencias</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={ordenarPorNumeroCaja}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ordenar por # Caja
                </button>
                <button
                  type="button"
                  onClick={calcularCajasAutomaticamente}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Calcular Cajas Automáticamente
                </button>
              </div>
            </div>

            {loadingRefs ? (
              <div className="text-center py-8 text-gray-500">Cargando referencias...</div>
            ) : selectedRefs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                No hay referencias. Haz clic en "Agregar Referencia" para empezar.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedRefs.map((ref, index) => {
                  const referencia = referencias.find(r => r.id === ref.referencia_id)
                  const precioCOP = ref.precio_modificado_cop || referencia?.precio_cop || 0
                  const precioUSD = formData.tasa_cambio ? (precioCOP / parseFloat(formData.tasa_cambio)).toFixed(2) : 0

                  const referenciaOptions = referencias.map(r => ({
                    value: r.id,
                    label: `${r.codigo || ''} - ${r.nombre} - $${r.precio_cop?.toLocaleString('es-CO')} COP`
                  }))

                  return (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        {/* Referencia */}
                        <div className="col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Referencia
                          </label>
                          <Select
                            value={referenciaOptions.find(opt => opt.value === ref.referencia_id)}
                            onChange={(selectedOption) => handleReferenciaChange(index, 'referencia_id', selectedOption?.value || '')}
                            options={referenciaOptions}
                            placeholder="Buscar referencia..."
                            isClearable
                            isSearchable
                            className="text-sm"
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: '#d1d5db',
                                '&:hover': { borderColor: '#9ca3af' }
                              })
                            }}
                          />
                        </div>

                        {/* Cantidad */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            value={ref.cantidad}
                            onChange={(e) => handleReferenciaChange(index, 'cantidad', e.target.value)}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        {/* # Caja */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            # Caja
                          </label>
                          <input
                            type="number"
                            value={ref.numero_caja}
                            onChange={(e) => handleReferenciaChange(index, 'numero_caja', e.target.value)}
                            min="1"
                            placeholder="-"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Precio Modificado */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio COP
                          </label>
                          <input
                            type="number"
                            value={ref.precio_modificado_cop}
                            onChange={(e) => handleReferenciaChange(index, 'precio_modificado_cop', e.target.value)}
                            placeholder={referencia?.precio_cop || '0'}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Precio USD */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio USD
                          </label>
                          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
                            ${precioUSD}
                          </div>
                        </div>

                        {/* Eliminar */}
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveReferencia(index)}
                            className="text-red-600 hover:text-red-900 p-2"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add button below the list */}
            <button
              type="button"
              onClick={handleAddReferencia}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Agregar Referencia
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
