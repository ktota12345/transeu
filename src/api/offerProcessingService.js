/**
 * Service for processing and analyzing TransEU freight offers
 * Handles profitability calculation and offer ranking
 */

/**
 * Calculates the profitability score for a single offer based on agent preferences
 * @param {Object} offer - The freight offer to evaluate
 * @param {Object} agentConfig - Agent configuration with profitability parameters
 * @returns {Object} - Profitability metrics and score
 */
export const calculateOfferProfitability = (offer, agentConfig) => {
  // Extract relevant data from the offer
  const { freight } = offer;
  
  // Distance in km (convert from meters)
  const distance = freight.route?.distance ? freight.route.distance / 1000 : 0;
  
  // Default values if specific agent parameters are not set
  const defaultRatePerKm = 2.5; // Example default rate in currency units per km
  const defaultFuelConsumption = 30; // liters per 100km
  const defaultFuelPrice = 6.5; // currency units per liter
  const defaultDriverCost = 0.5; // currency units per km
  const defaultOtherCosts = 0.3; // currency units per km
  
  // Use agent config values if available, otherwise use defaults
  const ratePerKm = agentConfig.financials?.ratePerKm || defaultRatePerKm;
  const fuelConsumption = agentConfig.vehiclePreferences?.fuelConsumption || defaultFuelConsumption;
  const fuelPrice = agentConfig.financials?.fuelPrice || defaultFuelPrice;
  const driverCost = agentConfig.financials?.driverCost || defaultDriverCost;
  const otherCosts = agentConfig.financials?.otherCosts || defaultOtherCosts;
  
  // Calculate revenue (based on distance and rate)
  const revenue = distance * ratePerKm;
  
  // Calculate fuel cost
  const fuelCost = (distance * fuelConsumption * fuelPrice) / 100;
  
  // Calculate driver wages
  const driverWages = distance * driverCost;
  
  // Calculate other operational costs
  const operationalCosts = distance * otherCosts;
  
  // Calculate total costs
  const totalCosts = fuelCost + driverWages + operationalCosts;
  
  // Calculate profit and profit margin
  const profit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  // Calculate profitability score (0-100)
  // This is a simplified algorithm that can be refined later
  // Higher profit margin = higher score
  let profitabilityScore = Math.min(100, Math.max(0, profitMargin * 5));
  
  // Adjust score based on other factors (this can be expanded later)
  
  // Factor 1: Capacity utilization
  const capacityUtilization = freight.capacity ? Math.min(100, (freight.capacity / 
    (agentConfig.vehiclePreferences?.capacity?.max || 24)) * 100) : 0;
  
  // Factor 2: Route efficiency (simplified for now)
  const routeEfficiency = distance > 0 ? Math.min(100, (distance / 800) * 100) : 0;
  
  // Factor 3: Payment terms (longer payment = lower score)
  const paymentScore = freight.period?.days 
    ? Math.max(0, 100 - (freight.period.days / 30) * 20) 
    : 50; // Default if unknown
  
  // Factor 4: Client rating (if available)
  const clientRatingScore = offer.rating_summary?.rate 
    ? (offer.rating_summary.rate / 5) * 100 
    : 50; // Default if unknown
  
  // Weight and combine factors (weights can be adjusted)
  const weightedScore = (
    (profitabilityScore * 0.4) + 
    (capacityUtilization * 0.2) + 
    (routeEfficiency * 0.15) + 
    (paymentScore * 0.15) + 
    (clientRatingScore * 0.1)
  );
  
  // Round to nearest integer
  const finalScore = Math.round(weightedScore);
  
  return {
    score: finalScore,
    profit: profit.toFixed(2),
    profitMargin: profitMargin.toFixed(2),
    metrics: {
      distance,
      revenue: revenue.toFixed(2),
      fuelCost: fuelCost.toFixed(2),
      driverWages: driverWages.toFixed(2),
      operationalCosts: operationalCosts.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      capacityUtilization: capacityUtilization.toFixed(2),
      routeEfficiency: routeEfficiency.toFixed(2),
      paymentScore,
      clientRatingScore
    }
  };
};

/**
 * Process a list of offers, calculate profitability for each, and rank them
 * @param {Array} offers - List of freight offers from the API
 * @param {Object} agentConfig - Agent configuration with profitability parameters
 * @returns {Array} - Processed and ranked offers with profitability metrics
 */
export const processOffers = (offers, agentConfig) => {
  if (!offers || !Array.isArray(offers)) {
    return [];
  }
  
  // Calculate profitability for each offer
  const processedOffers = offers.map(offer => {
    const profitability = calculateOfferProfitability(offer, agentConfig);
    
    return {
      ...offer,
      profitability
    };
  });
  
  // Sort offers by profitability score (highest first)
  const rankedOffers = [...processedOffers].sort((a, b) => 
    b.profitability.score - a.profitability.score
  );
  
  return rankedOffers;
};
