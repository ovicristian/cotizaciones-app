export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Clientes</h3>
          <p className="text-3xl font-bold text-blue-900">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Cotizaciones Activas</h3>
          <p className="text-3xl font-bold text-blue-900">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Referencias</h3>
          <p className="text-3xl font-bold text-blue-900">0</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bienvenido al Sistema de Cotizaciones</h2>
        <p className="text-gray-600">
          Usa el menú lateral para navegar entre las diferentes secciones: Clientes, Cotizaciones y Referencias.
        </p>
      </div>
    </div>
  )
}
