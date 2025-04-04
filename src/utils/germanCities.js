/**
 * List of German state capitals with their postal codes and coordinates
 */
export const germanStateCities = [
  {
    name: "Berlin",
    state: "Berlin",
    postalCode: "10115",
    country: "DE",
    coordinates: {
      latitude: 52.52437,
      longitude: 13.41053
    }
  },
  {
    name: "München",
    state: "Bayern (Bavaria)",
    postalCode: "80331",
    country: "DE",
    coordinates: {
      latitude: 48.13743,
      longitude: 11.57549
    }
  },
  {
    name: "Stuttgart",
    state: "Baden-Württemberg",
    postalCode: "70173",
    country: "DE",
    coordinates: {
      latitude: 48.78232,
      longitude: 9.17702
    }
  },
  {
    name: "Düsseldorf",
    state: "Nordrhein-Westfalen (North Rhine-Westphalia)",
    postalCode: "40213",
    country: "DE",
    coordinates: {
      latitude: 51.22172,
      longitude: 6.77616
    }
  },
  {
    name: "Dresden",
    state: "Sachsen (Saxony)",
    postalCode: "01067",
    country: "DE",
    coordinates: {
      latitude: 51.05089,
      longitude: 13.73832
    }
  },
  {
    name: "Hannover",
    state: "Niedersachsen (Lower Saxony)",
    postalCode: "30159",
    country: "DE",
    coordinates: {
      latitude: 52.37052,
      longitude: 9.73322
    }
  },
  {
    name: "Wiesbaden",
    state: "Hessen (Hesse)",
    postalCode: "65183",
    country: "DE",
    coordinates: {
      latitude: 50.08258,
      longitude: 8.24932
    }
  },
  {
    name: "Magdeburg",
    state: "Sachsen-Anhalt (Saxony-Anhalt)",
    postalCode: "39104",
    country: "DE",
    coordinates: {
      latitude: 52.12773,
      longitude: 11.62916
    }
  },
  {
    name: "Kiel",
    state: "Schleswig-Holstein",
    postalCode: "24103",
    country: "DE",
    coordinates: {
      latitude: 54.32133,
      longitude: 10.13489
    }
  },
  {
    name: "Erfurt",
    state: "Thüringen (Thuringia)",
    postalCode: "99084",
    country: "DE",
    coordinates: {
      latitude: 50.97654,
      longitude: 11.02514
    }
  },
  {
    name: "Schwerin",
    state: "Mecklenburg-Vorpommern",
    postalCode: "19053",
    country: "DE",
    coordinates: {
      latitude: 53.62917,
      longitude: 11.40276
    }
  },
  {
    name: "Mainz",
    state: "Rheinland-Pfalz (Rhineland-Palatinate)",
    postalCode: "55116",
    country: "DE",
    coordinates: {
      latitude: 49.99835,
      longitude: 8.27061
    }
  },
  {
    name: "Saarbrücken",
    state: "Saarland",
    postalCode: "66111",
    country: "DE",
    coordinates: {
      latitude: 49.23262,
      longitude: 7.00982
    }
  },
  {
    name: "Bremen",
    state: "Bremen",
    postalCode: "28195",
    country: "DE",
    coordinates: {
      latitude: 53.07929,
      longitude: 8.80169
    }
  },
  {
    name: "Hamburg",
    state: "Hamburg",
    postalCode: "20095",
    country: "DE",
    coordinates: {
      latitude: 53.55073,
      longitude: 9.99302
    }
  },
  {
    name: "Potsdam",
    state: "Brandenburg",
    postalCode: "14467",
    country: "DE",
    coordinates: {
      latitude: 52.39886,
      longitude: 13.06566
    }
  }
];

/**
 * Helper function to format location for TIMOCOM API
 * @param {Object} city - City object from the list
 * @param {number} radius - Search radius in kilometers
 * @returns {Object} Formatted location object for TIMOCOM API
 */
export const formatTimocomLocation = (city, radius = 50) => {
  return {
    objectType: "areaSearch",
    area: {
      address: {
        objectType: "address",
        city: city.name,
        country: city.country,
        postalCode: city.postalCode,
        geoCoordinate: {
          latitude: city.coordinates.latitude,
          longitude: city.coordinates.longitude
        }
      },
      size_km: radius
    }
  };
};

/**
 * Convert logistics base to TIMOCOM API location format
 * @param {Object} logisticsBase - Logistics base object
 * @param {number} radius - Search radius in kilometers
 * @returns {Object} Formatted location object for TIMOCOM API
 */
export const logisticsBaseToTimocomLocation = (logisticsBase, radius = 50) => {
  if (!logisticsBase) return null;
  
  return {
    objectType: "areaSearch",
    area: {
      address: {
        objectType: "address",
        city: logisticsBase.city || logisticsBase.name,
        country: logisticsBase.country || "PL", // Default to Poland if not specified
        postalCode: logisticsBase.postalCode || "",
        geoCoordinate: {
          latitude: logisticsBase.latitude || logisticsBase.coordinates?.latitude,
          longitude: logisticsBase.longitude || logisticsBase.coordinates?.longitude
        }
      },
      size_km: radius
    }
  };
};

/**
 * Build a complete TIMOCOM API freight search query
 * @param {Object} startLocation - Start location object (logistics base)
 * @param {Object} destinationLocation - Destination location object (German city)
 * @param {number} startRadius - Start location search radius in km
 * @param {number} destRadius - Destination location search radius in km
 * @param {Object} additionalParams - Additional search parameters
 * @returns {Object} Complete query object for TIMOCOM API
 */
export const buildTimocomFreightQuery = (
  startLocation, 
  destinationLocation, 
  startRadius = 50,
  destRadius = 50,
  additionalParams = {}
) => {
  const query = {
    startLocation: logisticsBaseToTimocomLocation(startLocation, startRadius),
    destinationLocation: formatTimocomLocation(destinationLocation, destRadius),
    inclusiveRightUpperBoundDateTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days ahead
    firstResult: 0,
    maxResults: 30,
    ...additionalParams
  };
  
  return query;
};
