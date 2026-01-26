// Simulación del algoritmo para debugging

function testAlgorithm() {
  console.log("=== TEST: 100,000 unidades con capacidad de 200 ===\n");
  
  const cantidad = 100000;
  const capacidadCaja = 200;
  
  const nuevasReferencias = [];
  let numeroCajaActual = 1;
  const familiaInfo = {
    capacidad: capacidadCaja,
    cantidad_actual: 0,
    numero_caja: numeroCajaActual
  };
  numeroCajaActual++;
  
  let cantidadRestante = cantidad;
  let iteraciones = 0;
  
  while (cantidadRestante > 0) {
    iteraciones++;
    const espacioDisponible = familiaInfo.capacidad - familiaInfo.cantidad_actual;
    
    console.log(`Iteración ${iteraciones}:`);
    console.log(`  - Cantidad restante: ${cantidadRestante}`);
    console.log(`  - Espacio disponible en caja: ${espacioDisponible}`);
    console.log(`  - Caja actual: ${familiaInfo.numero_caja}`);
    
    if (espacioDisponible > 0) {
      // Cabe en la caja actual
      const cantidadEnEstaCaja = Math.min(cantidadRestante, espacioDisponible);
      
      console.log(`  ✓ Agregar ${cantidadEnEstaCaja} unidades a caja #${familiaInfo.numero_caja}`);
      
      nuevasReferencias.push({
        cantidad: cantidadEnEstaCaja,
        numero_caja: familiaInfo.numero_caja
      });
      
      familiaInfo.cantidad_actual += cantidadEnEstaCaja;
      cantidadRestante -= cantidadEnEstaCaja;
      
      console.log(`  - Caja tiene ahora: ${familiaInfo.cantidad_actual}/${familiaInfo.capacidad}`);
      
      // Si llenamos la caja, crear una nueva para la siguiente iteración
      if (familiaInfo.cantidad_actual >= familiaInfo.capacidad) {
        console.log(`  ⚠ Caja llena! Preparar siguiente caja #${numeroCajaActual}`);
        familiaInfo.numero_caja = numeroCajaActual;
        numeroCajaActual++;
        familiaInfo.cantidad_actual = 0;
      }
    } else {
      // Necesitamos una nueva caja
      console.log(`  ⚠ Sin espacio, crear nueva caja #${numeroCajaActual}`);
      familiaInfo.numero_caja = numeroCajaActual;
      numeroCajaActual++;
      familiaInfo.cantidad_actual = 0;
    }
    
    console.log("");
    
    // Safety break
    if (iteraciones > 10) {
      console.log("... (mostrando solo primeras 10 iteraciones)\n");
      break;
    }
  }
  
  console.log(`\n=== RESULTADO ===`);
  console.log(`Total de registros creados: ${nuevasReferencias.length}`);
  console.log(`Total de iteraciones: ${iteraciones}`);
  
  const cajasUnicas = new Set(nuevasReferencias.map(r => r.numero_caja));
  console.log(`Cajas únicas: ${cajasUnicas.size}`);
  console.log(`Números de caja: ${Array.from(cajasUnicas).slice(0, 10).join(', ')}...`);
}

testAlgorithm();
