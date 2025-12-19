import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// Script para generar un archivo de prueba con referencias reales
async function generateTestFile() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Productos')

  // Configurar columnas
  worksheet.columns = [
    { header: 'CODIGO', key: 'codigo', width: 20 },
    { header: 'CANTIDAD', key: 'cantidad', width: 10 }
  ]

  // Agregar datos de prueba con referencias reales
  worksheet.addRow({ codigo: 'AA-050A', cantidad: 10 })
  worksheet.addRow({ codigo: 'AA-050B', cantidad: 5 })
  worksheet.addRow({ codigo: 'AA-070', cantidad: 15 })
  worksheet.addRow({ codigo: 'AA-070A', cantidad: 8 })

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
  saveAs(blob, 'test_productos.xlsx')
}

// Para usar este script, agrégalo temporalmente a tu componente 
// y llámalo desde la consola del navegador:
// generateTestFile()

export { generateTestFile }
