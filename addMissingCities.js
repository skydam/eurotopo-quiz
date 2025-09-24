// Script to add missing cities from Lili's list
const fs = require('fs');

// Read current quiz data
const quizData = JSON.parse(fs.readFileSync('public/quizCapitals.json', 'utf8'));

// UK Regional Capitals (treating regions as countries for educational purposes)
const ukRegionalCapitals = [
  {
    id: 'GB-SCT',
    country: 'Scotland',
    capital: 'Edinburgh',
    coordinates: {
      lat: 55.9533,
      lng: -3.1883
    },
    region: 'Northern Europe',
    population: 524930,
    area: 77933, // Scotland area
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    alternativeSpellings: ['Edinburgh', 'Dùn Èideann'],
    mapPosition: {
      x: 2380,  // Estimated based on London's position
      y: 4700,
      confidence: 'calculated'
    },
    difficulty: 'medium'
  },
  {
    id: 'GB-WLS',
    country: 'Wales',
    capital: 'Cardiff',
    coordinates: {
      lat: 51.4816,
      lng: -3.1791
    },
    region: 'Northern Europe',
    population: 362310,
    area: 20779, // Wales area
    flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    alternativeSpellings: ['Cardiff', 'Caerdydd'],
    mapPosition: {
      x: 2100,
      y: 5700,
      confidence: 'calculated'
    },
    difficulty: 'medium'
  },
  {
    id: 'GB-NIR',
    country: 'Northern Ireland',
    capital: 'Belfast',
    coordinates: {
      lat: 54.5973,
      lng: -5.9301
    },
    region: 'Northern Europe',
    population: 343542,
    area: 14130, // Northern Ireland area
    flag: '🇬🇧',
    alternativeSpellings: ['Belfast', 'Béal Feirste'],
    mapPosition: {
      x: 1600,
      y: 4900,
      confidence: 'calculated'
    },
    difficulty: 'medium'
  }
];

// Cities outside map bounds
const outOfBoundsCities = [
  {
    id: 'TR',
    country: 'Turkey',
    capital: 'Ankara',
    coordinates: {
      lat: 39.9334,
      lng: 32.8597
    },
    region: 'Asia/Europe',
    population: 5663322,
    area: 783562,
    flag: '🇹🇷',
    alternativeSpellings: ['Ankara', 'Angora', 'Ancyra'],
    mapPosition: {
      x: -1,  // Special value for off-map
      y: -1,
      confidence: 'off-map'
    },
    difficulty: 'medium',
    offMap: true
  },
  {
    id: 'RU',
    country: 'Russia',
    capital: 'Moscow',
    capitalDutch: 'Moskou',
    coordinates: {
      lat: 55.7558,
      lng: 37.6173
    },
    region: 'Eastern Europe',
    population: 12506468,
    area: 17098242,
    flag: '🇷🇺',
    alternativeSpellings: ['Moscow', 'Moskva', 'Москва', 'Moskou'],
    mapPosition: {
      x: -1,
      y: -1,
      confidence: 'off-map'
    },
    difficulty: 'medium',
    offMap: true
  },
  {
    id: 'CY',
    country: 'Cyprus',
    capital: 'Nicosia',
    coordinates: {
      lat: 35.1856,
      lng: 33.3823
    },
    region: 'Mediterranean',
    population: 116392,
    area: 9251,
    flag: '🇨🇾',
    alternativeSpellings: ['Nicosia', 'Lefkosia', 'Λευκωσία'],
    mapPosition: {
      x: -1,
      y: -1,
      confidence: 'off-map'
    },
    difficulty: 'hard',
    offMap: true
  }
];

// Calculate approximate positions for UK regional capitals using coordinate transformation
// Using London as reference: London (51.5, -0.08) -> (2646, 5617)
function estimateMapPosition(lat, lng) {
  // Very rough estimation based on London's position
  const londonLat = 51.5;
  const londonLng = -0.08;
  const londonX = 2646;
  const londonY = 5617;

  // Rough scale factors (these are approximations)
  const xScale = 150; // pixels per degree longitude
  const yScale = -200; // pixels per degree latitude (negative because Y increases downward)

  const x = londonX + (lng - londonLng) * xScale;
  const y = londonY + (lat - londonLat) * yScale;

  return {
    x: Math.round(x),
    y: Math.round(y),
    confidence: 'calculated'
  };
}

// Update map positions for UK regional capitals
ukRegionalCapitals.forEach(city => {
  const pos = estimateMapPosition(city.coordinates.lat, city.coordinates.lng);
  city.mapPosition = pos;
});

// Combine all capitals
const allCapitals = [
  ...quizData.capitals,
  ...ukRegionalCapitals,
  ...outOfBoundsCities
];

// Sort alphabetically by capital name
allCapitals.sort((a, b) => a.capital.localeCompare(b.capital));

// Create updated quiz data
const updatedQuizData = {
  ...quizData,
  capitals: allCapitals,
  metadata: {
    ...quizData.metadata,
    totalCapitals: allCapitals.length,
    includesRegionalCapitals: true,
    includesOffMapCities: true,
    lastUpdated: new Date().toISOString(),
    offMapCities: outOfBoundsCities.map(c => c.capital),
    regionalCapitals: ukRegionalCapitals.map(c => c.capital)
  }
};

// Write updated data
fs.writeFileSync('public/quizCapitals.json', JSON.stringify(updatedQuizData, null, 2));

console.log('✅ Added missing cities!');
console.log(`📊 UK Regional Capitals added: ${ukRegionalCapitals.length}`);
ukRegionalCapitals.forEach(c => console.log(`   - ${c.capital} (${c.country})`));
console.log(`\n🌍 Off-map cities added: ${outOfBoundsCities.length}`);
outOfBoundsCities.forEach(c => console.log(`   - ${c.capital} (${c.country})`));
console.log(`\n📈 Total cities now: ${allCapitals.length}`);