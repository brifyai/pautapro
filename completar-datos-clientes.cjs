const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración de Supabase
const supabaseUrl = 'https://tu-proyecto.supabase.co'; // Reemplaza con tu URL real
const supabaseKey = 'tu-service-role-key'; // Reemplaza con tu service role key

// Si tienes un archivo .env, puedes leerlo
if (fs.existsSync('.env')) {
  require('dotenv').config();
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de ejemplo para completar información faltante
const nombresFantasia = [
  'Marketing Solutions', 'Digital Media Corp', 'Advertising Plus', 'Creative Agency',
  'Brand Builders', 'Media Masters', 'Communication Experts', 'Strategic Partners',
  'Innovation Labs', 'Future Vision', 'Global Reach', 'Local Impact', 'Premium Services',
  'Elite Marketing', 'Next Level Media', 'Smart Advertising', 'Pro Media Group'
];

const giros = [
  'Publicidad y Marketing', 'Servicios de Comunicación', 'Agencia de Publicidad',
  'Consultoría en Marketing', 'Medios de Comunicación', 'Producción Audiovisual',
  'Diseño Gráfico', 'Relaciones Públicas', 'Marketing Digital', 'Branding y Diseño'
];

const direcciones = [
  'Av. Providencia 123', 'Calle Las Condes 456', 'Paseo Ahumada 789',
  'Av. Apoquindo 1011', 'Calle Huérfanos 1213', 'Av. Libertador 1415',
  'Calle Estado 1617', 'Paseo Bulnes 1819', 'Av. Vitacura 2021',
  'Calle Alonso de Córdova 2223', 'Av. Manquehue 2425', 'Calle Nueva Costanera 2627'
];

const comunas = [
  { nombre: 'Santiago', region: 13 },
  { nombre: 'Providencia', region: 13 },
  { nombre: 'Las Condes', region: 13 },
  { nombre: 'Vitacura', region: 13 },
  { nombre: 'Ñuñoa', region: 13 },
  { nombre: 'La Reina', region: 13 },
  { nombre: 'Macul', region: 13 },
  { nombre: 'Peñalolén', region: 13 },
  { nombre: 'La Florida', region: 13 },
  { nombre: 'Puente Alto', region: 13 },
  { nombre: 'Maipú', region: 13 },
  { nombre: 'Conchalí', region: 13 }
];

const dominios = [
  'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'empresa.cl',
  'marketing.cl', 'comunicacion.cl', 'publicidad.cl', 'media.cl', 'digital.cl'
];

// Función para generar RUT chileno válido
function generarRUT() {
  const numero = Math.floor(Math.random() * 90000000) + 10000000; // 8 dígitos
  const dv = calcularDV(numero);
  return `${numero}-${dv}`;
}

function calcularDV(rut) {
  let suma = 0;
  let multiplicador = 2;

  while (rut > 0) {
    suma += (rut % 10) * multiplicador;
    rut = Math.floor(rut / 10);
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

// Función para generar teléfono chileno
function generarTelefono() {
  const numero = Math.floor(Math.random() * 90000000) + 20000000; // Números que empiezan con 2
  return `+56${numero}`;
}

// Función para generar email
function generarEmail(nombreCliente) {
  const nombreLimpio = nombreCliente.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 8);
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];
  return `${nombreLimpio}@${dominio}`;
}

async function completarDatosClientes() {
  try {
    console.log('🔍 Consultando clientes existentes...');

    // Obtener todos los clientes
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id_cliente');

    if (error) {
      console.error('❌ Error al consultar clientes:', error);
      return;
    }

    console.log(`📊 Encontrados ${clientes.length} clientes`);

    let actualizados = 0;
    let errores = 0;

    for (const cliente of clientes) {
      try {
        const datosActualizar = {};

        // Completar nombre de fantasía si está vacío
        if (!cliente.nombrefantasia || cliente.nombrefantasia.trim() === '') {
          datosActualizar.nombrefantasia = nombresFantasia[Math.floor(Math.random() * nombresFantasia.length)];
        }

        // Completar giro si está vacío
        if (!cliente.giro || cliente.giro.trim() === '') {
          datosActualizar.giro = giros[Math.floor(Math.random() * giros.length)];
        }

        // Completar dirección si está vacía
        if (!cliente.direccionempresa || cliente.direccionempresa.trim() === '') {
          datosActualizar.direccionempresa = direcciones[Math.floor(Math.random() * direcciones.length)];
        }

        // Completar RUT si está vacío
        if (!cliente.RUT || cliente.RUT.trim() === '') {
          datosActualizar.RUT = generarRUT();
        }

        // Completar teléfonos si están vacíos
        if (!cliente.telfijo || cliente.telfijo.trim() === '') {
          datosActualizar.telfijo = generarTelefono();
        }

        if (!cliente.telcelular || cliente.telcelular.trim() === '') {
          datosActualizar.telcelular = generarTelefono();
        }

        // Completar email si está vacío
        if (!cliente.email || cliente.email.trim() === '') {
          datosActualizar.email = generarEmail(cliente.nombrecliente || cliente.razonsocial);
        }

        // Completar región y comuna si están vacías
        if (!cliente.region) {
          const comunaAleatoria = comunas[Math.floor(Math.random() * comunas.length)];
          datosActualizar.region = comunaAleatoria.region;
          datosActualizar.comuna = comunaAleatoria.nombre;
        }

        // Completar representante legal si está vacío
        if (!cliente.nombrerepresentantelegal || cliente.nombrerepresentantelegal.trim() === '') {
          const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Carmen'];
          const apellidos = ['Pérez', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Ramírez', 'Torres'];
          const nombre = nombres[Math.floor(Math.random() * nombres.length)];
          const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
          datosActualizar.nombrerepresentantelegal = `${nombre} ${apellido}`;
        }

        // Completar RUT del representante si está vacío
        if (!cliente.rutrepresentante || cliente.rutrepresentante.trim() === '') {
          datosActualizar.rutrepresentante = generarRUT();
        }

        // Solo actualizar si hay datos para actualizar
        if (Object.keys(datosActualizar).length > 0) {
          const { error: updateError } = await supabase
            .from('clientes')
            .update(datosActualizar)
            .eq('id_cliente', cliente.id_cliente);

          if (updateError) {
            console.error(`❌ Error actualizando cliente ${cliente.id_cliente}:`, updateError);
            errores++;
          } else {
            console.log(`✅ Cliente ${cliente.nombrecliente || cliente.razonsocial} actualizado`);
            actualizados++;
          }
        }

      } catch (clienteError) {
        console.error(`❌ Error procesando cliente ${cliente.id_cliente}:`, clienteError);
        errores++;
      }
    }

    console.log('\n📈 Resumen de la operación:');
    console.log(`✅ Clientes actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${clientes.length}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
completarDatosClientes()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });