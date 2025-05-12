/**
 * Funkcja do wyszukiwania ofert powrotnych dla sekwencji w API Timocom,
 * używająca poprawnej struktury parametrów (zgodnej z przykładem cURL).
 * 
 * @param {object} rawSearchParams Parametry wyszukiwania z frontendu/logiki sekwencji.
 *                                Oczekiwana struktura np.: 
 *                                { 
 *                                  originCity: { name, country, postalCode }, 
 *                                  destinationCity: { name, country, postalCode }, 
 *                                  searchRadius, // dla origin (startu oferty powrotnej)
 *                                  exclusiveLeftLowerBoundDateTime, 
 *                                  inclusiveRightUpperBoundDateTime
 *                                }
 * @param {object} apiClient Zainicjalizowana instancja klienta Axios dla Timocom API.
 * @returns {Promise<object>} Obietnica zwracająca przetworzoną odpowiedź API (np. pole payload) lub rzucająca błąd.
 */
const fetchSequenceReturnOffers = async (rawSearchParams, apiClient) => {
    console.log("SequenceAPI: Received search params:", JSON.stringify(rawSearchParams, null, 2));

    try {
        // --- Budowanie parametrów zapytania zgodnie ze strukturą cURL ---
        const finalSearchParams = {};

        // --- Start Location (Origin of Return Trip) ---
        if (rawSearchParams.originCity) {
            finalSearchParams.startLocation = {
                objectType: "areaSearch", // Przeniesiono objectType na górny poziom
                area: { // Szczegóły zagnieżdżone w 'area'
                    address: {
                        objectType: "address", // Ten objectType jest poprawny wewnątrz address
                        city: rawSearchParams.originCity.name,
                        country: rawSearchParams.originCity.country, 
                        postalCode: rawSearchParams.originCity.postalCode,
                    },
                    // Promień dla miejsca startu oferty powrotnej (celu oferty pierwotnej)
                    size_km: 50, // Zmieniono promień na 50 km zgodnie z życzeniem
                    // Usunięto objectType z tego poziomu
                },
            };
            console.log("SequenceAPI: Constructed startLocation (corrected structure):", JSON.stringify(finalSearchParams.startLocation, null, 2));
        } else {
             console.error("SequenceAPI Error: Missing originCity for return offer search!");
             throw new Error("Brak miasta początkowego dla wyszukiwania oferty powrotnej.");
        }

        // --- Destination Location (Home Base) ---
        if (rawSearchParams.destinationCity) {
            finalSearchParams.destinationLocation = { 
                objectType: "areaSearch", // Przeniesiono objectType na górny poziom
                area: { // Szczegóły zagnieżdżone w 'area'
                    address: {
                        objectType: "address", // Ten objectType jest poprawny wewnątrz address
                        city: rawSearchParams.destinationCity.name,
                        country: rawSearchParams.destinationCity.country,
                        postalCode: rawSearchParams.destinationCity.postalCode,
                    },
                    size_km: 50, // Zmieniono promień na 50 km zgodnie z życzeniem
                    // Usunięto objectType z tego poziomu
                },
            };
             console.log("SequenceAPI: Constructed destinationLocation (corrected structure):", JSON.stringify(finalSearchParams.destinationLocation, null, 2));
        } else {
            console.error("SequenceAPI Error: Missing destinationCity (home base) for return offer search!");
            throw new Error("Brak miasta docelowego (bazy domowej) dla wyszukiwania oferty powrotnej.");
        }

        // --- Date/Time Range --- 
        // Oczekujemy teraz pełnych stringów ISO 8601 z server.js
        if (rawSearchParams.exclusiveLeftLowerBoundDateTime) {
            finalSearchParams.exclusiveLeftLowerBoundDateTime = rawSearchParams.exclusiveLeftLowerBoundDateTime;
        } else {
             console.warn("SequenceAPI: Missing exclusiveLeftLowerBoundDateTime from rawSearchParams.");
             // Można rzucić błąd lub ustawić domyślną
             // throw new Error("Missing required lower bound date time.");
        }
        
        if (rawSearchParams.inclusiveRightUpperBoundDateTime) {
            finalSearchParams.inclusiveRightUpperBoundDateTime = rawSearchParams.inclusiveRightUpperBoundDateTime;
        } else {
             console.warn("SequenceAPI: Missing inclusiveRightUpperBoundDateTime from rawSearchParams.");
             // Można rzucić błąd lub ustawić domyślną
             // throw new Error("Missing required upper bound date time.");
        }

         console.log("SequenceAPI: Date range passed directly:", finalSearchParams.exclusiveLeftLowerBoundDateTime, "-", finalSearchParams.inclusiveRightUpperBoundDateTime);


        // --- Sortowanie i Paginacja ---
        finalSearchParams.sortings = [{
            ascending: true, // Sortuj po dacie rosnąco (najwcześniejsze pierwsze)
            field: "loadingDate" 
        }];
        finalSearchParams.firstResult = 0;
        finalSearchParams.maxResults = 30; // Ograniczamy liczbę wyników
        
        console.log('SequenceAPI: Sending request to TIMOCOM /freight-offers/search with params:', JSON.stringify(finalSearchParams, null, 2));
        const response = await apiClient.post('/freight-offers/search', finalSearchParams);

        console.log('SequenceAPI: TIMOCOM /freight-offers/search raw response status:', response.status);
        
        // Zwracamy całe 'data' z odpowiedzi Axios, które zawiera { meta, payload }
        if (response.status >= 200 && response.status < 300 && response.data) {
            console.log(`SequenceAPI: Success! Found ${response.data.payload?.length || 0} potential return offers.`);
            return response.data; 
        } else {
            // Jeśli status jest poza 2xx, Axios domyślnie rzuca błąd, który złapiemy w catch
            // Ale na wszelki wypadek, jeśli Axios by nie rzucił błędu:
             console.error("SequenceAPI Error: Received non-2xx status from Timocom:", response.status);
            throw Object.assign(new Error(`Timocom API zwróciło błąd statusu: ${response.status}`), { response: response });
        }

    } catch (error) {
        console.error('SequenceAPI Error: Failed to fetch sequence return offers:', error.message);
        if (error.response) {
            console.error('SequenceAPI Error Details (Timocom Response):', JSON.stringify(error.response.data, null, 2));
            // Rzucamy błąd dalej, aby endpoint mógł go obsłużyć
             throw Object.assign(new Error('Błąd podczas komunikacji z API Timocom przy wyszukiwaniu ofert powrotnych.'), { response: error.response });
        } else {
            // Błąd sieciowy lub inny problem przed otrzymaniem odpowiedzi
             throw error; // Rzuć oryginalny błąd
        }
    }
};

module.exports = {
    fetchSequenceReturnOffers
};
