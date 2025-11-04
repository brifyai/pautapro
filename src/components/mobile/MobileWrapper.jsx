import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileLayout from './MobileLayout';

/**
 * Wrapper que aplica MobileLayout automáticamente a todas las páginas en móvil
 * En escritorio, renderiza el contenido sin modificaciones
 */
const MobileWrapper = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }
  
  return <>{children}</>;
};

export default MobileWrapper;