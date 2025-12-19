import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { supabase } from '../lib/supabaseClient'
import { COMPANY_INFO } from '../config/companyConfig'

const logoPath = '/logo.png'

export const generateProformaExcel = async (cotizacionId) => {
  try {
    // Obtener configuración de la empresa
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: empresaConfig } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    const company = empresaConfig || COMPANY_INFO

    // Obtener datos de la cotización
    const { data: cotizacion, error: cotError } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        clientes (*)
      `)
      .eq('id', cotizacionId)
      .single()

    if (cotError) throw cotError

    // Obtener referencias de la cotización
    const { data: refs, error: refsError } = await supabase
      .from('cotizacion_referencias')
      .select(`
        *,
        referencias (*)
      `)
      .eq('cotizacion_id', cotizacionId)

    if (refsError) throw refsError

    const sortedRefs = refs.sort((a, b) => {
      const cajaA = a.numero_caja || 999999
      const cajaB = b.numero_caja || 999999
      return cajaA - cajaB
    })

    const proformaNum = cotizacion.numero_cotizacion || `${cotizacion.id.toString().padStart(3, '0')}`

    // Crear workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Proforma')

    // Configurar anchos de columnas
    worksheet.columns = [
      { width: 12 }, // A - # Caja
      { width: 15 }, // B - HTS Code
      { width: 50 }, // C - Descripción
      { width: 12 }, // D - Cantidad
      { width: 15 }, // E - Precio USD
      { width: 15 }  // F - Total USD
    ]

    // Cargar y agregar logo
    try {
      const response = await fetch(logoPath)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const logoId = workbook.addImage({
        buffer: arrayBuffer,
        extension: 'png'
      })
      
      // Agregar logo a la hoja (A1:B3)
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 150, height: 57 }
      })
    } catch (error) {
      console.error('Error loading logo:', error)
    }

    let currentRow = 4 // Empezar después del logo

    // TÍTULO
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`)
    const titleCell = worksheet.getCell(`A${currentRow}`)
    titleCell.value = 'PROFORMA'
    titleCell.font = { size: 18, bold: true, name: 'Arial' }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    currentRow += 2

    // NÚMERO DE PROFORMA Y FECHA
    worksheet.getCell(`A${currentRow}`).value = 'PROFORMA N°:'
    worksheet.getCell(`A${currentRow}`).font = { bold: true, name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = proformaNum
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++

    worksheet.getCell(`A${currentRow}`).value = 'FECHA / DATE:'
    worksheet.getCell(`A${currentRow}`).font = { bold: true, name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = new Date(cotizacion.created_at).toLocaleDateString()
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow += 2

    // EXPORTADOR
    worksheet.getCell(`A${currentRow}`).value = 'EXPORTADOR / MANUFACTURER'
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Empresa:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = company.nombre
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'NIT:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = company.nit || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Vendedor:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = company.vendedor || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Dirección:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = company.direccion || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Ciudad:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = `${company.ciudad || ''}, ${company.pais || ''}`
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Teléfono:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = company.telefono || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow += 2

    // DESTINATARIO
    worksheet.getCell(`A${currentRow}`).value = 'DESTINATARIO / CONSIGNEE'
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Empresa:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.clientes.nombre || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'NIT:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.clientes.nit || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Contacto:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.contacto_nombre || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Dirección:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.clientes.direccion || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'País:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.clientes.pais || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = 'Teléfono:'
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.clientes.telefono || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    currentRow += 2

    // INFORMACIÓN DE TRANSPORTE
    const transportStartRow = currentRow
    worksheet.getCell(`A${currentRow}`).value = 'MODO DE TRANSPORTE'
    worksheet.getCell(`B${currentRow}`).value = 'INCOTERM'
    worksheet.getCell(`C${currentRow}`).value = 'DIMENSIONES (m)'
    worksheet.getCell(`D${currentRow}`).value = 'PESO (kg)'
    worksheet.getCell(`E${currentRow}`).value = 'UNIDADES'
    
    // Aplicar estilo al encabezado de transporte
    for (let col = 1; col <= 5; col++) {
      const cell = worksheet.getCell(currentRow, col)
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
    currentRow++
    
    worksheet.getCell(`A${currentRow}`).value = cotizacion.modo_transporte || ''
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`B${currentRow}`).value = cotizacion.incoterm || ''
    worksheet.getCell(`B${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`C${currentRow}`).value = cotizacion.dimension_l && cotizacion.dimension_w && cotizacion.dimension_h 
      ? `${cotizacion.dimension_l} x ${cotizacion.dimension_w} x ${cotizacion.dimension_h}` 
      : ''
    worksheet.getCell(`C${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`D${currentRow}`).value = cotizacion.peso_total?.toString() || ''
    worksheet.getCell(`D${currentRow}`).font = { name: 'Arial' }
    worksheet.getCell(`E${currentRow}`).value = cotizacion.unidades_carga?.toString() || ''
    worksheet.getCell(`E${currentRow}`).font = { name: 'Arial' }
    
    // Aplicar bordes a la fila de datos de transporte
    for (let col = 1; col <= 5; col++) {
      const cell = worksheet.getCell(currentRow, col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    }
    currentRow += 2

    // TABLA DE PRODUCTOS
    const productHeaderRow = currentRow
    worksheet.getCell(`A${currentRow}`).value = '# CAJA'
    worksheet.getCell(`B${currentRow}`).value = 'HTS CODE'
    worksheet.getCell(`C${currentRow}`).value = 'DESCRIPCIÓN'
    worksheet.getCell(`D${currentRow}`).value = 'CANTIDAD'
    worksheet.getCell(`E${currentRow}`).value = 'PRECIO USD'
    worksheet.getCell(`F${currentRow}`).value = 'TOTAL USD'
    
    // Aplicar estilo al encabezado de productos
    for (let col = 1; col <= 6; col++) {
      const cell = worksheet.getCell(currentRow, col)
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
    currentRow++

    // Datos de productos
    let subtotal = 0
    sortedRefs.forEach(ref => {
      const referencia = ref.referencias
      const precioCOP = ref.precio_modificado_cop || referencia.precio_cop || 0
      const precioUSD = (precioCOP / cotizacion.tasa_cambio)
      const totalUSD = (precioUSD * ref.cantidad)
      
      subtotal += totalUSD

      const codigo = referencia?.codigo || ''
      const nombre = referencia?.nombre || ''
      const descripcionRef = referencia?.descripcion || ''
      
      let descripcionCompleta = ''
      if (codigo && nombre && descripcionRef) {
        descripcionCompleta = `${codigo} - ${nombre} - ${descripcionRef}`
      } else if (codigo && nombre) {
        descripcionCompleta = `${codigo} - ${nombre}`
      } else if (codigo && descripcionRef) {
        descripcionCompleta = `${codigo} - ${descripcionRef}`
      } else if (nombre && descripcionRef) {
        descripcionCompleta = `${nombre} - ${descripcionRef}`
      } else {
        descripcionCompleta = codigo || nombre || descripcionRef || 'Sin descripción'
      }

      worksheet.getCell(`A${currentRow}`).value = ref.numero_caja || ''
      worksheet.getCell(`B${currentRow}`).value = referencia?.codigo_arancelario || ''
      worksheet.getCell(`C${currentRow}`).value = descripcionCompleta
      worksheet.getCell(`D${currentRow}`).value = ref.cantidad
      worksheet.getCell(`E${currentRow}`).value = precioUSD
      worksheet.getCell(`F${currentRow}`).value = totalUSD
      
      // Formatear como moneda
      worksheet.getCell(`E${currentRow}`).numFmt = '$#,##0.00'
      worksheet.getCell(`F${currentRow}`).numFmt = '$#,##0.00'
      
      // Aplicar bordes
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(currentRow, col)
        cell.font = { name: 'Arial' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        if (col === 3) {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        }
      }
      
      currentRow++
    })

    currentRow += 1

    // TOTALES
    worksheet.getCell(`E${currentRow}`).value = 'SUBTOTAL USD:'
    worksheet.getCell(`E${currentRow}`).font = { bold: true, name: 'Arial' }
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right' }
    worksheet.getCell(`F${currentRow}`).value = subtotal
    worksheet.getCell(`F${currentRow}`).numFmt = '$#,##0.00'
    worksheet.getCell(`F${currentRow}`).font = { bold: true, name: 'Arial' }
    currentRow++

    worksheet.getCell(`E${currentRow}`).value = 'DESCUENTO:'
    worksheet.getCell(`E${currentRow}`).font = { bold: true, name: 'Arial' }
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right' }
    worksheet.getCell(`F${currentRow}`).value = 0
    worksheet.getCell(`F${currentRow}`).numFmt = '$#,##0.00'
    worksheet.getCell(`F${currentRow}`).font = { name: 'Arial' }
    currentRow++

    worksheet.getCell(`E${currentRow}`).value = 'TOTAL USD:'
    worksheet.getCell(`E${currentRow}`).font = { bold: true, size: 12, name: 'Arial' }
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right' }
    worksheet.getCell(`F${currentRow}`).value = subtotal
    worksheet.getCell(`F${currentRow}`).numFmt = '$#,##0.00'
    worksheet.getCell(`F${currentRow}`).font = { bold: true, size: 12, name: 'Arial' }
    worksheet.getCell(`F${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE599' } }
    currentRow += 2

    // OBSERVACIONES
    worksheet.getCell(`A${currentRow}`).value = 'OBSERVACIONES / OBSERVATIONS'
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, name: 'Arial' }
    currentRow++

    // Usar observaciones personalizadas si existen, sino texto predeterminado
    if (cotizacion.observaciones && cotizacion.observaciones.trim()) {
      const obsLines = cotizacion.observaciones.split('\n')
      obsLines.forEach(line => {
        worksheet.getCell(`A${currentRow}`).value = line
        worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
        currentRow++
      })
    } else {
      // Texto predeterminado
      worksheet.getCell(`A${currentRow}`).value = 'FORMA DE PAGO / PAYMENT METHOD: Bank transfer'
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = 'DATOS BANCO / BANK INFORMATION:'
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = `  Banco: ${company.banco_nombre || 'N/A'}`
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = `  Cuenta: ${company.banco_cuenta || 'N/A'}`
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = `  SWIFT: ${company.banco_swift || 'N/A'}`
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      if (company.banco_aba) {
        worksheet.getCell(`A${currentRow}`).value = `  ABA/Routing: ${company.banco_aba}`
        worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
        currentRow++
      }
      worksheet.getCell(`A${currentRow}`).value = 'FLETE / FREIGHT:'
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = 'SEGURO / INSURANCE:'
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = 'PUERTO DE SALIDA / PORT OF DEPARTURE:'
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
      worksheet.getCell(`A${currentRow}`).value = 'PUERTO DE LLEGADA / PORT OF ARRIVAL:'
      worksheet.getCell(`A${currentRow}`).font = { name: 'Arial' }
      currentRow++
    }

    // Generar y descargar
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const filename = `Proforma_IP_${proformaNum}.xlsx`
    saveAs(blob, filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating Excel:', error)
    return { success: false, error: error.message }
  }
}
