import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, BorderStyle, VerticalAlign, ImageRun, Header } from 'docx'
import { saveAs } from 'file-saver'
import { supabase } from '../lib/supabaseClient'
import { COMPANY_INFO } from '../config/companyConfig'

const logoPath = '/logo.png'

export const generateProformaWord = async (cotizacionId) => {
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

    // Calcular subtotal
    const subtotal = sortedRefs.reduce((sum, ref) => {
      const precio = ref.precio_modificado_cop || ref.referencias.precio_cop || 0
      const precioUSD = precio / cotizacion.tasa_cambio
      return sum + (precioUSD * ref.cantidad)
    }, 0)

    // Cargar logo como base64
    let logoBuffer = null
    try {
      const response = await fetch(logoPath)
      const blob = await response.blob()
      logoBuffer = await blob.arrayBuffer()
    } catch (error) {
      console.error('Error loading logo:', error)
    }

    // Crear documento
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Logo
          ...(logoBuffer ? [
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: {
                    width: 150,
                    height: 57
                  }
                })
              ],
              spacing: { after: 200 }
            })
          ] : []),
          // Título
          new Paragraph({
            text: 'PROFORMA',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            font: 'Arial'
          }),

          // Información de proforma y fecha
          new Paragraph({
            children: [
              new TextRun({ text: 'PROFORMA N°: ', bold: true, font: 'Arial' }),
              new TextRun({ text: proformaNum, font: 'Arial' })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'FECHA / DATE: ', bold: true, font: 'Arial' }),
              new TextRun({ text: new Date(cotizacion.created_at).toLocaleDateString(), font: 'Arial' })
            ],
            spacing: { after: 200 }
          }),

          // Tabla con Exportador y Destinatario
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'EXPORTADOR / MANUFACTURER', bold: true, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Empresa: ${company.nombre}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `NIT: ${company.nit || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Vendedor: ${company.vendedor || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Dirección: ${company.direccion || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Ciudad: ${company.ciudad || ''}, ${company.pais || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Teléfono: ${company.telefono || ''}`, font: 'Arial' })] })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'DESTINATARIO / CONSIGNEE', bold: true, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Empresa: ${cotizacion.clientes.nombre || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `NIT: ${cotizacion.clientes.nit || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Contacto: ${cotizacion.contacto_nombre || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Dirección: ${cotizacion.clientes.direccion || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `País: ${cotizacion.clientes.pais || ''}`, font: 'Arial' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Teléfono: ${cotizacion.clientes.telefono || ''}`, font: 'Arial' })] })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ],
            margins: { top: 100, bottom: 100, left: 100, right: 100 }
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Tabla de transporte
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MODO DE TRANSPORTE', bold: true, font: 'Arial' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'INCOTERM', bold: true, font: 'Arial' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'DIMENSIONES (m)', bold: true, font: 'Arial' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'PESO (kg)', bold: true, font: 'Arial' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'UNIDADES', bold: true, font: 'Arial' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cotizacion.modo_transporte || '', font: 'Arial' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cotizacion.incoterm || '', font: 'Arial' })] })] }),
                  new TableCell({ 
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: cotizacion.dimension_l && cotizacion.dimension_w && cotizacion.dimension_h 
                          ? `${cotizacion.dimension_l} x ${cotizacion.dimension_w} x ${cotizacion.dimension_h}` 
                          : '',
                        font: 'Arial'
                      })]
                    })] 
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cotizacion.peso_total?.toString() || '', font: 'Arial' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cotizacion.unidades_carga?.toString() || '', font: 'Arial' })] })] })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Tabla de productos
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '# CAJA', bold: true, font: 'Arial' })] })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'HTS CODE', bold: true, font: 'Arial' })] })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'DESCRIPCIÓN', bold: true, font: 'Arial' })] })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'CANTIDAD', bold: true, font: 'Arial' })] })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'PRECIO USD', bold: true, font: 'Arial' })] })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL USD', bold: true, font: 'Arial' })] })], verticalAlign: VerticalAlign.CENTER })
                ]
              }),
              // Datos
              ...sortedRefs.map(ref => {
                const referencia = ref.referencias
                const precioCOP = ref.precio_modificado_cop || referencia.precio_cop || 0
                const precioUSD = (precioCOP / cotizacion.tasa_cambio).toFixed(2)
                const totalUSD = (precioUSD * ref.cantidad).toFixed(2)
                
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

                return new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (ref.numero_caja || '').toString(), font: 'Arial' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: referencia?.codigo_arancelario || '', font: 'Arial' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: descripcionCompleta, font: 'Arial' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: ref.cantidad.toString(), font: 'Arial' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${precioUSD}`, font: 'Arial' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${totalUSD}`, font: 'Arial' })] })] })
                  ]
                })
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Totales
          new Paragraph({
            children: [
              new TextRun({ text: 'SUBTOTAL USD: ', bold: true, font: 'Arial' }),
              new TextRun({ text: `$${subtotal.toFixed(2)}`, font: 'Arial' })
            ],
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'DESCUENTO: ', bold: true, font: 'Arial' }),
              new TextRun({ text: '$0.00', font: 'Arial' })
            ],
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'TOTAL USD: ', bold: true, size: 24, font: 'Arial' }),
              new TextRun({ text: `$${subtotal.toFixed(2)}`, size: 24, font: 'Arial' })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 }
          }),

          // Observaciones
          new Paragraph({ children: [new TextRun({ text: 'OBSERVACIONES / OBSERVATIONS', bold: true, font: 'Arial' })], spacing: { after: 100 } }),
          // Usar observaciones personalizadas si existen, sino texto predeterminado
          ...(cotizacion.observaciones && cotizacion.observaciones.trim()
            ? cotizacion.observaciones.split('\n').map(line => 
                new Paragraph({ children: [new TextRun({ text: line, font: 'Arial' })] })
              )
            : [
                new Paragraph({ children: [new TextRun({ text: `FORMA DE PAGO / PAYMENT METHOD: Bank transfer`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `DATOS BANCO / BANK INFORMATION:`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `  Banco: ${company.banco_nombre || 'N/A'}`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `  Cuenta: ${company.banco_cuenta || 'N/A'}`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `  SWIFT: ${company.banco_swift || 'N/A'}`, font: 'Arial' })] }),
                ...(company.banco_aba ? [new Paragraph({ children: [new TextRun({ text: `  ABA/Routing: ${company.banco_aba}`, font: 'Arial' })] })] : []),
                new Paragraph({ children: [new TextRun({ text: `FLETE / FREIGHT:`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `SEGURO / INSURANCE:`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `PUERTO DE SALIDA / PORT OF DEPARTURE:`, font: 'Arial' })] }),
                new Paragraph({ children: [new TextRun({ text: `PUERTO DE LLEGADA / PORT OF ARRIVAL:`, font: 'Arial' })] })
              ]
          )
        ]
      }]
    })

    // Generar y descargar
    const blob = await Packer.toBlob(doc)
    const filename = `Proforma_IP_${proformaNum}.docx`
    saveAs(blob, filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating Word document:', error)
    return { success: false, error: error.message }
  }
}
