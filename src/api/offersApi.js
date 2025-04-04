import { fetchFreightOffers, fetchFreightOfferDetails } from './transeuApi';
import { processOffers, calculateOfferProfitability } from './offerProcessingService';
import { fetchAgent } from './agentApi';
import { saveAgentSearchHistory, saveAgentOfferAction } from './agentHistoryApi';
import { getTimocomOffers, getTimocomOfferDetails, analyzeTimocomOfferForAgents } from './timocomAdapterService';

/**
 * Main API module for exchange offers management
 * Coordinates between TransEU API and offer processing services
 */

/**
 * Fetches freight offers filtered by agent configuration and calculates profitability
 * @param {string} agentId - ID of the agent whose configuration will be used for filtering
 * @param {Object} options - Additional options (sorting, pagination)
 * @returns {Promise<Object>} - List of offers with profitability metrics and metadata
 */
export const fetchOffersByAgentConfig = async (agentId, options = {}) => {
  try {
    // Get agent configuration
    const agentConfig = await fetchAgent(agentId);
    
    if (!agentConfig) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    
    // Fetch offers from TransEU API using agent configuration
    const apiResponse = await fetchFreightOffers(agentConfig, options);
    
    // Extract offers from the API response
    const offers = apiResponse._embedded?.['freight-offers'] || [];
    
    // Process offers and calculate profitability metrics
    const processedOffers = processOffers(offers, agentConfig);
    
    // Save search history
    await saveAgentSearchHistory(agentId, offers, processedOffers, {
      ...options,
      agentConfig: {
        id: agentConfig.id,
        name: agentConfig.name,
        selectedLogisticsBase: agentConfig.selectedLogisticsBase,
        customLogisticsPoint: agentConfig.customLogisticsPoint
      }
    });
    
    // Return processed offers and metadata
    return {
      offers: processedOffers,
      total: apiResponse.total_items || 0,
      page: apiResponse.page || 1,
      pages: apiResponse.pages || 1
    };
  } catch (error) {
    console.error('Error fetching offers by agent config:', error);
    throw error;
  }
};

/**
 * Fetches a single offer with details and calculates its profitability
 * @param {string} offerId - ID of the offer to fetch
 * @param {string} agentId - ID of the agent to use for profitability calculation
 * @returns {Promise<Object>} - Offer with profitability metrics
 */
export const fetchOfferWithProfitability = async (offerId, agentId) => {
  try {
    // Get agent configuration
    const agentConfig = await fetchAgent(agentId);
    
    if (!agentConfig) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    
    // Fetch offer details from TransEU API
    const offerDetails = await fetchFreightOfferDetails(offerId);
    
    if (!offerDetails) {
      throw new Error(`Offer with ID ${offerId} not found`);
    }
    
    // Calculate profitability for this offer
    const profitability = calculateOfferProfitability(offerDetails, agentConfig);
    
    // Return offer with profitability metrics
    return {
      ...offerDetails,
      profitability
    };
  } catch (error) {
    console.error(`Error fetching offer ${offerId} with profitability:`, error);
    throw error;
  }
};

/**
 * Fetches offers for multiple agents
 * @param {Array} agentIds - Array of agent IDs
 * @param {Object} options - Additional options (sorting, pagination)
 * @returns {Promise<Object>} - Object with offers organized by agent ID
 */
