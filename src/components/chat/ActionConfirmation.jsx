/**
 * Action Confirmation Component
 * Solicita confirmación para acciones críticas (eliminar, cambiar estado, etc.)
 * Integrado con el Asistente IA
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * Componente de confirmación de acciones
 */
export const ActionConfirmation = ({
  open,
  action,
  entity,
  entityName,
  details,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [forceDelete, setForceDelete] = useState(false);
  const [understood, setUnderstood] = useState(false);

  if (!open || !action) return null;

  const actionConfig = getActionConfig(action);
  const requiresForce = action === 'DELETE' && details?.hasOrders;
  const requiresUnderstanding = action === 'DELETE' || action === 'CHANGE_STATUS';

  const handleConfirm = () => {
    if (requiresUnderstanding && !understood) {
      alert('Debe confirmar que entiende las consecuencias');
      return;
    }
    onConfirm({ force: forceDelete });
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        {actionConfig.icon}
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {actionConfig.title}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {/* Alerta de severidad */}
        <Alert severity={actionConfig.severity} sx={{ mb: 2 }}>
          {actionConfig.message}
        </Alert>

        {/* Información de la entidad */}
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            Entidad a {action === 'DELETE' ? 'eliminar' : 'modificar'}:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {entityName}
          </Typography>
          {entity && (
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
              ID: {entity}
            </Typography>
          )}
        </Box>

        {/* Detalles específicos según acción */}
        {action === 'DELETE' && details?.hasOrders && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              ⚠️ Advertencia: Dependencias Detectadas
            </Typography>
            <Typography variant="body2">
              Este elemento tiene órdenes o planes asociados. Seleccione "Forzar eliminación" para continuar.
            </Typography>
          </Alert>
        )}

        {action === 'CHANGE_STATUS' && details?.newStatus && (
          <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              Nuevo estado:
            </Typography>
            <Chip
              label={details.newStatus}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        )}

        {action === 'CHANGE_PRIORITY' && details?.newPriority && (
          <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#fff3e0', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              Nueva prioridad:
            </Typography>
            <Chip
              label={details.newPriority}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        )}

        {/* Consecuencias */}
        {actionConfig.consequences && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Consecuencias:
            </Typography>
            <List dense>
              {actionConfig.consequences.map((consequence, idx) => (
                <ListItem key={idx} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <InfoIcon sx={{ fontSize: 18, color: '#f57c00' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={consequence}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Opciones de confirmación */}
        {requiresForce && (
          <FormControlLabel
            control={
              <Checkbox
                checked={forceDelete}
                onChange={(e) => setForceDelete(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Sí, forzar eliminación (ignorar dependencias)
              </Typography>
            }
            sx={{ mb: 1, display: 'block' }}
          />
        )}

        {requiresUnderstanding && (
          <FormControlLabel
            control={
              <Checkbox
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Entiendo las consecuencias y deseo continuar
              </Typography>
            }
            sx={{ display: 'block' }}
          />
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={
            loading ||
            (requiresUnderstanding && !understood) ||
            (requiresForce && !forceDelete)
          }
          variant="contained"
          color={actionConfig.buttonColor}
          sx={{ fontWeight: 'bold' }}
        >
          {loading ? 'Procesando...' : actionConfig.buttonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Configuración de acciones
 */
const getActionConfig = (action) => {
  const configs = {
    DELETE: {
      title: 'Confirmar Eliminación',
      message: 'Esta acción no se puede deshacer. ¿Está seguro de que desea continuar?',
      icon: <DeleteIcon sx={{ color: '#d32f2f' }} />,
      severity: 'error',
      buttonLabel: 'Eliminar',
      buttonColor: 'error',
      consequences: [
        'El registro será eliminado permanentemente',
        'No se podrá recuperar la información',
        'Esto afectará todos los reportes históricos'
      ]
    },
    CHANGE_STATUS: {
      title: 'Cambiar Estado',
      message: 'Está a punto de cambiar el estado de este elemento.',
      icon: <Edit as EditIcon sx={{ color: '#1976d2' }} />,
      severity: 'info',
      buttonLabel: 'Cambiar Estado',
      buttonColor: 'primary',
      consequences: [
        'El estado será actualizado inmediatamente',
        'Los usuarios verán el nuevo estado',
        'Esto puede afectar flujos de trabajo'
      ]
    },
    CHANGE_PRIORITY: {
      title: 'Cambiar Prioridad',
      message: 'Está a punto de cambiar la prioridad de esta orden.',
      icon: <WarningIcon sx={{ color: '#f57c00' }} />,
      severity: 'warning',
      buttonLabel: 'Cambiar Prioridad',
      buttonColor: 'warning',
      consequences: [
        'La prioridad será actualizada',
        'Esto puede afectar el orden de procesamiento',
        'Los responsables serán notificados'
      ]
    },
    BLOCK: {
      title: 'Bloquear Elemento',
      message: 'Está a punto de bloquear este elemento.',
      icon: <BlockIcon sx={{ color: '#d32f2f' }} />,
      severity: 'warning',
      buttonLabel: 'Bloquear',
      buttonColor: 'error',
      consequences: [
        'El elemento será bloqueado',
        'No se podrá usar en nuevas operaciones',
        'Los usuarios verán que está bloqueado'
      ]
    },
    CONFIRM: {
      title: 'Confirmar Acción',
      message: 'Por favor confirme que desea realizar esta acción.',
      icon: <CheckCircleIcon sx={{ color: '#388e3c' }} />,
      severity: 'info',
      buttonLabel: 'Confirmar',
      buttonColor: 'success'
    }
  };

  return configs[action] || configs.CONFIRM;
};

/**
 * Hook para manejar confirmaciones
 */
export const useActionConfirmation = () => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    entity: null,
    entityName: null,
    details: null,
    onConfirm: null,
    onCancel: null
  });

  const openConfirmation = (action, entity, entityName, details = {}) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        open: true,
        action,
        entity,
        entityName,
        details,
        onConfirm: (options) => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
          resolve({ confirmed: true, ...options });
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
          resolve({ confirmed: false });
        }
      });
    });
  };

  const closeConfirmation = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  return {
    confirmDialog,
    openConfirmation,
    closeConfirmation,
    DialogComponent: (
      <ActionConfirmation
        open={confirmDialog.open}
        action={confirmDialog.action}
        entity={confirmDialog.entity}
        entityName={confirmDialog.entityName}
        details={confirmDialog.details}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    )
  };
};

export default ActionConfirmation;
