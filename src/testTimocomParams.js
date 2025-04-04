// Skrypt testowy do sprawdzenia parametrów zapytania TIMOCOM dla agenta o ID 2
const axios = require('axios');

// Funkcja buildSearchParamsFromAgentConfig 
const buildSearchParamsFromAgentConfig = (agentConfig) => {
  const searchParams = {
    startLocation: {
      objectType: "postalCodeAreasArray",
      postalCodeAreas: []
    },
    destinationLocation: {
      objectType: "postalCodeAreasArray",
      postalCodeAreas: []
    },
    inclusiveRightUpperBoundDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
    firstResult: 0,
    maxResults: 30
  };

  // Map agent's operational areas to postal code areas if defined
  if (agentConfig.operationalArea && agentConfig.operationalArea.length > 0) {
    agentConfig.operationalArea.forEach(area => {
      if (area.countries && area.postalCodes) {
        // For starting locations
        searchParams.startLocation.postalCodeAreas.push({
          country: area.countries[0], 
          postalCodes: area.postalCodes || []
        });
        
        // For destination locations - can be same as starting or different
        if (area.destinationCountries && area.destinationPostalCodes) {
          searchParams.destinationLocation.postalCodeAreas.push({
            country: area.destinationCountries[0],
            postalCodes: area.destinationPostalCodes || []
          });
        } else {
          // If no specific destination, use same as starting
          searchParams.destinationLocation.postalCodeAreas.push({
            country: area.countries[0],
            postalCodes: area.postalCodes || []
          });
        }
      }
    });
  } else {
    // If no operational areas defined, try to use preferred countries and logistics base
    
    // 1. Use preferred countries if available
    if (agentConfig.preferredCountries && agentConfig.preferredCountries.length > 0) {
      // Map country names to ISO codes
      const countryMapping = {
        'Polska': 'PL',
        'Niemcy': 'DE',
        'Francja': 'FR',
        'Włochy': 'IT',
        'Hiszpania': 'ES',
        'Holandia': 'NL',
        'Belgia': 'BE',
        'Czechy': 'CZ',
        'Słowacja': 'SK',
        'Austria': 'AT'
      };
      
      // Get ISO code for the first preferred country, default to DE if not found
      const countryCode = countryMapping[agentConfig.preferredCountries[0]] || 'DE';
      
      // 2. Try to use logistics base if selected
      if (agentConfig.selectedLogisticsBase) {
        // We need to fetch the logistics base data to get the postal code
        // For now, we'll use a placeholder approach with default postal codes
        // In a real implementation, this would be fetched from the Redux store or API
        
        // Default postal codes based on country
        const defaultPostalCodes = {
          'DE': ['10', '11', '20', '30', '40', '50'],
          'PL': ['00', '01', '02', '03', '04', '05'],
          'FR': ['75', '69', '13', '59', '67', '33'],
          'IT': ['00', '20', '30', '40', '50', '60'],
          'ES': ['28', '08', '46', '41', '50', '15'],
          'NL': ['10', '20', '30', '40', '50', '60'],
          'BE': ['10', '20', '30', '40', '50', '60'],
          'CZ': ['10', '20', '30', '40', '50', '60'],
          'SK': ['01', '02', '03', '04', '05', '06'],
          'AT': ['10', '20', '30', '40', '50', '60']
        };
        
        // Use default postal codes for the selected country
        const postalCodes = defaultPostalCodes[countryCode] || ['10', '11'];
        
        // Add to start location
        searchParams.startLocation.postalCodeAreas.push({
          country: countryCode,
          postalCodes: postalCodes
        });
        
        // Also use as destination if no specific destination countries
        if (!agentConfig.unwantedCountries || !agentConfig.unwantedCountries.includes(agentConfig.preferredCountries[0])) {
          searchParams.destinationLocation.postalCodeAreas.push({
            country: countryCode,
            postalCodes: postalCodes
          });
        }
      } else {
        // No logistics base selected, use country with default postal codes
        searchParams.startLocation.postalCodeAreas.push({
          country: countryCode,
          postalCodes: ['10', '11']
        });
        
        // Also use as destination
        searchParams.destinationLocation.postalCodeAreas.push({
          country: countryCode,
          postalCodes: ['80', '82']
        });
      }
    } else {
      // No preferred countries, use defaults
      searchParams.startLocation.postalCodeAreas.push({
        country: "DE",
        postalCodes: ["10", "11"]
      });
      
      searchParams.destinationLocation.postalCodeAreas.push({
        country: "DE",
        postalCodes: ["80", "82"]
      });
    }
  }

  // 3. Consider max operating radius if defined
  if (agentConfig.maxOperatingRadius && agentConfig.maxOperatingRadius > 0) {
    // In a real implementation, we would use the radius to calculate
    // a broader range of postal codes around the logistics base
    // For now, we'll just add this as a comment for future enhancement
    
    // Example: if radius is large, add more postal codes to the search
    if (agentConfig.maxOperatingRadius > 300) {
      // Add more postal codes to both start and destination
      searchParams.startLocation.postalCodeAreas.forEach(area => {
        // Expand postal codes range based on radius
        // This is a simplified approach - in reality, you would need
        // a more sophisticated algorithm to determine postal codes within a radius
        if (area.postalCodes.length < 5) {
          // Add nearby postal codes
          const additionalCodes = [];
          area.postalCodes.forEach(code => {
            const codeNum = parseInt(code);
            if (!isNaN(codeNum)) {
              // Add nearby postal codes
              additionalCodes.push(String(codeNum + 1));
              additionalCodes.push(String(codeNum - 1));
            }
          });
          area.postalCodes = [...new Set([...area.postalCodes, ...additionalCodes])];
        }
      });
    }
  }

  // 4. Add vehicle preferences if available
  if (agentConfig.trailerTypes && agentConfig.trailerTypes.length > 0) {
    // Map trailer types to TIMOCOM vehicle properties
    const trailerTypeMapping = {
      'Plandeka': 'CURTAIN_SIDER',
      'Chłodnia': 'REFRIGERATED',
      'Platforma': 'FLATBED',
      'Silos': 'SILO',
      'Cysterna': 'TANK'
    };
    
    // Create vehicle properties object if it doesn't exist
    if (!searchParams.vehicleProperties) {
      searchParams.vehicleProperties = {
        body: [],
        bodyProperty: [],
        equipment: [],
        loadSecuring: [],
        swapBody: [],
        type: []
      };
    }
    
    // Add trailer types to vehicle properties
    agentConfig.trailerTypes.forEach(trailerType => {
      const timocomType = trailerTypeMapping[trailerType];
      if (timocomType && !searchParams.vehicleProperties.body.includes(timocomType)) {
        searchParams.vehicleProperties.body.push(timocomType);
      }
    });
    
    // Add special equipment if available
    if (agentConfig.specialEquipment && agentConfig.specialEquipment.length > 0) {
      const equipmentMapping = {
        'Winda': 'TAIL_LIFT',
        'Wózek widłowy': 'FORKLIFT',
        'GPS': 'GPS_TRACKING',
        'System monitoringu temperatury': 'TEMPERATURE_RECORDER'
      };
      
      agentConfig.specialEquipment.forEach(equipment => {
        const timocomEquipment = equipmentMapping[equipment];
        if (timocomEquipment && !searchParams.vehicleProperties.equipment.includes(timocomEquipment)) {
          searchParams.vehicleProperties.equipment.push(timocomEquipment);
        }
      });
    }
    
    // Add certificates if available
    if (agentConfig.certificates && agentConfig.certificates.length > 0) {
      const certificateMapping = {
        'ADR': 'ADR_EQUIPMENT_SET',
        'ATP': 'ATP_CERTIFICATE',
        'HACCP': 'HACCP_CERTIFICATE',
        'ISO': 'ISO_CERTIFICATE',
        'GDP': 'GDP_CERTIFICATE'
      };
      
      agentConfig.certificates.forEach(certificate => {
        const timocomCertificate = certificateMapping[certificate];
        if (timocomCertificate && !searchParams.vehicleProperties.equipment.includes(timocomCertificate)) {
          searchParams.vehicleProperties.equipment.push(timocomCertificate);
        }
      });
    }
  }

  return searchParams;
};