export const fetchOffersForMultipleAgents = async (agentIds, options = {}) => {
  try {
    const results = {};
    
    // Sequential requests for each agent (could be optimized with Promise.all)
    for (const agentId of agentIds) {
      results[agentId] = await fetchOffersByAgentConfig(agentId, options);
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching offers for multiple agents:', error);
    throw error;
  }
};

/**
 * Analyzes an offer and returns detailed profitability metrics
 * @param {string} offerId - ID of the offer to analyze
 * @param {Array} agentIds - Array of agent IDs to use for analysis comparison
 * @returns {Promise<Object>} - Detailed analysis results
 */
export const analyzeOfferProfitability = async (offerId, agentIds) => {
  try {
    // Fetch offer details
    const offerDetails = await fetchFreightOfferDetails(offerId);
    
    if (!offerDetails) {
      throw new Error(`Offer with ID ${offerId} not found`);
    }
    
    const analysis = {
      offer: offerDetails,
      agentAnalysis: {}
    };
    
    // Calculate profitability for each agent
    for (const agentId of agentIds) {
      const agentConfig = await fetchAgent(agentId);
      
      if (agentConfig) {
        analysis.agentAnalysis[agentId] = {
          agentName: agentConfig.name,
          profitability: calculateOfferProfitability(offerDetails, agentConfig)
        };
      }
    }
    
    return analysis;
  } catch (error) {
    console.error(`Error analyzing offer ${offerId}:`, error);
    throw error;
  }
};

/**
 * Fetches freight offers from multiple sources (TransEU and TIMOCOM)
 * @param {string} agentId - ID of the agent whose configuration will be used for filtering
 * @param {Object} options - Additional options (sorting, pagination, sources)
 * @returns {Promise<Object>} - Combined offers from all sources with profitability metrics
 */
export const fetchOffersFromAllSources = async (agentId, options = {}) => {
  try {
    // Get agent configuration
    const agentConfig = await fetchAgent(agentId);
    
    if (!agentConfig) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    
    // Determine which sources to use (default to all)
    const sources = options.sources || ['transeu', 'timocom'];
    
    const results = {
      offers: [],
      total: 0,
      sources: {}
    };
    
    // Fetch offers from TransEU if enabled
    if (sources.includes('transeu')) {
      const transeuOffers = await fetchOffersByAgentConfig(agentId, options);
      results.offers = [...results.offers, ...transeuOffers.offers];
      results.total += transeuOffers.total;
      results.sources.transeu = transeuOffers;
    }
    
    // Fetch offers from TIMOCOM if enabled
    if (sources.includes('timocom')) {
      const timocomOffers = await getTimocomOffers(agentConfig, options);
      results.offers = [...results.offers, ...timocomOffers.offers];
      results.total += timocomOffers.total;
      results.sources.timocom = timocomOffers;
    }
    
    // Sort combined offers by profitability score or other criteria
    results.offers.sort((a, b) => 
      (b.profitability?.score || 0) - (a.profitability?.score || 0)
    );
    
    // Save search history with combined results
    await saveAgentSearchHistory(agentId, results.offers, results.offers, {
      ...options,
      agentConfig: {
        id: agentConfig.id,
        name: agentConfig.name,
        selectedLogisticsBase: agentConfig.selectedLogisticsBase,
        customLogisticsPoint: agentConfig.customLogisticsPoint,
        sources
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching offers from all sources:', error);
    throw error;
  }
};

/**
 * Fetches a single offer with details from any source
 * @param {string} offerId - ID of the offer to fetch
 * @param {string} source - Source of the offer ('transeu' or 'timocom')
 * @param {string} agentId - ID of the agent to use for profitability calculation
 * @returns {Promise<Object>} - Offer with profitability metrics
 */
export const fetchOfferFromSource = async (offerId, source, agentId) => {
  try {
    // Get agent configuration
    const agentConfig = await fetchAgent(agentId);
    
    if (!agentConfig) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    
    let offerWithProfitability;
    
    // Fetch from appropriate source
    switch (source) {
      case 'timocom':
        offerWithProfitability = await getTimocomOfferDetails(offerId, agentConfig);
        break;
      case 'transeu':
      default:
        offerWithProfitability = await fetchOfferWithProfitability(offerId, agentId);
        break;
    }
    
    return offerWithProfitability;
  } catch (error) {
    console.error(`Error fetching offer ${offerId} from ${source}:`, error);
    throw error;
  }
};

/**
 * Imports a TIMOCOM offer into the TransEU system
 * @param {string} offerId - ID of the TIMOCOM offer to import
 * @param {string} agentId - ID of the agent importing the offer
 * @returns {Promise<Object>} - Imported order in the TransEU system
 */
export const importTimocomOfferAsOrder = async (offerId, agentId) => {
  try {
    // Get agent configuration
    const agentConfig = await fetchAgent(agentId);
    
    if (!agentConfig) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    
    // Fetch offer details from TIMOCOM
    const offerDetails = await getTimocomOfferDetails(offerId, agentConfig);
    
    if (!offerDetails) {
      throw new Error(`TIMOCOM offer with ID ${offerId} not found`);
    }
    
    // Record the action in agent history
    await saveAgentOfferAction(agentId, offerId, 'import', {
      source: 'timocom',
      offer: offerDetails
    });
    
    // Convert the offer to an order format
    const orderData = {
      externalId: offerId,
      source: 'timocom',
      status: 'negotiating',
      client: {
        name: offerDetails.contact?.company || 'Unknown client',
        contactPerson: offerDetails.contact?.name || '',
        email: offerDetails.contact?.email || '',
        phone: offerDetails.contact?.phone || ''
      },
      cargo: {
        description: offerDetails.cargo?.description || '',
        weight: offerDetails.cargo?.weight || { value: 0, unit: 't' },
        length: offerDetails.cargo?.length || { value: 0, unit: 'm' },
        requirements: offerDetails.cargo?.vehicle || {}
      },
      route: {
        loadingPlace: {
          country: offerDetails.loadingPlace?.address?.country || '',
          city: offerDetails.loadingPlace?.address?.city || '',
          postalCode: offerDetails.loadingPlace?.address?.postalCode || '',
          loadingDate: offerDetails.loadingPlace?.loadingDate || { from: null, to: null }
        },
        unloadingPlace: {
          country: offerDetails.unloadingPlace?.address?.country || '',
          city: offerDetails.unloadingPlace?.address?.city || '',
          postalCode: offerDetails.unloadingPlace?.address?.postalCode || '',
          loadingDate: offerDetails.unloadingPlace?.loadingDate || { from: null, to: null }
        }
      },
      price: offerDetails.price || { amount: 0, currency: 'EUR' },
      documents: [],
      notes: offerDetails.additionalInformation || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAgentId: agentId,
      assignedAgentName: agentConfig.name,
      assignedAgentType: 'automation',
      profitabilityScore: offerDetails.profitability?.score || 0
    };
    
    // TODO: Add API call to create an order in the system
    // For now, we'll mock the response for demonstration
    const newOrderId = Date.now().toString();
    
    return {
      id: newOrderId,
      ...orderData
    };
  } catch (error) {
    console.error(`Error importing TIMOCOM offer ${offerId}:`, error);
    throw error;
  }
};
