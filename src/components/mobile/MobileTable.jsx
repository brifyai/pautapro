import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Avatar,
  Button,
  TablePagination
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const MobileTable = ({
  data,
  columns,
  title,
  onEdit,
  onDelete,
  onView,
  actions = true,
  searchable = false,
  pagination = true,
  pageSize = 10
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginación
  const paginatedData = pagination
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data;

  const renderCellValue = (row, column) => {
    const value = row[column.field];

    if (column.renderCell) {
      return column.renderCell({ row, value });
    }

    if (column.type === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('es-CL');
    }

    if (column.type === 'currency' && value) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(value);
    }

    if (column.type === 'number' && value) {
      return value.toLocaleString('es-CL');
    }

    return value || '-';
  };

  const getPriorityColumns = () => {
    // Columnas principales que se muestran en la vista colapsada
    return columns.filter(col => !col.hideInMobile).slice(0, 3);
  };

  const getSecondaryColumns = () => {
    // Columnas adicionales que se muestran expandidas
    return columns.filter(col => !col.hideInMobile).slice(3);
  };

  return (
    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {title && (
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2,
          borderRadius: '16px 16px 0 0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
      )}

      <CardContent sx={{ p: 0 }}>
        {paginatedData.map((row, index) => {
          const isExpanded = expandedRows.has(row.id || index);
          const priorityColumns = getPriorityColumns();
          const secondaryColumns = getSecondaryColumns();

          return (
            <Box key={row.id || index}>
              {/* Fila principal */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  },
                  cursor: secondaryColumns.length > 0 ? 'pointer' : 'default'
                }}
                onClick={() => secondaryColumns.length > 0 && toggleRowExpansion(row.id || index)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    {/* Columnas principales */}
                    {priorityColumns.map((column, colIndex) => (
                      <Box key={column.field} sx={{ mb: colIndex < priorityColumns.length - 1 ? 1 : 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {column.headerName}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {renderCellValue(row, column)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Acciones */}
                    {actions && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {onView && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(row);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            sx={{ color: 'success.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}

                    {/* Botón de expansión */}
                    {secondaryColumns.length > 0 && (
                      <IconButton size="small">
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Detalles expandidos */}
              {secondaryColumns.length > 0 && (
                <Collapse in={isExpanded}>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(102, 126, 234, 0.02)', borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                      Más detalles:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      {secondaryColumns.map((column) => (
                        <Box key={column.field}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {column.headerName}:
                          </Typography>
                          <Typography variant="body2">
                            {renderCellValue(row, column)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Collapse>
              )}
            </Box>
          );
        })}

        {/* Paginación */}
        {pagination && data.length > rowsPerPage && (
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <TablePagination
              component="div"
              count={data.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          </Box>
        )}

        {/* Estado vacío */}
        {data.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay datos para mostrar
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileTable;