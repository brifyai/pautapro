const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://jzqgqjpxyodzqfjxvqwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cWdxanB4eW9kenFmanh2cXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjY1OTc3MiwiZXhwIjoyMDQ4MjM1NzcyfQ.5YqEYlYJjC2c4J3xQhY8YmT9WZ7XqL8R2V1K3X9WZ7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de proveedores de medios de comunicación
const proveedores = [
  // Medios de Comunicación - Televisión
  { nombre_proveedor: 'Televisión Nacional de Chile', razon_social: 'TVN S.A.', RUT: '96.518.740-4', direccion: 'Av. Presidente Balmaceda 2465', id_region: 13, id_comuna: 131, telefono: '+56992345678', email: 'contacto@tvn.cl', estado: true },
  { nombre_proveedor: 'Mega Televisión', razon_social: 'Mega S.A.', RUT: '76.123.456-7', direccion: 'Calle Santa Rosa 7630', id_region: 13, id_comuna: 131, telefono: '+56993456789', email: 'comercial@mega.cl', estado: true },
  { nombre_proveedor: 'Chilevisión', razon_social: 'Chilevisión SpA', RUT: '77.234.567-8', direccion: 'Calle Américo Vespucio 1737', id_region: 13, id_comuna: 131, telefono: '+56994567890', email: 'prensa@chilevision.cl', estado: true },
  { nombre_proveedor: 'Canal 13', razon_social: 'Canal 13 S.A.', RUT: '78.345.678-9', direccion: 'Calle Inés Matte Huerta 0190', id_region: 13, id_comuna: 131, telefono: '+56995678901', email: 'contacto@canal13.cl', estado: true },

  // Medios de Comunicación - Radio
  { nombre_proveedor: 'Radio Cooperativa', razon_social: 'Sociedad Radio Cooperativa Vitalicia', RUT: '79.456.789-0', direccion: 'Av. Vicuña Mackenna 425', id_region: 13, id_comuna: 131, telefono: '+56996789012', email: 'contacto@cooperativa.cl', estado: true },
  { nombre_proveedor: 'Biobío Comunicaciones', razon_social: 'Biobío Comunicaciones S.A.', RUT: '80.567.890-1', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56997890123', email: 'prensa@biobiochile.cl', estado: true },
  { nombre_proveedor: 'Radio ADN', razon_social: 'Ibero Americana Radio Chile S.A.', RUT: '81.678.901-2', direccion: 'Av. Apoquindo 3846', id_region: 13, id_comuna: 131, telefono: '+56998901234', email: 'contacto@adnradio.cl', estado: true },
  { nombre_proveedor: 'Radio Pudahuel', razon_social: 'Radio Pudahuel S.A.', RUT: '82.789.012-3', direccion: 'Calle San Pío X 2410', id_region: 13, id_comuna: 131, telefono: '+56999012345', email: 'comercial@pudahuel.cl', estado: true },

  // Medios de Comunicación - Prensa Escrita y Digital
  { nombre_proveedor: 'El Mercurio', razon_social: 'Empresa Periodística El Mercurio S.A.', RUT: '83.890.123-4', direccion: 'Av. Santa Rosa 7620', id_region: 13, id_comuna: 131, telefono: '+56990123456', email: 'contacto@emol.com', estado: true },
  { nombre_proveedor: 'La Tercera', razon_social: 'Consorcio Periodístico de Chile S.A.', RUT: '84.901.234-5', direccion: 'Calle Morandé 80', id_region: 13, id_comuna: 131, telefono: '+56991234567', email: 'contacto@latercera.com', estado: true },
  { nombre_proveedor: 'Publimetro Chile', razon_social: 'Publimetro Chile S.A.', RUT: '85.012.345-6', direccion: 'Calle Antonio Bellet 99', id_region: 13, id_comuna: 131, telefono: '+56992345678', email: 'contacto@publimetro.cl', estado: true },
  { nombre_proveedor: 'La Cuarta', razon_social: 'Consorcio Periodístico de Chile S.A.', RUT: '86.123.456-7', direccion: 'Calle Morandé 80', id_region: 13, id_comuna: 131, telefono: '+56993456789', email: 'contacto@lacuarta.cl', estado: true },

  // Medios de Comunicación - Portales de Noticias
  { nombre_proveedor: 'Emol', razon_social: 'Empresa Periodística El Mercurio S.A.', RUT: '87.234.567-8', direccion: 'Av. Santa Rosa 7620', id_region: 13, id_comuna: 131, telefono: '+56994567890', email: 'contacto@emol.com', estado: true },
  { nombre_proveedor: 'Biobío Chile', razon_social: 'Biobío Comunicaciones S.A.', RUT: '88.345.678-9', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56995678901', email: 'contacto@biobiochile.cl', estado: true },
  { nombre_proveedor: '24 Horas', razon_social: 'Televisión Nacional de Chile S.A.', RUT: '89.456.789-0', direccion: 'Av. Presidente Balmaceda 2465', id_region: 13, id_comuna: 131, telefono: '+56996789012', email: 'contacto@24horas.cl', estado: true },
  { nombre_proveedor: 'La Tercera Digital', razon_social: 'Consorcio Periodístico de Chile S.A.', RUT: '90.567.890-1', direccion: 'Calle Morandé 80', id_region: 13, id_comuna: 131, telefono: '+56997890123', email: 'contacto@latercera.com', estado: true },

  // Medios de Comunicación - Revistas
  { nombre_proveedor: 'Qué Pasa', razon_social: 'Copesa Editorial S.A.', RUT: '91.678.901-2', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56998901234', email: 'contacto@quepasa.cl', estado: true },
  { nombre_proveedor: 'Paula', razon_social: 'Copesa Editorial S.A.', RUT: '92.789.012-3', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56999012345', email: 'contacto@paula.cl', estado: true },
  { nombre_proveedor: 'Vanidades', razon_social: 'Editorial Televisa Chile S.A.', RUT: '93.890.123-4', direccion: 'Calle Antonio Bellet 99', id_region: 13, id_comuna: 131, telefono: '+56990123456', email: 'contacto@vanidades.cl', estado: true },
  { nombre_proveedor: 'Hola Chile', razon_social: 'Hola Chile S.A.', RUT: '94.901.234-5', direccion: 'Calle San Pío X 2410', id_region: 13, id_comuna: 131, telefono: '+56991234567', email: 'contacto@holachile.cl', estado: true },

  // Medios de Comunicación - Agencias de Noticias
  { nombre_proveedor: 'Agencia EFE Chile', razon_social: 'Agencia EFE Chile S.A.', RUT: '95.012.345-6', direccion: 'Calle Antonio Bellet 99', id_region: 13, id_comuna: 131, telefono: '+56992345678', email: 'contacto@efe.cl', estado: true },
  { nombre_proveedor: 'Agencia UNO', razon_social: 'Agencia UNO S.A.', RUT: '96.123.456-7', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56993456789', email: 'contacto@agenciauno.cl', estado: true },
  { nombre_proveedor: 'Reuters Chile', razon_social: 'Reuters Chile S.A.', RUT: '97.234.567-8', direccion: 'Av. Isidora Goyenechea 3000', id_region: 13, id_comuna: 131, telefono: '+56994567890', email: 'contacto@reuters.cl', estado: true },
  { nombre_proveedor: 'Associated Press Chile', razon_social: 'AP Chile S.A.', RUT: '98.345.678-9', direccion: 'Calle Morandé 80', id_region: 13, id_comuna: 131, telefono: '+56995678901', email: 'contacto@ap.cl', estado: true },

  // Medios de Comunicación - Medios Alternativos y Digitales
  { nombre_proveedor: 'The Clinic', razon_social: 'The Clinic Media S.A.', RUT: '99.456.789-0', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56996789012', email: 'contacto@theclinic.cl', estado: true },
  { nombre_proveedor: 'El Mostrador', razon_social: 'El Mostrador S.A.', RUT: '10.567.890-1', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56997890123', email: 'contacto@elmostrador.cl', estado: true },
  { nombre_proveedor: 'El Dinamo', razon_social: 'El Dinamo S.A.', RUT: '11.678.901-2', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56998901234', email: 'contacto@eldinamo.cl', estado: true },
  { nombre_proveedor: 'Biobío Radio', razon_social: 'Biobío Comunicaciones S.A.', RUT: '12.789.012-3', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56999012345', email: 'contacto@biobioradio.cl', estado: true },
  { nombre_proveedor: 'Radio Agricultura', razon_social: 'Radio Agricultura S.A.', RUT: '13.890.234-5', direccion: 'Calle San Ignacio 64', id_region: 8, id_comuna: 81, telefono: '+56990123456', email: 'contacto@agricultura.cl', estado: true },
  { nombre_proveedor: 'Radio Zero', razon_social: 'Zero Comunicaciones S.A.', RUT: '14.901.234-5', direccion: 'Calle San Pío X 2410', id_region: 13, id_comuna: 131, telefono: '+56991234567', email: 'contacto@radiozero.cl', estado: true }
];

async function insertProveedores() {
  try {
    console.log('Iniciando inserción de 30 proveedores de medios de comunicación...');
    
    // Agregar timestamps a todos los proveedores
    const proveedoresConTimestamps = proveedores.map(prov => ({
      ...prov,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    console.log('Insertando proveedores en la base de datos...');
    
    // Insertar todos los proveedores de una vez
    const { data, error } = await supabase
      .from('proveedores')
      .insert(proveedoresConTimestamps)
      .select();
    
    if (error) {
      console.error('Error insertando proveedores:', error);
      return;
    }
    
    console.log(`✓ ${data.length} proveedores insertados correctamente`);
    
    // Listar los proveedores insertados
    console.log('\nProveedores insertados:');
    data.forEach((prov, index) => {
      console.log(`${index + 1}. ${prov.nombre_proveedor} - ${prov.razon_social}`);
    });
    
    // Verificar el total de proveedores en la base de datos
    const { count, error: countError } = await supabase
      .from('proveedores')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\nTotal de proveedores en la base de datos: ${count}`);
    } else {
      console.error('Error contando proveedores:', countError.message);
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

// Ejecutar la inserción
insertProveedores();