import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress, Chip } from '@mui/material';

const GRADIENTS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #F76B8A 0%, #FA709A 100%)',
  success: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
  warning: 'linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)',
  info: 'linear-gradient(135deg, #43C6AC 0%, #191654 100%)',
  default: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
};

const getGradient = (color) => GRADIENTS[color] || GRADIENTS.default;

/**
 * MobileCard
 * Tarjeta reutilizable para vistas móviles con:
 * - Header con gradiente, ícono y título
 * - Valor principal y subtítulo
 * - Indicadores (chips) opcionales
 * - Barra de progreso opcional
 * - Contenido adicional por children
 */
function MobileCard({
  title,
  value,
  subtitle,
  trend,          // 'up' | 'down' | null
  trendValue,     // string con porcentaje ej: '12.4%'
  icon,           // ReactNode (ícono MUI)
  color = 'primary',
  progress,       // etiqueta para barra de progreso
  progressValue,  // número 0-100
  chips = [],     // [{ label, color }]
  children,
  sx = {},
  titleColor,     // color personalizado para el título
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        mb: 2,
        border: '1px solid rgba(2, 6, 23, 0.06)',
        boxShadow: '0 8px 24px rgba(2, 6, 23, 0.06)',
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          background: getGradient(color),
          color: 'white',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.2,
            color: titleColor || 'white !important',
            '&.MuiTypography-root': {
              color: 'white !important'
            }
          }}
        >
          {title}
        </Typography>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Valor principal + tendencia */}
        {(value !== undefined && value !== null) || subtitle || trend ? (
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              {value !== undefined && value !== null && (
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {value}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            {trend && trendValue && (
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  color: trend === 'up' ? '#0a7f3f' : '#b42318',
                  backgroundColor: trend === 'up' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                  border: `1px solid ${trend === 'up' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                }}
              >
                {trend === 'up' ? '▲' : '▼'} {trendValue}
              </Box>
            )}
          </Box>
        ) : null}

        {/* Chips */}
        {Array.isArray(chips) && chips.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {chips.map((c, idx) => (
              <Chip
                key={idx}
                label={c.label}
                size="small"
                color={c.color || 'default'}
                sx={{ fontWeight: 600, height: 22 }}
              />
            ))}
          </Box>
        )}

        {/* Progreso */}
        {typeof progressValue === 'number' && (
          <Box sx={{ my: 1 }}>
            {progress && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {progress}
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {progressValue}%
                </Typography>
              </Box>
            )}
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 6,
                backgroundColor: 'rgba(2, 6, 23, 0.06)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: getGradient(color),
                },
              }}
            />
          </Box>
        )}

        {/* Contenido adicional */}
        {children && <Box sx={{ mt: 1 }}>{children}</Box>}
      </CardContent>
    </Card>
  );
}

export default MobileCard;