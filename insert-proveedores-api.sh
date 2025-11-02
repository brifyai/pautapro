#!/bin/bash

# Configuración de la API de Supabase
SUPABASE_URL="https://jzqgqjpxyodzqfjxvqwe.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cWdxanB4eW9kenFmanh2cXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjY1OTc3MiwiZXhwIjoyMDQ4MjM1NzcyfQ.5YqEYlYJjC2c4J3xQhY8YmT9WZ7XqL8R2V1K3X9WZ7Y"

echo "Insertando 30 proveedores de medios de comunicación..."

# Insertar proveedores uno por uno usando curl
curl -X POST "${SUPABASE_URL}/rest/v1/proveedores" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_proveedor": "Televisión Nacional de Chile",
    "razon_social": "TVN S.A.",
    "RUT": "96.518.740-4",
    "direccion": "Av. Presidente Balmaceda 2465",
    "id_region": 13,
    "id_comuna": 131,
    "telefono": "+56992345678",
    "email": "contacto@tvn.cl",
    "estado": true
  }'

echo ""
echo "Proveedor 1 insertado"

curl -X POST "${SUPABASE_URL}/rest/v1/proveedores" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_proveedor": "Mega Televisión",
    "razon_social": "Mega S.A.",
    "RUT": "76.123.456-7",
    "direccion": "Calle Santa Rosa 7630",
    "id_region": 13,
    "id_comuna": 131,
    "telefono": "+56993456789",
    "email": "comercial@mega.cl",
    "estado": true
  }'

echo ""
echo "Proveedor 2 insertado"

curl -X POST "${SUPABASE_URL}/rest/v1/proveedores" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_proveedor": "Chilevisión",
    "razon_social": "Chilevisión SpA",
    "RUT": "77.234.567-8",
    "direccion": "Calle Américo Vespucio 1737",
    "id_region": 13,
    "id_comuna": 131,
    "telefono": "+56994567890",
    "email": "prensa@chilevision.cl",
    "estado": true
  }'

echo ""
echo "Proveedor 3 insertado"

curl -X POST "${SUPABASE_URL}/rest/v1/proveedores" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_proveedor": "Canal 13",
    "razon_social": "Canal 13 S.A.",
    "RUT": "78.345.678-9",
    "direccion": "Calle Inés Matte Huerta 0190",
    "id_region": 13,
    "id_comuna": 131,
    "telefono": "+56995678901",
    "email": "contacto@canal13.cl",
    "estado": true
  }'

echo ""
echo "Proveedor 4 insertado"

echo "Verificando total de proveedores..."
curl -X GET "${SUPABASE_URL}/rest/v1/proveedores?select=count" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Prefer: count=exact"

echo ""
echo "Proceso completado"