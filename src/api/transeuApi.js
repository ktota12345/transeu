import axios from 'axios';

// TransEU API configuration
const TRANSEU_API_URL = 'https://api-platform.trans.eu';
const FREIGHT_OFFERS_ENDPOINT = '/app/exchange/api/rest/v2/freight-offers';
const FREIGHT_OFFER_DETAILS_ENDPOINT = '/app/exchange/api/rest/v3/freight-offers';

// Helper to get the authorization token (to be implemented with proper auth flow)
const getAuthToken = () => {
  // This should be replaced with proper token management
  // For now, we'll use environment variables or fetch from secure storage
  return process.env.REACT_APP_TRANSEU_TOKEN || localStorage.getItem('transeu_token');
};

/**
 * Transforms agent configuration into API filter parameters
 * @param {Object} agentConfig - The agent configuration object
 * @returns {Object} Filter object formatted for the TransEU API
 */
const buildFilterFromAgentConfig = (agentConfig) => {
  const filter = {};
  
  // Only include parameters that are applicable for filtering
  if (agentConfig.operationalArea) {
    // Create loading and unloading place filters based on operational areas
    filter.loading_place = agentConfig.operationalArea.map(area => ({
      address: {
        country: area.countries,
        ...(area.cities && area.cities.length > 0 && { locality: area.cities[0] }),
        ...(area.postalCode && { postal_code: area.postalCode })
      },
      ...(area.coordinates && {
        coordinates: {
          latitude: area.coordinates.latitude,
          longitude: area.coordinates.longitude,
          range: area.coordinates.range || 50 // Default range if not specified
        }
      })
    }));

    // Unloading places - can be same as loading or different depending on config
    filter.unloading_place = [...filter.loading_place];
  }

  // Add vehicle type and capacity constraints
  if (agentConfig.vehiclePreferences) {
    if (agentConfig.vehiclePreferences.truckBodies && agentConfig.vehiclePreferences.truckBodies.length > 0) {
      filter.required_truck_body = agentConfig.vehiclePreferences.truckBodies;
    }
    
    if (agentConfig.vehiclePreferences.capacity) {
      filter.load_weight = {
        from: agentConfig.vehiclePreferences.capacity.min || 0,
        to: agentConfig.vehiclePreferences.capacity.max || 40
      };
      
      filter.cargo_capacity = {
        from: agentConfig.vehiclePreferences.capacity.min || 0,
        to: agentConfig.vehiclePreferences.capacity.max || 40
      };
    }
  }

  // Always exclude suspended offers
  filter.exclude_suspended = true;
  
  // Default matching type if not specified
  filter.places_matching_type = agentConfig.placesMatchingType || "cross";

  return filter;
};

/**
 * Fetches freight offers from TransEU API based on agent configuration
 * @param {Object} agentConfig - The agent configuration that defines filters
 * @param {Object} options - Additional options (sorting, pagination)
 * @returns {Promise<Object>} - The API response with offers and metadata
 */
export const fetchFreightOffers = async (agentConfig, options = {}) => {
  try {
    // Build filter from agent configuration
    const filter = buildFilterFromAgentConfig(agentConfig);
    
    // Default sorting - most recent first
    const sort = options.sort || { field: "index", order: "desc" };
    
    // Request parameters
    const params = {
      filter: JSON.stringify(filter),
      sort: JSON.stringify(sort),
      counters: ["all"]
    };
    
    // Add pagination if provided
    if (options.page && options.limit) {
      params.page = options.page;
      params.limit = options.limit;
    }
    
    // Build URL with query parameters
    const url = new URL(FREIGHT_OFFERS_ENDPOINT, TRANSEU_API_URL);
    url.search = new URLSearchParams(params).toString();
    
    // Make API request
    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching freight offers:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific freight offer
 * @param {string} offerId - The ID of the freight offer to fetch
 * @returns {Promise<Object>} - The offer details
 */
export const fetchFreightOfferDetails = async (offerId) => {
  try {
    const url = `${TRANSEU_API_URL}${FREIGHT_OFFER_DETAILS_ENDPOINT}/${offerId}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for offer ${offerId}:`, error);
    throw error;
  }
};