async function testTimocomParams() {
  try {
    // Pobierz dane agenta o ID 2
    const response = await axios.get('http://localhost:4002/agents/2');
    const agent = response.data;
    
    // Pobierz bazę logistyczną
    let logisticsBase = null;
    try {
      const logisticsBaseResponse = await axios.get(`http://localhost:4002/logisticsBases/${agent.selectedLogisticsBase}`);
      logisticsBase = logisticsBaseResponse.data;
    } catch (error) {
      console.log('Nie udało się pobrać bazy logistycznej:', error.message);
    }
    
    console.log('Agent data:');
    console.log('- Name:', agent.name);
    console.log('- Preferred countries:', agent.preferredCountries);
    console.log('- Selected logistics base:', agent.selectedLogisticsBase);
    console.log('- Max operating radius:', agent.maxOperatingRadius, 'km');
    console.log('- Trailer types:', agent.trailerTypes);
    console.log('- Special equipment:', agent.specialEquipment);
    console.log('- Certificates:', agent.certificates);
    
    if (logisticsBase) {
      console.log('\nLogistics base:');
      console.log(logisticsBase);
    }
    
    // Wygeneruj parametry zapytania TIMOCOM
    const searchParams = buildSearchParamsFromAgentConfig(agent);
    
    console.log('\nTIMOCOM API search parameters:');
    console.log(JSON.stringify(searchParams, null, 2));
    
    return searchParams;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Uruchom test
testTimocomParams();
