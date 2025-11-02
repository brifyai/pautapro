# Mapeo de Columnas - Migración de Base de Datos

## Resumen de Cambios
Este documento mapea todos los cambios de nombres de columnas del esquema antiguo al nuevo esquema con snake_case.

---

## Tabla: Region
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| nombreRegion | nombre_region |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Comunas
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| nombreComuna | nombre_comuna |
| id_region | id_region |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: TipoCliente → tipo_cliente
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| nombreTipoCliente | nombre_tipo_cliente |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Grupos
| Antiguo | Nuevo |
|---------|-------|
| id_grupo | id |
| nombre_grupo | nombre_grupo |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Perfiles
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| NombrePerfil | nombre_perfil |
| descripcion | descripcion |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Medios
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| nombredelmedio | nombre_del_medio |
| codigo | codigo |
| duracion | duracion |
| color | color |
| codigo_megatime | codigo_megatime |
| calidad | calidad |
| cooperado | cooperado |
| rubro | rubro |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Calidad
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| NombreCalidad | nombre_calidad |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: FormaDePago → forma_de_pago
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| NombreFormadePago | nombre_forma_de_pago |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: TipoGeneracionDeOrden → tipo_generacion_orden
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| NombreTipoOrden | nombre_tipo_orden |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Anios → anios
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| years | years |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Meses → meses
| Antiguo | Nuevo |
|---------|-------|
| Id | id |
| Nombre | nombre |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: TablaFormato → tabla_formato
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| nombreFormato | nombre_formato |
| created_at | created_at |
| updated_at | updated_at |

## Tabla: Usuarios → usuarios
| Antiguo | Nuevo |
|---------|-------|
| id_usuario | id |
| nombre | nombre |
| email | email |
| password | password |
| id_perfil | id_perfil |
| id_grupo | id_grupo |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Agencias → agencias
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| NombreIdentificador | nombre_identificador |
| NombreDeFantasia | nombre_de_fantasia |
| RUT | rut |
| Direccion | direccion |
| id_region | id_region |
| id_comuna | id_comuna |
| Telefono | telefono |
| Email | email |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Clientes → clientes
| Antiguo | Nuevo |
|---------|-------|
| id_cliente | id |
| nombreCliente | nombre_cliente |
| RUT | rut |
| razonSocial | razon_social |
| Direccion | direccion |
| id_region | id_region |
| id_comuna | id_comuna |
| Telefono | telefono |
| Email | email |
| id_tipo_cliente | id_tipo_cliente |
| id_grupo | id_grupo |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Proveedores → proveedores
| Antiguo | Nuevo |
|---------|-------|
| id_proveedor | id |
| nombreProveedor | nombre_proveedor |
| RUT | rut |
| razonSocial | razon_social |
| Direccion | direccion |
| id_region | id_region |
| id_comuna | id_comuna |
| Telefono | telefono |
| Email | email |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Soportes → soportes
| Antiguo | Nuevo |
|---------|-------|
| id_soporte | id |
| nombreidentificador | nombre_identificador |
| bonificacionano | bonificacion_ano |
| escala | escala |
| descripcion | descripcion |
| estado | estado |
| c_orden | c_orden |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: proveedor_soporte
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_proveedor | id_proveedor |
| id_soporte | id_soporte |
| created_at | created_at |

## Tabla: soporte_medios
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_soporte | id_soporte |
| id_medio | id_medio |
| created_at | created_at |

## Tabla: Productos → productos
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| NombreDelProducto | nombre_del_producto |
| Id_Cliente | id_cliente |
| Estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Contratos → contratos
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| IdMedios | id_medios |
| id_proveedor | id_proveedor |
| id_cliente | id_cliente |
| id_forma_pago | id_forma_pago |
| id_tipo_orden | id_tipo_orden |
| numero_contrato | numero_contrato |
| descripcion | descripcion |
| monto | monto |
| fecha_inicio | fecha_inicio |
| fecha_fin | fecha_fin |
| estado | estado |
| c_orden | c_orden |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Programas → programas
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_soporte | id_soporte |
| nombre_programa | nombre_programa |
| cod_prog_megatime | cod_prog_megatime |
| descripcion | descripcion |
| duracion | duracion |
| costo | costo |
| estado | estado |
| c_orden | c_orden |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: programa_medios
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_programa | id_programa |
| id_medio | id_medio |
| created_at | created_at |

## Tabla: Clasificacion → clasificacion
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_medio | id_medio |
| id_contrato | id_contrato |
| nombre_clasificacion | nombre_clasificacion |
| descripcion | descripcion |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Campania → campania
| Antiguo | Nuevo |
|---------|-------|
| id_campania | id |
| NombreCampania | nombre_campania |
| id_Cliente | id_cliente |
| id_Agencia | id_agencia |
| id_producto | id_producto |
| id_anio | id_anio |
| Presupuesto | presupuesto |
| descripcion | descripcion |
| estado | estado |
| c_orden | c_orden |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Temas → temas
| Antiguo | Nuevo |
|---------|-------|
| id_tema | id |
| nombre_tema | nombre_tema |
| id_medio | id_medio |
| id_calidad | id_calidad |
| descripcion | descripcion |
| estado | estado |
| c_orden | c_orden |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: campania_temas
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_campania | id_campania |
| id_temas | id_temas |
| created_at | created_at |

