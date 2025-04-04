import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  selectCompanyConfig,
  selectCompanyStatus,
  selectCompanyError,
  saveCompanyConfig
} from '../../features/company/companySlice';

// Lista stref czasowych
const timezones = [
  'Europe/Warsaw',
  'Europe/Berlin',
  'Europe/Prague',
  'Europe/Budapest',
  'Europe/Vienna',
  'Europe/Paris',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Kiev'
];

// Lista walut
const currencies = [
  { code: 'PLN', name: 'Polski złoty' },
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'Dolar amerykański' },
  { code: 'GBP', name: 'Funt brytyjski' },
  { code: 'CZK', name: 'Korona czeska' },
  { code: 'HUF', name: 'Forint węgierski' },
  { code: 'NOK', name: 'Korona norweska' },
  { code: 'SEK', name: 'Korona szwedzka' },
  { code: 'DKK', name: 'Korona duńska' },
  { code: 'CHF', name: 'Frank szwajcarski' }
];

const OperationalSettings = () => {
  const dispatch = useDispatch();
  const companyConfig = useSelector(selectCompanyConfig);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);

  const [formData, setFormData] = useState({
    operationalSettings: {
      defaultCurrency: 'PLN',
      workingHours: {
        start: '08:00',
        end: '16:00'
      },
      timezone: 'Europe/Warsaw',
      weekendWork: false,
      defaultLanguage: 'pl',
      defaultDistanceUnit: 'km',
      defaultWeightUnit: 'kg',
      notificationSettings: {
        email: true,
        sms: false,
        push: true
      }
    }
  });

  useEffect(() => {
    if (companyConfig && companyConfig.operationalSettings) {
      setFormData({
        operationalSettings: {
          defaultCurrency: companyConfig.operationalSettings.defaultCurrency || 'PLN',
          workingHours: {
            start: companyConfig.operationalSettings.workingHours?.start || '08:00',
            end: companyConfig.operationalSettings.workingHours?.end || '16:00'
          },
          timezone: companyConfig.operationalSettings.timezone || 'Europe/Warsaw',
          weekendWork: companyConfig.operationalSettings.weekendWork || false,
          defaultLanguage: companyConfig.operationalSettings.defaultLanguage || 'pl',
          defaultDistanceUnit: companyConfig.operationalSettings.defaultDistanceUnit || 'km',
          defaultWeightUnit: companyConfig.operationalSettings.defaultWeightUnit || 'kg',
          notificationSettings: {
            email: companyConfig.operationalSettings.notificationSettings?.email !== false,
            sms: companyConfig.operationalSettings.notificationSettings?.sms || false,
            push: companyConfig.operationalSettings.notificationSettings?.push !== false
          }
        }
      });
    }
  }, [companyConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'operationalSettings') {
        setFormData({
          ...formData,
          operationalSettings: {
            ...formData.operationalSettings,
            [child]: value
          }
        });
      } else if (parent === 'workingHours') {
        setFormData({
          ...formData,
          operationalSettings: {
            ...formData.operationalSettings,
            workingHours: {
              ...formData.operationalSettings.workingHours,
              [child]: value
            }
          }
        });
      } else if (parent === 'notificationSettings') {
        setFormData({
          ...formData,
          operationalSettings: {
            ...formData.operationalSettings,
            notificationSettings: {
              ...formData.operationalSettings.notificationSettings,
              [child]: value
            }
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'weekendWork') {
      setFormData({
        ...formData,
        operationalSettings: {
          ...formData.operationalSettings,
          weekendWork: checked
        }
      });
    } else if (name.startsWith('notificationSettings.')) {
      const settingName = name.split('.')[1];
      setFormData({
        ...formData,
        operationalSettings: {
          ...formData.operationalSettings,
          notificationSettings: {
            ...formData.operationalSettings.notificationSettings,
            [settingName]: checked
          }
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Zapisz dane z formularza do Redux store
    dispatch(saveCompanyConfig({
      ...companyConfig,
      operationalSettings: formData.operationalSettings,
      updatedAt: new Date().toISOString()
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Podstawowe ustawienia operacyjne */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Podstawowe ustawienia operacyjne
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="currency-label">Domyślna waluta</InputLabel>
                  <Select
                    labelId="currency-label"
                    id="defaultCurrency"
                    name="operationalSettings.defaultCurrency"
                    value={formData.operationalSettings.defaultCurrency}
                    onChange={handleInputChange}
                    label="Domyślna waluta"
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="timezone-label">Strefa czasowa</InputLabel>
                  <Select
                    labelId="timezone-label"
                    id="timezone"
                    name="operationalSettings.timezone"
                    value={formData.operationalSettings.timezone}
                    onChange={handleInputChange}
                    label="Strefa czasowa"
                  >
                    {timezones.map((timezone) => (
                      <MenuItem key={timezone} value={timezone}>
                        {timezone}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="language-label">Domyślny język</InputLabel>
                  <Select
                    labelId="language-label"
                    id="defaultLanguage"
                    name="operationalSettings.defaultLanguage"
                    value={formData.operationalSettings.defaultLanguage}
                    onChange={handleInputChange}
                    label="Domyślny język"
                  >
                    <MenuItem value="pl">Polski</MenuItem>
                    <MenuItem value="en">Angielski</MenuItem>
                    <MenuItem value="de">Niemiecki</MenuItem>
                    <MenuItem value="cs">Czeski</MenuItem>
                    <MenuItem value="sk">Słowacki</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Godzina rozpoczęcia pracy"
                  type="time"
                  name="workingHours.start"
                  value={formData.operationalSettings.workingHours.start}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Godzina zakończenia pracy"
                  type="time"
                  name="workingHours.end"
                  value={formData.operationalSettings.workingHours.end}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operationalSettings.weekendWork}
                      onChange={handleSwitchChange}
                      name="weekendWork"
                      color="primary"
                    />
                  }
                  label="Praca w weekendy"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Ustawienia jednostek */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ustawienia jednostek
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="distance-unit-label">Jednostka odległości</InputLabel>
                  <Select
                    labelId="distance-unit-label"
                    id="defaultDistanceUnit"
                    name="operationalSettings.defaultDistanceUnit"
                    value={formData.operationalSettings.defaultDistanceUnit}
                    onChange={handleInputChange}
                    label="Jednostka odległości"
                  >
                    <MenuItem value="km">Kilometry (km)</MenuItem>
                    <MenuItem value="mi">Mile (mi)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="weight-unit-label">Jednostka wagi</InputLabel>
                  <Select
                    labelId="weight-unit-label"
                    id="defaultWeightUnit"
                    name="operationalSettings.defaultWeightUnit"
                    value={formData.operationalSettings.defaultWeightUnit}
                    onChange={handleInputChange}
                    label="Jednostka wagi"
                  >
                    <MenuItem value="kg">Kilogramy (kg)</MenuItem>
                    <MenuItem value="t">Tony (t)</MenuItem>
                    <MenuItem value="lb">Funty (lb)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Ustawienia powiadomień */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ustawienia powiadomień
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operationalSettings.notificationSettings.email}
                      onChange={handleSwitchChange}
                      name="notificationSettings.email"
                      color="primary"
                    />
                  }
                  label="Powiadomienia e-mail"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operationalSettings.notificationSettings.sms}
                      onChange={handleSwitchChange}
                      name="notificationSettings.sms"
                      color="primary"
                    />
                  }
                  label="Powiadomienia SMS"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operationalSettings.notificationSettings.push}
                      onChange={handleSwitchChange}
                      name="notificationSettings.push"
                      color="primary"
                    />
                  }
                  label="Powiadomienia push"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Przycisk zapisz */}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Zapisywanie...
              </>
            ) : (
              'Zapisz wszystkie ustawienia'
            )}
          </Button>
        </Grid>
        
        {/* Komunikat o błędzie */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">
              Błąd podczas zapisywania ustawień: {error}
            </Alert>
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default OperationalSettings;
