import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import {
  selectCompanyConfig,
  selectCompanyStatus,
  selectCompanyError,
  saveCompanyConfig
} from '../../features/company/companySlice';

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

const CompanyProfile = () => {
  const dispatch = useDispatch();
  const companyConfig = useSelector(selectCompanyConfig);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);

  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    address: {
      street: '',
      postalCode: '',
      city: '',
      country: 'PL'
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    logo: null
  });

  // Aktualizuj formularz gdy zmieniają się dane z Redux
  useEffect(() => {
    if (companyConfig) {
      setFormData({
        name: companyConfig.name || '',
        taxId: companyConfig.taxId || '',
        address: {
          street: companyConfig.address?.street || '',
          postalCode: companyConfig.address?.postalCode || '',
          city: companyConfig.address?.city || '',
          country: companyConfig.address?.country || 'PL'
        },
        contact: {
          email: companyConfig.contact?.email || '',
          phone: companyConfig.contact?.phone || '',
          website: companyConfig.contact?.website || ''
        },
        logo: companyConfig.logo || null
      });
    }
  }, [companyConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Zapisz dane z formularza do Redux store
    dispatch(saveCompanyConfig({
      ...companyConfig,
      ...formData,
      updatedAt: new Date().toISOString()
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={formData.logo}
                alt="Logo firmy"
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                {!formData.logo && <BusinessIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Logo firmy
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Wybierz plik
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleLogoChange}
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Zalecany rozmiar: 400x400 px, format PNG lub JPG
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Dane podstawowe
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Nazwa firmy"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="taxId"
                  label="NIP / VAT ID"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Adres firmy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="address.street"
                  label="Ulica i numer"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address.postalCode"
                  label="Kod pocztowy"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address.city"
                  label="Miasto"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address.country"
                  label="Kraj"
                  select
                  value={formData.address.country}
                  onChange={handleInputChange}
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dane kontaktowe
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="contact.email"
                  label="Email"
                  type="email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="contact.phone"
                  label="Telefon"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="contact.website"
                  label="Strona internetowa"
                  value={formData.contact.website}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          {status === 'failed' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {status === 'succeeded' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Dane firmy zostały pomyślnie zapisane
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={status === 'loading'}
            sx={{ mr: 1 }}
          >
            {status === 'loading' ? <CircularProgress size={24} /> : 'Zapisz zmiany'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setFormData({ ...companyConfig })}
          >
            Anuluj zmiany
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CompanyProfile;