## Tabla: plan
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_cliente | id_cliente |
| id_campania | id_campania |
| anio | anio |
| mes | mes |
| nombre_plan | nombre_plan |
| descripcion | descripcion |
| presupuesto | presupuesto |
| estado | estado |
| estado2 | estado2 |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: campana_planes
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_campania | id_campania |
| id_plan | id_plan |
| created_at | created_at |

## Tabla: alternativa
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_soporte | id_soporte |
| id_programa | id_programa |
| id_contrato | id_contrato |
| id_tema | id_tema |
| id_clasificacion | id_clasificacion |
| numerorden | numero_orden |
| descripcion | descripcion |
| costo | costo |
| duracion | duracion |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: plan_alternativas
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_plan | id_plan |
| id_alternativa | id_alternativa |
| created_at | created_at |

## Tabla: OrdenesDePublicidad → ordenes_de_publicidad
| Antiguo | Nuevo |
|---------|-------|
| id_ordenes_de_comprar | id |
| numero_correlativo | numero_correlativo |
| id_cliente | id_cliente |
| id_campania | id_campania |
| id_plan | id_plan |
| alternativas_plan_orden | alternativas_plan_orden |
| alternativaActual | alternativa_actual |
| fecha_orden | fecha_orden |
| fecha_ejecucion | fecha_ejecucion |
| monto_total | monto_total |
| estado | estado |
| observaciones | observaciones |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Facturas → facturas
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_campania | id_campania |
| numero_factura | numero_factura |
| fecha_emision | fecha_emision |
| fecha_vencimiento | fecha_vencimiento |
| monto | monto |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: Comisiones → comisiones
| Antiguo | Nuevo |
|---------|-------|
| id_comision | id |
| id_cliente | id_cliente |
| porcentaje | porcentaje |
| monto_fijo | monto_fijo |
| tipo_comision | tipo_comision |
| descripcion | descripcion |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: contactocliente → contacto_cliente
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_cliente | id_cliente |
| nombre_contacto | nombre_contacto |
| cargo | cargo |
| telefono | telefono |
| email | email |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: contactos → contacto_proveedor
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_proveedor | id_proveedor |
| nombre_contacto | nombre_contacto |
| cargo | cargo |
| telefono | telefono |
| email | email |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: OtrosDatos → otros_datos
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| id_cliente | id_cliente |
| tipo_dato | tipo_dato |
| valor_dato | valor_dato |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

## Tabla: aviso
| Antiguo | Nuevo |
|---------|-------|
| id | id |
| titulo | titulo |
| mensaje | mensaje |
| tipo | tipo |
| fecha_inicio | fecha_inicio |
| fecha_fin | fecha_fin |
| estado | estado |
| created_at | created_at |
| updated_at | updated_at |
| (nuevo) | created_by |
| (nuevo) | updated_by |
| (nuevo) | deleted_at |

---

## Nuevas Tablas de Auditoría y Logs

### Tabla: audit_log
Registra todos los cambios en las tablas principales.

### Tabla: system_logs
Registra eventos del sistema.

### Tabla: system_config
Almacena configuraciones del sistema.

---

## Notas Importantes

1. **Cambios de Nombres de Tablas:**
   - `TipoCliente` → `tipo_cliente`
   - `FormaDePago` → `forma_de_pago`
   - `TipoGeneracionDeOrden` → `tipo_generacion_orden`
   - `Anios` → `anios`
   - `Meses` → `meses`
   - `TablaFormato` → `tabla_formato`
   - `Usuarios` → `usuarios`
   - `Agencias` → `agencias`
   - `Clientes` → `clientes`
   - `Proveedores` → `proveedores`
   - `Soportes` → `soportes`
   - `Productos` → `productos`
   - `Contratos` → `contratos`
   - `Programas` → `programas`
   - `Clasificacion` → `clasificacion`
   - `Campania` → `campania`
   - `Temas` → `temas`
   - `OrdenesDePublicidad` → `ordenes_de_publicidad`
   - `Facturas` → `facturas`
   - `Comisiones` → `comisiones`
   - `contactocliente` → `contacto_cliente`
   - `contactos` → `contacto_proveedor`
   - `OtrosDatos` → `otros_datos`

2. **Cambios de Nombres de Columnas:**
   - Todas las columnas ahora usan `snake_case`
   - Todas las tablas principales ahora tienen campos de auditoría: `created_by`, `updated_by`, `deleted_at`

3. **Campos de Auditoría:**
   - `created_by`: ID del usuario que creó el registro
   - `updated_by`: ID del usuario que actualizó el registro
   - `deleted_at`: Timestamp de eliminación lógica (soft delete)

