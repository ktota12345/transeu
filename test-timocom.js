const axios = require('axios');

// Dane uwierzytelniające z zmiennych środowiskowych
const username = process.env.TIMOCOM_USERNAME || '';
const password = process.env.TIMOCOM_PASSWORD || '';

// Funkcja testująca połączenie z API TIMOCOM
async function testTimocomConnection() {
  try {
    console.log('Testowanie połączenia z API TIMOCOM...');
    
    // Przygotuj nagłówek Basic Auth
    const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    
    // Przygotuj minimalne parametry wyszukiwania
    const minimalSearchParams = {
      startLocation: {
        objectType: "postalCodeAreasArray",
        postalCodeAreas: [{
          country: "DE",
          postalCodes: ["10"]
        }]
      },
      destinationLocation: {
        objectType: "postalCodeAreasArray",
        postalCodeAreas: [{
          country: "DE",
          postalCodes: ["80"]
        }]
      },
      inclusiveRightUpperBoundDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      firstResult: 0,
      maxResults: 1
    };
    
    console.log('Wysyłanie żądania do TIMOCOM...');
    console.log('URL: https://sandbox.timocom.com/freight-exchange/3/freight-offers/search');
    console.log('Użytkownik:', username);
    
    // Wykonaj żądanie
    const response = await axios({
      method: 'post',
      url: 'https://sandbox.timocom.com/freight-exchange/3/freight-offers/search',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      data: minimalSearchParams,
      timeout: 30000
    });
    
    console.log('Odpowiedź z serwera TIMOCOM:', response.status);
    console.log('Dane odpowiedzi:', JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('TIMOCOM API connection test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
      console.error('Error code:', error.code);
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Uruchom test
testTimocomConnection()
  .then(result => {
    console.log('Wynik testu:', result.success ? 'SUKCES' : 'BŁĄD');
    process.exit(0);
  })
  .catch(error => {
    console.error('Nieoczekiwany błąd:', error);
    process.exit(1);
  });
