import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Componente de diagnóstico para verificar el problema de referencias
 * Agrégalo temporalmente a tu Dashboard o cualquier página para debuggear
 */
export default function DiagnosticoReferencias() {
  const [info, setInfo] = useState({
    userId: null,
    totalReferencias: 0,
    referenciasConUserId: 0,
    referenciasSinUserId: 0,
    referenciasVisibles: 0
  })

  useEffect(() => {
    diagnosticar()
  }, [])

  const diagnosticar = async () => {
    try {
      // Obtener user ID actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('No hay usuario autenticado')
        return
      }

      // Intentar contar todas las referencias (esto podría fallar por RLS)
      const { count: totalCount, error: countError } = await supabase
        .from('referencias')
        .select('*', { count: 'exact', head: true })

      // Obtener referencias visibles para este usuario
      const { data: visibleRefs, count: visibleCount } = await supabase
        .from('referencias')
        .select('*', { count: 'exact' })
        .limit(10000)

      setInfo({
        userId: user.id,
        totalReferencias: totalCount || 0,
        referenciasVisibles: visibleCount || 0,
        referenciasConUserId: visibleRefs?.filter(r => r.user_id === user.id).length || 0,
        referenciasSinUserId: visibleRefs?.filter(r => !r.user_id).length || 0
      })

      console.log('=== DIAGNÓSTICO DE REFERENCIAS ===')
      console.log('Tu User ID:', user.id)
      console.log('Total referencias en BD:', totalCount)
      console.log('Referencias visibles para ti:', visibleCount)
      console.log('Referencias con tu user_id:', visibleRefs?.filter(r => r.user_id === user.id).length)
      console.log('Referencias sin user_id:', visibleRefs?.filter(r => !r.user_id).length)
      console.log('===================================')
      
      if (countError) {
        console.error('Error al contar referencias:', countError)
      }

    } catch (error) {
      console.error('Error en diagnóstico:', error)
    }
  }

  const asignarReferenciasSinUserId = async () => {
    const confirmacion = window.confirm(
      '¿Estás seguro de que quieres asignar todas las referencias sin user_id a tu usuario? ' +
      'Esto podría afectar a otros usuarios si existen.'
    )

    if (!confirmacion) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('No hay usuario autenticado')
        return
      }

      // Esta actualización solo funcionará si tienes los permisos adecuados
      // Normalmente necesitarías hacerlo desde el SQL Editor de Supabase
      alert(
        'Por seguridad, esta operación debe hacerse desde el SQL Editor de Supabase.\n\n' +
        `Ejecuta esta consulta:\n\n` +
        `UPDATE referencias\n` +
        `SET user_id = '${user.id}'\n` +
        `WHERE user_id IS NULL;`
      )

    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 my-4">
      <h3 className="text-lg font-bold text-yellow-900 mb-4">
        🔍 Diagnóstico de Referencias
      </h3>
      
      <div className="space-y-2 text-sm">
        <p><strong>Tu User ID:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{info.userId}</code></p>
        <p><strong>Total referencias en BD:</strong> {info.totalReferencias}</p>
        <p><strong>Referencias visibles para ti:</strong> 
          <span className={info.referenciasVisibles === 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
            {' '}{info.referenciasVisibles}
          </span>
        </p>
        <p><strong>Referencias con tu user_id:</strong> {info.referenciasConUserId}</p>
        <p><strong>Referencias sin user_id:</strong> 
          <span className={info.referenciasSinUserId > 0 ? 'text-red-600 font-bold' : ''}>
            {' '}{info.referenciasSinUserId}
          </span>
        </p>
      </div>

      {info.referenciasVisibles === 0 && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-900 font-bold mb-2">⚠️ PROBLEMA DETECTADO</p>
          <p className="text-sm text-red-800 mb-3">
            No puedes ver ninguna referencia. Esto probablemente se debe a que las referencias 
            en la base de datos no tienen tu user_id asignado o tienen el user_id de otro usuario.
          </p>
          <p className="text-sm text-red-800 mb-3">
            <strong>Solución:</strong> Ve al SQL Editor de Supabase y ejecuta:
          </p>
          <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto">
{`-- Primero verifica qué referencias existen sin user_id
SELECT id, nombre, user_id FROM referencias WHERE user_id IS NULL;

-- Luego asígnalas a tu usuario
UPDATE referencias
SET user_id = '${info.userId}'
WHERE user_id IS NULL;`}
          </pre>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={diagnosticar}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Recargar Diagnóstico
        </button>
        <button
          onClick={asignarReferenciasSinUserId}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ver SQL para Asignar Referencias
        </button>
      </div>

      <div className="mt-4 text-xs text-yellow-800">
        <p><strong>Nota:</strong> Puedes eliminar este componente una vez resuelto el problema.</p>
      </div>
    </div>
  )
}
