import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../lib/supabaseClient'
import { COMPANY_INFO } from '../config/companyConfig'

// Import logo
const logoPath = '/logo.png'

export const generateProformaPDF = async (cotizacionId) => {
  try {
    // Obtener configuración de la empresa
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: empresaConfig, error: empresaError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // Si no hay configuración, usar valores por defecto
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

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 15

    // Add logo at top left
    try {
      const img = new Image()
      img.src = logoPath
      await new Promise((resolve) => {
        img.onload = () => {
          // Add logo with appropriate sizing
          doc.addImage(img, 'PNG', margin, 10, 40, 15)
          resolve()
        }
        img.onerror = resolve // Continue even if logo fails to load
      })
    } catch (error) {
      console.error('Error loading logo:', error)
    }

    // HEADER - PROFORMA title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFORMA', pageWidth / 2, 20, { align: 'center' })

    // Proforma number and date (top right)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const proformaNum = cotizacion.numero_cotizacion || `${cotizacion.id.toString().padStart(3, '0')}`
    doc.rect(pageWidth - 55, 10, 40, 8)
    doc.text('PROFORMA N°:', pageWidth - 53, 15)
    doc.text(proformaNum, pageWidth - 20, 15)
    
    doc.rect(pageWidth - 55, 18, 40, 8)
    doc.text('FECHA / DATE:', pageWidth - 53, 23)
    doc.text(new Date(cotizacion.created_at).toLocaleDateString(), pageWidth - 20, 23)

    // EXPORTADOR / MANUFACTURER section
    let y = 40
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('EXPORTADOR / MANUFACTURER', margin, y)
    
    doc.setFont('helvetica', 'normal')
    y += 5
    doc.text('Empresa / Company Name:', margin, y)
    doc.text(company.nombre, margin + 50, y)
    
    y += 5
    doc.text('NIT / NIF / VAT Num:', margin, y)
    doc.text(company.nit || '', margin + 50, y)
    
    y += 5
    doc.text('Nombre / Name:', margin, y)
    doc.text(company.vendedor || '', margin + 50, y)
    
    y += 5
    doc.text('Dirección / Address:', margin, y)
    doc.text(company.direccion || '', margin + 50, y)
    
    y += 5
    doc.text('Ciudad / City / País / Country:', margin, y)
    doc.text(`${company.ciudad || ''}, ${company.pais || ''}`, margin + 50, y)
    
    y += 5
    doc.text('Teléfono / Phone:', margin, y)
    doc.text(company.telefono || '', margin + 50, y)

    // DESTINATARIO / CONSIGNEE section
    y = 40
    const rightCol = pageWidth / 2 + 10
    doc.setFont('helvetica', 'bold')
    doc.text('DESTINATARIO / CONSIGNEE', rightCol, y)
    
    doc.setFont('helvetica', 'normal')
    y += 5
    doc.text('Empresa / Company Name:', rightCol, y)
    doc.text(cotizacion.clientes.nombre || '', rightCol + 50, y)
    
    y += 5
    doc.text('NIT / NIF / VAT Num:', rightCol, y)
    doc.text(cotizacion.clientes.nit || '', rightCol + 50, y)
    
    y += 5
    doc.text('Nombre / Name:', rightCol, y)
    doc.text(cotizacion.contacto_nombre || '', rightCol + 50, y)
    
    y += 5
    doc.text('Dirección / Address:', rightCol, y)
    doc.text(cotizacion.clientes.direccion || '', rightCol + 50, y)
    
    y += 5
    doc.text('Ciudad / City / País / Country:', rightCol, y)
    doc.text(cotizacion.clientes.pais || '', rightCol + 50, y)
    
    y += 5
    doc.text('Teléfono / Phone:', rightCol, y)
    doc.text(cotizacion.clientes.telefono || '', rightCol + 50, y)

    // Transport info table
    y += 10
    autoTable(doc, {
      startY: y,
      head: [[
        'MODO DE\nTRANSPORTE/MODE\nOF TRANSPORT',
        'INCOTERM',
        'DIMENSIONES / DIMENSION OF SHIPMENT /\nL X W X H (METROS)',
        'PESO TOTAL NETO EN KG\nNET WEIGHT KG',
        'UNIDADES DE CARGA\nTOTAL NUMBER OF\nPALLETS'
      ]],
      body: [[
        cotizacion.modo_transporte || '',
        cotizacion.incoterm || '',
        cotizacion.dimension_l && cotizacion.dimension_w && cotizacion.dimension_h 
          ? `${cotizacion.dimension_l} x ${cotizacion.dimension_w} x ${cotizacion.dimension_h}` 
          : '',
        cotizacion.peso_total ? cotizacion.peso_total.toString() : '',
        cotizacion.unidades_carga ? cotizacion.unidades_carga.toString() : ''
      ]],
      theme: 'grid',
      styles: { fontSize: 7, halign: 'center', cellPadding: 3 },
      headStyles: { fillColor: [60, 60, 60], textColor: 255 }
    })

    // Products table
    y = doc.lastAutoTable.finalY + 5
    
    const tableData = refs.map(ref => {
      const referencia = ref.referencias
      const precioCOP = ref.precio_modificado_cop || referencia.precio_cop || 0
      const precioUSD = (precioCOP / cotizacion.tasa_cambio).toFixed(2)
      const totalUSD = (precioUSD * ref.cantidad).toFixed(2)
      
      // Combine código and nombre with dash separator
      const codigo = referencia?.codigo || ''
      const nombre = referencia?.nombre || ''
      const descripcion = codigo && nombre ? `${codigo} - ${nombre}` : codigo || nombre || 'Sin descripción'
      
      // Debug log
      console.log('Referencia data:', { codigo, nombre, descripcion, referencia })
      
      return [
        '', // # DE PALLETS
        '', // # DE CAJAS
        referencia?.codigo_arancelario || '', // HTS CODE
        descripcion, // DESCRIPCIÓN (código + nombre)
        ref.cantidad.toString(), // UNIDADES
        `$${precioUSD}`, // PRECIO UNITARIO
        `$${totalUSD}` // TOTAL
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [[
        '# DE PALLETS / # OF PALLETS',
        '# DE CAJAS / # OF BOXES',
        'POSICIÓN ARANCELARIA\nHTS CODE',
        'DESCRIPCIÓN / DESCRIPTION',
        'UNIDADES O\nCANTIDAD /\nUNITS OR\nPACKAGES',
        'PRECIO\nUNITARIO\nPRICE\n(EACH/USD)',
        'TOTAL UNIT\nTOTAL USD'
      ]],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 7, 
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [60, 60, 60], 
        textColor: 255, 
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'left', cellWidth: 50, overflow: 'linebreak' },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'right', cellWidth: 22 },
        6: { halign: 'right', cellWidth: 22 }
      }
    })

    // Totals
    y = doc.lastAutoTable.finalY
    const subtotal = refs.reduce((sum, ref) => {
      const precio = ref.precio_modificado_cop || ref.referencias.precio_cop || 0
      const precioUSD = precio / cotizacion.tasa_cambio
      return sum + (precioUSD * ref.cantidad)
    }, 0)

    const totalsData = [
      ['SUBTOTAL USD $', `$${subtotal.toFixed(2)}`],
      ['DESCUENTO / DISCOUNT', '$0.00'],
      ['SEGURO / INSURANCE', '0 USD'],
      ['FLETE / SHIPPING', '0 USD'],
      ['TOTAL USD $', `$${subtotal.toFixed(2)}`]
    ]

    autoTable(doc, {
      startY: y,
      body: totalsData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { halign: 'right', fontStyle: 'bold', cellWidth: 165 },
        1: { halign: 'right', cellWidth: 25, fillColor: [240, 240, 240] }
      }
    })

    // Observations
    y = doc.lastAutoTable.finalY + 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('OBSERVATIONS', margin, y)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    y += 5
    const observations = [
      'FORMA DE PAGO / PAYMENT METHOD: Bank transfer',
      `DATOS BANCO / BANK INFORMATION:`,
      `  Banco: ${company.banco_nombre || 'N/A'}`,
      `  Cuenta: ${company.banco_cuenta || 'N/A'}`,
      `  SWIFT: ${company.banco_swift || 'N/A'}`,
      company.banco_aba ? `  ABA/Routing: ${company.banco_aba}` : null,
      'FLETE / FREIGHT:',
      'SEGURO / INSURANCE:',
      'PUERTO DE SALIDA / PORT OF DEPARTURE:',
      'PUERTO DE LLEGADA / PORT OF ARRIVAL:'
    ].filter(Boolean)
    
    observations.forEach(obs => {
      doc.text(obs, margin, y)
      y += 4
    })

    // Filename and save
    const filename = `Proforma_IP_${proformaNum}.pdf`
    doc.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { success: false, error: error.message }
  }
}
