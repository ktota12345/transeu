import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper,
  Container,
  CircularProgress,
  Alert,
  Button,
  Grid
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SettingsIcon from '@mui/icons-material/Settings';
import { 
  getCompanyConfig,
  selectCompanyConfig, 
  selectCompanyStatus, 
  selectCompanyError 
} from '../../features/company/companySlice';
import CompanyProfile from './CompanyProfile';
import LogisticsBases from './LogisticsBases';
import OperationalSettings from './OperationalSettings';

// Panel komponentu
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CompanySettings = () => {
  const dispatch = useDispatch();
  const companyConfig = useSelector(selectCompanyConfig);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getCompanyConfig());
    }
  }, [status, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (status === 'loading' && !companyConfig.name) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Błąd podczas ładowania konfiguracji firmy: {error}
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => dispatch(getCompanyConfig())}
        >
          Spróbuj ponownie
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <BusinessIcon fontSize="large" />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1">
              Konfiguracja firmy
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Zarządzaj ustawieniami firmy, bazami logistycznymi i opcjami operacyjnymi
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="company settings tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<BusinessIcon />} 
              label="Profil firmy" 
              id="company-tab-0" 
              aria-controls="company-tabpanel-0" 
            />
            <Tab 
              icon={<WarehouseIcon />} 
              label="Bazy logistyczne" 
              id="company-tab-1" 
              aria-controls="company-tabpanel-1" 
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Ustawienia operacyjne" 
              id="company-tab-2" 
              aria-controls="company-tabpanel-2" 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CompanyProfile />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <LogisticsBases />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <OperationalSettings />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default CompanySettings;
