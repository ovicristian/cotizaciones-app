export const COMPANY_INFO = {
  nombre: 'INDUSTRIA IP S.A.S.',
  nit: '800.123.456-7',
  vendedor: 'Juan Pérez',
  direccion: 'Calle 10 # 20-30',
  ciudad: 'Manizales, Caldas',
  pais: 'Colombia',
  telefono: '+57 (6) 123-4567',
  email: 'ventas@industriaip.com',
  banco_nombre: 'Banco de Bogotá',
  banco_cuenta: '123456789',
  banco_swift: 'BBOOCOBB',
  banco_aba: ''
}

// Función para generar texto predeterminado de observaciones
export const getDefaultObservaciones = (companyInfo) => {
  const lines = [
    'FORMA DE PAGO / PAYMENT METHOD: Bank transfer',
    'DATOS BANCO / BANK INFORMATION:',
    `  Banco: ${companyInfo.banco_nombre || 'N/A'}`,
    `  Cuenta: ${companyInfo.banco_cuenta || 'N/A'}`,
    `  SWIFT: ${companyInfo.banco_swift || 'N/A'}`,
    companyInfo.banco_aba ? `  ABA/Routing: ${companyInfo.banco_aba}` : null,
    'FLETE / FREIGHT:',
    'SEGURO / INSURANCE:',
    'PUERTO DE SALIDA / PORT OF DEPARTURE:',
    'PUERTO DE LLEGADA / PORT OF ARRIVAL:'
  ].filter(Boolean)
  
  return lines.join('\n')
}

