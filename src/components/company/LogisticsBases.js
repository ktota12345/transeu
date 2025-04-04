import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import MapIcon from '@mui/icons-material/Map';
import { 
  getLogisticsBases, 
  addLogisticsBase, 
  editLogisticsBase, 
  removeLogisticsBase,
  selectLogisticsBases,
  selectCompanyStatus,
  selectCompanyError
} from '../../features/company/companySlice';
import MapContainer from './MapContainer';

// Lista krajów
const countries = [
  { code: 'PL', name: 'Polska' },
  { code: 'DE', name: 'Niemcy' },
  { code: 'CZ', name: 'Czechy' },
  { code: 'SK', name: 'Słowacja' },
  { code: 'LT', name: 'Litwa' },
  { code: 'UA', name: 'Ukraina' },
  { code: 'BY', name: 'Białoruś' },
  { code: 'RU', name: 'Rosja' },
  { code: 'AT', name: 'Austria' },
  { code: 'FR', name: 'Francja' },
  { code: 'ES', name: 'Hiszpania' },
  { code: 'IT', name: 'Włochy' },
  { code: 'NL', name: 'Holandia' },
  { code: 'BE', name: 'Belgia' },
  { code: 'GB', name: 'Wielka Brytania' }
];

const LogisticsBases = () => {
  const dispatch = useDispatch();
  const bases = useSelector(selectLogisticsBases);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBase, setCurrentBase] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [baseToDelete, setBaseToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState({ lat: 52.2297, lng: 21.0122 }); // Default Warsaw

  const defaultBaseForm = {
    name: '',
    type: 'warehouse', // warehouse, terminal, office
    address: {
      street: '',
      postalCode: '',
      city: '',
      country: 'PL'
    },
    coordinates: {
      latitude: '',
      longitude: ''
    },
    operationalRange: 50, // km range for operations
    services: [], // services available at this base
    contactPerson: {
      name: '',
      phone: '',
      email: ''
    },
    workingHours: {
      weekdays: {
        start: '08:00',
        end: '18:00'
      },
      saturday: {
        start: '08:00',
        end: '14:00'
      },
      sunday: {
        active: false,
        start: '',
        end: ''
      }
    }
  };

  const [baseForm, setBaseForm] = useState(defaultBaseForm);

  useEffect(() => {
    dispatch(getLogisticsBases());
  }, [dispatch]);

  const handleOpenMap = (coordinates) => {
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      setMapLocation({
        lat: parseFloat(coordinates.latitude),
        lng: parseFloat(coordinates.longitude)
      });
    }
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  const handleMapLocationSelect = (location) => {
    setBaseForm({
      ...baseForm,
      coordinates: {
        latitude: location.lat.toFixed(6),
        longitude: location.lng.toFixed(6)
      }
    });
    setShowMap(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!baseForm.name) errors.name = 'Nazwa bazy jest wymagana';
    if (!baseForm.address.street) errors.street = 'Ulica jest wymagana';
    if (!baseForm.address.postalCode) errors.postalCode = 'Kod pocztowy jest wymagany';
    if (!baseForm.address.city) errors.city = 'Miasto jest wymagane';
    
    // Validate coordinates if provided
    if (baseForm.coordinates.latitude && isNaN(parseFloat(baseForm.coordinates.latitude))) {
      errors.latitude = 'Szerokość geograficzna musi być liczbą';
    }
    if (baseForm.coordinates.longitude && isNaN(parseFloat(baseForm.coordinates.longitude))) {
      errors.longitude = 'Długość geograficzna musi być liczbą';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBase = () => {
    setBaseForm(defaultBaseForm);
    setCurrentBase(null);
    setOpenDialog(true);
  };

  const handleEditBase = (base) => {
    setBaseForm({
      ...base,
      // Ensure all required properties exist
      address: base.address || defaultBaseForm.address,
      coordinates: base.coordinates || defaultBaseForm.coordinates,
      workingHours: base.workingHours || defaultBaseForm.workingHours,
      contactPerson: base.contactPerson || defaultBaseForm.contactPerson
    });
    setCurrentBase(base);
    setOpenDialog(true);
  };

  const handleDeleteBase = (base) => {
    setBaseToDelete(base);
    setConfirmDelete(true);
  };

  const confirmDeleteBase = () => {
    if (baseToDelete) {
      dispatch(removeLogisticsBase(baseToDelete.id));
    }
    setConfirmDelete(false);
    setBaseToDelete(null);
  };

  const cancelDeleteBase = () => {
    setConfirmDelete(false);
    setBaseToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBaseForm({
        ...baseForm,
        [parent]: {
          ...baseForm[parent],
          [child]: value
        }
      });
    } else {
      setBaseForm({
        ...baseForm,
        [name]: value
      });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (currentBase) {
      dispatch(editLogisticsBase({ id: currentBase.id, baseData: baseForm }));
    } else {
      dispatch(addLogisticsBase(baseForm));
    }
    
    setOpenDialog(false);
  };

  if (status === 'loading' && bases.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Bazy logistyczne
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBase}
        >
          Dodaj bazę
        </Button>
      </Box>

      {status === 'failed' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Wystąpił błąd: {error}
        </Alert>
      )}

      {bases.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WarehouseIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Brak zdefiniowanych baz logistycznych
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Dodaj swoją pierwszą bazę logistyczną, aby móc lepiej zarządzać operacjami transportowymi.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBase}
          >
            Dodaj bazę
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bases.map((base) => (
            <Grid item xs={12} md={6} key={base.id}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarehouseIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{base.name}</Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Pokaż na mapie">
                      <IconButton
                        onClick={() => handleOpenMap(base.coordinates)}
                        disabled={!base.coordinates || !base.coordinates.latitude}
                      >
                        <MapIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edytuj">
                      <IconButton onClick={() => handleEditBase(base)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Usuń">
                      <IconButton onClick={() => handleDeleteBase(base)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${base.address?.street || ''}, ${base.address?.postalCode || ''} ${base.address?.city || ''}`}
                      secondary={countries.find(c => c.code === base.address?.country)?.name || base.address?.country || ''}
                    />
                  </ListItem>
                  {base.coordinates && base.coordinates.latitude && (
                    <ListItem>
                      <ListItemText
                        secondary={`Koordynaty: ${base.coordinates.latitude}, ${base.coordinates.longitude}`}
                      />
                    </ListItem>
                  )}
                  {base.operationalRange && (
                    <ListItem>
                      <ListItemText
                        secondary={`Zasięg operacyjny: ${base.operationalRange} km`}
                      />
                    </ListItem>
                  )}
                  {base.contactPerson && base.contactPerson.name && (
                    <ListItem>
                      <ListItemText
                        secondary={`Kontakt: ${base.contactPerson.name}, ${base.contactPerson.phone || ''}`}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog dodawania/edycji bazy */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentBase ? 'Edycja bazy logistycznej' : 'Dodaj nową bazę logistyczną'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }} id="logistics-base-form">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Nazwa bazy"
                  value={baseForm.name}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="type"
                  label="Typ bazy"
                  value={baseForm.type}
                  onChange={handleFormChange}
                  fullWidth
                  select
                >
                  <MenuItem value="warehouse">Magazyn</MenuItem>
                  <MenuItem value="terminal">Terminal</MenuItem>
                  <MenuItem value="office">Biuro</MenuItem>
                  <MenuItem value="depot">Depot</MenuItem>
                  <MenuItem value="cross_dock">Cross-dock</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Adres
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address.street"
                  label="Ulica i numer"
                  value={baseForm.address.street}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  error={!!formErrors.street}
                  helperText={formErrors.street}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address.postalCode"
                  label="Kod pocztowy"
                  value={baseForm.address.postalCode}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  error={!!formErrors.postalCode}
                  helperText={formErrors.postalCode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address.city"
                  label="Miasto"
                  value={baseForm.address.city}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  error={!!formErrors.city}
                  helperText={formErrors.city}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address.country"
                  label="Kraj"
                  value={baseForm.address.country}
                  onChange={handleFormChange}
                  fullWidth
                  select
                >
                  {countries.map(country => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Współrzędne geograficzne
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  name="coordinates.latitude"
                  label="Szerokość geograficzna"
                  value={baseForm.coordinates.latitude}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!formErrors.latitude}
                  helperText={formErrors.latitude}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  name="coordinates.longitude"
                  label="Długość geograficzna"
                  value={baseForm.coordinates.longitude}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!formErrors.longitude}
                  helperText={formErrors.longitude}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => handleOpenMap(baseForm.coordinates)}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  <MapIcon sx={{ mr: 1 }} />
                  Mapa
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="operationalRange"
                  label="Zasięg operacyjny (km)"
                  type="number"
                  value={baseForm.operationalRange}
                  onChange={handleFormChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 1000 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Kontakt
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="contactPerson.name"
                  label="Osoba kontaktowa"
                  value={baseForm.contactPerson.name}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="contactPerson.phone"
                  label="Telefon"
                  value={baseForm.contactPerson.phone}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="contactPerson.email"
                  label="Email"
                  value={baseForm.contactPerson.email}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <CircularProgress size={24} />
            ) : currentBase ? 'Zapisz zmiany' : 'Dodaj bazę'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog potwierdzenia usunięcia */}
      <Dialog open={confirmDelete} onClose={cancelDeleteBase}>
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
        <DialogContent>
          <Typography>
            Czy na pewno chcesz usunąć bazę logistyczną {baseToDelete?.name}?
            Ta operacja jest nieodwracalna.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteBase}>Anuluj</Button>
          <Button 
            onClick={confirmDeleteBase} 
            variant="contained" 
            color="error"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <CircularProgress size={24} /> : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Komponent mapy */}
      <Dialog open={showMap} onClose={handleCloseMap} maxWidth="md" fullWidth>
        <DialogTitle>Wybierz lokalizację na mapie</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <MapContainer 
              location={mapLocation} 
              onLocationSelect={handleMapLocationSelect}
              interactive={true}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LogisticsBases;
