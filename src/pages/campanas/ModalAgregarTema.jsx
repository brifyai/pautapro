import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Paper,
    Radio,
    FormControlLabel,
    Chip,
    InputAdornment,
    Switch
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TopicIcon from '@mui/icons-material/Topic';
import TimerIcon from '@mui/icons-material/Timer';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CodeIcon from '@mui/icons-material/Code';
import VerifiedIcon from '@mui/icons-material/Verified';
import CategoryIcon from '@mui/icons-material/Category';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

const CustomCheckboxList = ({ medios, selectedMedios, onChange, onMedioChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleToggle = () => setIsOpen(!isOpen);
    
    const handleMedioSelect = (medio) => {
        // Como solo se puede seleccionar un medio, simplemente reemplazamos la selección
        const medioId = medio.id;
        const newSelection = [medioId]; // Array con un solo medio
        onChange(newSelection);
        onMedioChange(medio);
    };

    return (
        <FormControl fullWidth>
            <Box sx={{ position: 'relative' }}>
                <Box
                    onClick={handleToggle}
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        p: 1,
                        minHeight: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5
                    }}
                >
                    {selectedMedios.length > 0 ? (
                        selectedMedios.map(medioId => {
                            const medio = medios.find(m => m.id === medioId);
                            return medio ? (
                                <Chip
                                    key={medio.id}
                                    label={medio.nombre_medio}
                                    onDelete={() => {
                                        onChange([]); // Limpiar selección
                                        onMedioChange(null); // Resetear campos visibles
                                    }}
                                    size="small"
                                />
                            ) : null;
                        })
                    ) : (
                        <Typography color="text.secondary">Seleccionar medio</Typography>
                    )}
                </Box>
                {isOpen && (
                    <Paper
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            mt: 1,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: 3
                        }}
                    >
                        <Box sx={{ p: 1 }}>
                            {medios.map((medio) => (
                                <FormControlLabel
                                    key={medio.id}
                                    control={
                                        <Radio
                                            checked={selectedMedios.includes(medio.id)}
                                            onChange={() => handleMedioSelect(medio)}
                                        />
                                    }
                                    label={medio.nombre_medio}
                                />
                            ))}
                        </Box>
                    </Paper>
                )}
            </Box>
        </FormControl>
    );
};

const ModalAgregarTema = ({ open, onClose, onTemaAdded, idCampania, medioId, medioNombre }) => {
    const [formData, setFormData] = useState({
        nombre_tema: '',
        descripcion: '',
        id_calidad: '',
        id_medio: medioId || '', // Inicializar con medioId si existe
        estado: true,
        c_orden: false
    });

    const [loading, setLoading] = useState(false);
    const [medios, setMedios] = useState([]);
    const [calidades, setCalidades] = useState([]);

    useEffect(() => {
        fetchMedios();
        fetchCalidades();
    }, [medioId]);

    const fetchMedios = async () => {
        try {
            const { data, error } = await supabase
                .from('medios')
                .select('id, nombre_medio')
                .order('nombre_medio');

            if (error) {
                console.error('Error al cargar medios:', error);
                throw error;
            }

            console.log('Datos recibidos de medios:', data);
            setMedios(data || []);
        } catch (error) {
            console.error('Error al cargar medios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los medios: ' + error.message
            });
        }
    };

    const fetchCalidades = async () => {
        try {
            const { data, error } = await supabase
                .from('calidad')
                .select('id, nombrecalidad')
                .order('nombrecalidad');

            if (error) throw error;
            console.log('Calidades cargadas:', data);
            setCalidades(data || []);
        } catch (error) {
            console.error('Error al cargar calidades:', error);
        }
    };

    const handleMedioChange = (event) => {
        const medioId = Number(event.target.value); // Convertir a número
        console.log('Medio seleccionado ID:', medioId);

        setFormData(prev => ({
            ...prev,
            id_medio: medioId
        }));
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            // 1. Obtener el siguiente ID disponible para Temas
            const { data: maxIdData, error: maxIdError } = await supabase
                .from('temas')
                .select('id_tema')
                .order('id_tema', { ascending: false })
                .limit(1);

            if (maxIdError) {
                console.error('Error al obtener el máximo id_tema:', maxIdError);
                throw maxIdError;
            }

            const nextId = maxIdData.length > 0 ? maxIdData[0].id_tema + 1 : 1;

            // 2. Insertar en la tabla Temas con el ID específico
            const temaDataToInsert = {
                id_tema: nextId,
                nombre_tema: formData.nombre_tema,
                descripcion: formData.descripcion || null,
                id_calidad: formData.id_calidad || null,
                estado: formData.estado,
                c_orden: formData.c_orden,
                id_medio: formData.id_medio || null
            };

            console.log('Datos a insertar en Temas:', temaDataToInsert);

            const { data: temaData, error: temaError } = await supabase
                .from('temas')
                .insert([temaDataToInsert])
                .select()
                .single();

            if (temaError) {
                console.error('Error al insertar tema:', temaError);
                throw temaError;
            }

            console.log('Tema insertado:', temaData);

            // 3. Insertar en la tabla campania_temas
            const { error: campaniaTemasError } = await supabase
                .from('campania_temas')
                .insert([{
                    id_campania: idCampania,
                    id_temas: nextId
                }]);

            if (campaniaTemasError) {
                console.error('Error al insertar en campania_temas:', campaniaTemasError);
                throw campaniaTemasError;
            }

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Tema agregado correctamente'
            });

            // Llamar a onTemaAdded para actualizar la lista de temas
            if (typeof onTemaAdded === 'function') {
                await onTemaAdded();
            }
            
            onClose();

        } catch (error) {
            console.error('Error completo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo agregar el tema: ' + (error.message || 'Error desconocido')
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Agregar Tema
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                    <Grid item xs={12}>
                            {medioId ? (
                                <TextField
                                    fullWidth
                                    label="Medio"
                                    value={medioNombre || ''}
                                    disabled
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CategoryIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel id="medio-select-label">Medio</InputLabel>
                                    <Select
                                        labelId="medio-select-label"
                                        value={formData.id_medio}
                                        onChange={handleMedioChange}
                                        name="id_medio"
                                        label="Medio"
                                        required
                                    >
                                        <MenuItem value="">
                                            <em>Seleccione un medio</em>
                                        </MenuItem>
                                        {medios.map((medio) => (
                                            <MenuItem key={medio.id} value={medio.id}>
                                                {medio.nombre_medio}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre de Tema"
                                name="nombre_tema"
                                value={formData.nombre_tema}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TopicIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descripción"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EditIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Calidad</InputLabel>
                                <Select
                                    value={formData.id_calidad || ''}
                                    onChange={handleChange}
                                    name="id_calidad"
                                    label="Calidad"
                                >
                                    <MenuItem value="">
                                        <em>Seleccione una calidad</em>
                                    </MenuItem>
                                    {calidades.map((calidad) => (
                                        <MenuItem key={calidad.id} value={calidad.id}>
                                            {calidad.nombrecalidad}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.estado}
                                            onChange={handleChange}
                                            name="estado"
                                            color="primary"
                                        />
                                    }
                                    label="Estado Activo"
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ModalAgregarTema;
