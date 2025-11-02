const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = 'https://jzqgqjpxyodzqfjxvqwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cWdxanB4eW9kenFmanh2cXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjY1OTc3MiwiZXhwIjoyMDQ4MjM1NzcyfQ.5YqEYlYJjC2c4J3xQhY8YmT9WZ7XqL8R2V1K3X9WZ7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeProveedoresScript() {
  try {
    console.log('Leyendo script SQL...');
    const sqlScript = fs.readFileSync('seed-proveedores.sql', 'utf8');
    
    console.log('Ejecutando script SQL para insertar proveedores...');
    
    // Dividir el script en sentencias individuales
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log('Ejecutando:', statement.substring(0, 100) + '...');
          
          // Para INSERT statements, necesitamos usar RPC o ejecutar SQL directo
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            console.error('Error en sentencia:', error.message);
            errorCount++;
          } else {
            console.log('✓ Sentencia ejecutada correctamente');
            successCount++;
          }
        } catch (err) {
          console.error('Error ejecutando sentencia:', err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\nResumen:`);
    console.log(`✓ Sentencias exitosas: ${successCount}`);
    console.log(`✗ Sentencias con error: ${errorCount}`);
    
    // Verificar cuántos proveedores hay ahora
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

// Ejecutar el script
executeProveedoresScript();