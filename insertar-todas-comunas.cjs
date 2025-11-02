const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

// Todas las comunas de Chile organizadas por región
const comunasPorRegion = {
  1: [ // Región de Arica y Parinacota
    'Arica', 'Camarones', 'Putre', 'General Lagos'
  ],
  2: [ // Región de Tarapacá
    'Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'
  ],
  3: [ // Región de Antofagasta
    'Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'
  ],
  4: [ // Región de Atacama
    'Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'
  ],
  5: [ // Región de Coquimbo
    'La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'
  ],
  6: [ // Región de Valparaíso
    'Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quilpué', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Putaendo', 'Santa María', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llay Llay', 'Panquehue', 'Putaendo', 'Santa Cruz', 'Chimbarongo', 'Nancagua', 'Palmilla', 'Peralillo', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Pedro', 'Olmué', 'Quillota', 'La Calera'
  ],
  7: [ // Región Metropolitana de Santiago
    'Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'La Florida', 'Padre Hurtado', 'Peñaflor'
  ],
  8: [ // Región del Libertador General Bernardo O'Higgins
    'Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones'
  ],
  9: [ // Región del Maule
    'Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'
  ],
  10: [ // Región de Ñuble
    'Chillán', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'Chillán Viejo', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'
  ],
  11: [ // Región del Biobío
    'Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío', 'Chillán Viejo', 'Coelemu', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'Quillón', 'Yungay'
  ],
  12: [ // Región de La Araucanía
    'Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'
  ],
  13: [ // Región de Los Ríos
    'Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'
  ],
  14: [ // Región de Los Lagos
    'Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'
  ],
  15: [ // Región de Aysén del General Carlos Ibáñez del Campo
    'Coihaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', "O'Higgins", 'Tortel', 'Chile Chico', 'Río Ibáñez'
  ],
  16: [ // Región de Magallanes y de la Antártica Chilena
    'Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'
  ]
};

async function insertarTodasComunas() {
  try {
    console.log('Iniciando inserción de todas las comunas de Chile...');
    
    // Primero, limpiar la tabla de comunas existentes
    console.log('Limpiando tabla de comunas existentes...');
    const { error: deleteError } = await supabase
      .from('comunas')
      .delete()
      .neq('id', 0); // Eliminar todos los registros
    
    if (deleteError) {
      console.error('Error al limpiar comunas existentes:', deleteError);
      return;
    }
    
    console.log('Tabla limpiada. Insertando nuevas comunas...');
    
    // Preparar todos los datos para inserción
    todasLasComunas = [];
    let idComuna = 1;
    
    for (const [idRegion, comunas] of Object.entries(comunasPorRegion)) {
      for (const nombreComuna of comunas) {
        todasLasComunas.push({
          id: idComuna++,
          nombrecomuna: nombreComuna,
          id_region: parseInt(idRegion)
        });
      }
    }
    
    // Insertar en lotes de 50 para evitar límites de la API
    const loteSize = 50;
    const lotes = [];
    
    for (let i = 0; i < todasLasComunas.length; i += loteSize) {
      lotes.push(todasLasComunas.slice(i, i + loteSize));
    }
    
    console.log(`Se insertarán ${todasLasComunas.length} comunas en ${lotes.length} lotes`);
    
    let totalInsertadas = 0;
    for (let i = 0; i < lotes.length; i++) {
      const lote = lotes[i];
      console.log(`Insertando lote ${i + 1}/${lotes.length} (${lote.length} comunas)...`);
      
      const { data, error } = await supabase
        .from('comunas')
        .insert(lote)
        .select();
      
      if (error) {
        console.error(`Error en el lote ${i + 1}:`, error);
        continue;
      }
      
      totalInsertadas += data.length;
      console.log(`Lote ${i + 1} insertado correctamente. Total acumulado: ${totalInsertadas}`);
    }
    
    console.log(`\n✅ Proceso completado! Se insertaron ${totalInsertadas} comunas de Chile.`);
    
    // Verificación final
    const { data: verification, error: verificationError } = await supabase
      .from('comunas')
      .select('*');
    
    if (verificationError) {
      console.error('Error en verificación:', verificationError);
    } else {
      console.log(`Verificación: Hay ${verification.length} comunas en la base de datos.`);
      
      // Mostrar resumen por región
      const resumenPorRegion = {};
      verification.forEach(comuna => {
        if (!resumenPorRegion[comuna.id_region]) {
          resumenPorRegion[comuna.id_region] = 0;
        }
        resumenPorRegion[comuna.id_region]++;
      });
      
      console.log('\nResumen por región:');
      for (const [idRegion, cantidad] of Object.entries(resumenPorRegion)) {
        console.log(`Región ${idRegion}: ${cantidad} comunas`);
      }
    }
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

insertarTodasComunas();