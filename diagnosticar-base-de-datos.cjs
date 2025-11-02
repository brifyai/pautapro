
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarBaseDeDatos() {
  console.log('=== DIAGNÓSTICO COMPLETO DE LA BASE DE DATOS ===\n');

  // Lista de tablas que el sistema espera encontrar
  const tablasEsperadas = [
    'clientes',
    'comunas',
    'region',
    'grupos',
    'tipocliente',
    'tablaformato',
    'contactocliente',
    'comisiones',
    'productos',
    'mensajes',
    'campania',
    'ordenes',
    'ordenesdepublicidad',
    'alternativas',
    'medios',
    'soportes',
    'agencias',
    'contratos',
    'otrosdatos'
  ];

  const resultados = {
    tablasExistentes: [],
    tablasFaltantes: [],
    tablasConErrores: [],
    detallesTablas: {}
  };

  console.log('1. Verificando existencia de tablas...\n');

  for (const tabla of tablasEsperadas) {
    try {
      console.log(`Verificando tabla: ${tabla}`);
      
      const { data, error, status } = await supabase
        .from(tabla)
        .select('*')
        .limit(1);

      if (error) {
        if (status === 406 || status === 400) {
          // Error de columna no encontrada o permisos
          console.log(`❌ Tabla '${tabla}' existe pero tiene errores estructurales:`, error.message);
          resultados.tablasConErrores.push({
            tabla,
            error: error.message,
            status
          });
          
          // Intentar obtener solo la estructura
          try {
            const { data: estructuraData } = await supabase
              .from(tabla)
              .select('*')
              .limit(0);
            
            if (estructuraData) {
              resultados.detallesTablas[tabla] = {
                existe: true,
                error: error.message,
                estructura: 'acceso limitado'
              };
            }
          } catch (e) {
            resultados.detallesTablas[tabla] = {
              existe: true,
              error: error.message,
              estructura: 'no accesible'
            };
          }
        } else if (status === 404) {
          console.log(`⚠️  Tabla '${tabla}' no existe (404)`);
          resultados.tablasFaltantes.push(tabla);
          resultados.detallesTablas[tabla] = {
            existe: false,
            error: 'Tabla no encontrada'
          };
        } else {
          console.log(`❌ Error inesperado en tabla '${tabla}':`, error);
          resultados.tablasConErrores.push({
            tabla,
            error: error.message,
            status
