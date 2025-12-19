import { useState } from 'react'
import { Upload, Download, AlertCircle } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export default function ImportProductosExcel({ referencias, onImport }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleDownloadSample = async () => {
    // Crear un archivo de ejemplo con formato correcto usando ExcelJS
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Productos')

    // Configurar columnas
    worksheet.columns = [
      { header: 'CODIGO', key: 'codigo', width: 20 },
      { header: 'CANTIDAD', key: 'cantidad', width: 10 }
    ]

    // Agregar datos de ejemplo
    worksheet.addRow({ codigo: 'AA-050A', cantidad: 10 })
    worksheet.addRow({ codigo: 'AA-050B', cantidad: 5 })
    worksheet.addRow({ codigo: 'AA-070', cantidad: 20 })

    // Aplicar estilo al encabezado
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }

    // Generar el archivo
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    saveAs(blob, 'plantilla_productos_cotizacion.xlsx')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      
      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        throw new Error('El archivo está vacío o no tiene hojas')
      }

      // Obtener headers (primera fila)
      const headerRow = worksheet.getRow(1)
      const headers = []
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString().toUpperCase().trim() || ''
      })
      
      // Validar que existan las columnas requeridas
      const codigoIndex = headers.findIndex(h => 
        h === 'CODIGO' || h === 'CÓDIGO' || h === 'CODE' || h === 'REFERENCIA'
      )
      const cantidadIndex = headers.findIndex(h => 
        h === 'CANTIDAD' || h === 'QUANTITY' || h === 'QTY' || h === 'CANT'
      )

      if (codigoIndex === -1) {
        throw new Error('No se encontró la columna CODIGO en el archivo')
      }
      if (cantidadIndex === -1) {
        throw new Error('No se encontró la columna CANTIDAD en el archivo')
      }

      // Procesar filas de datos (desde la segunda fila)
      const productos = []
      const errores = []
      const noEncontradas = []

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // Saltar header

        const codigo = row.getCell(codigoIndex + 1).value?.toString().trim()
        const cantidad = row.getCell(cantidadIndex + 1).value

        if (!codigo) return // Saltar filas vacías

        // Buscar la referencia en la base de datos
        // NOTA: Las referencias usan el campo 'nombre' como código único (ej: AA-050A)
        const referencia = referencias.find(r => 
          r.nombre?.toLowerCase() === codigo.toLowerCase()
        )

        if (referencia) {
          const cantidadNum = parseInt(cantidad)
          if (isNaN(cantidadNum) || cantidadNum <= 0) {
            errores.push(`Fila ${rowNumber}: Cantidad inválida para ${codigo}`)
            return
          }

          productos.push({
            referencia_id: referencia.id,
            cantidad: cantidadNum,
            precio_modificado_cop: '',
            numero_caja: ''
          })
        } else {
          noEncontradas.push(`${codigo} (Fila ${rowNumber})`)
        }
      })

      // Mostrar resultados
      let mensaje = `✓ ${productos.length} producto(s) importado(s) correctamente`
      
      if (noEncontradas.length > 0) {
        mensaje += `\n⚠ ${noEncontradas.length} referencia(s) no encontrada(s):`
        mensaje += `\n${noEncontradas.slice(0, 5).join(', ')}`
        if (noEncontradas.length > 5) {
          mensaje += `... y ${noEncontradas.length - 5} más`
        }
      }

      if (errores.length > 0) {
        setError(errores.slice(0, 3).join('\n'))
      }

      if (productos.length > 0) {
        setSuccessMessage(mensaje)
        onImport(productos)
        
        // Limpiar el input file
        e.target.value = ''
      } else {
        throw new Error('No se pudo importar ningún producto válido')
      }

    } catch (err) {
      setError('Error al procesar archivo: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Upload size={18} />
            Importar Productos desde Excel
          </h4>
          
          <div className="space-y-2 mb-3">
            <p className="text-sm text-blue-700">
              Sube un archivo Excel con las columnas: <strong>CODIGO</strong> y <strong>CANTIDAD</strong>
            </p>
            <p className="text-xs text-blue-600">
              💡 El código debe coincidir con el nombre exacto de la referencia (ej: AA-050A, AA-070, etc.)
            </p>
            
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div className="whitespace-pre-line">{error}</div>
              </div>
            )}
            
            {successMessage && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 whitespace-pre-line">
                {successMessage}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* Botón para descargar plantilla */}
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Descargar Plantilla
            </button>

            {/* Botón para subir archivo */}
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 text-sm">
              <Upload size={16} />
              {loading ? 'Procesando...' : 'Seleccionar Archivo'}
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
