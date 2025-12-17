import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Home, Users, FileText, Package, LogOut, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import logo from '../../assets/logo.webp'

export default function Layout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Cotizaciones', path: '/cotizaciones', icon: FileText },
    { name: 'Referencias', path: '/referencias', icon: Package },
    { name: 'Configuración', path: '/configuracion', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <img src={logo} alt="Ingepartes Logo" className="w-32 mb-3" />
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="text-blue-300 text-sm">Sistema Internacional</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
