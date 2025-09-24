// Script to filter quiz data to only include cities from Lili's list
const fs = require('fs');

// List of cities from topoLili.pdf (Dutch spelling)
const requiredCities = [
  // From the PDF list - Dutch spelling to English mapping
  'Amsterdam',     // Amsterdam
  'Ankara',        // Ankara
  'Athene',        // Athens
  'Belfast',       // Belfast
  'Belgrado',      // Belgrade
  'Berlijn',       // Berlin
  'Bern',          // Bern
  'Boedapest',     // Budapest
  'Boekarest',     // Bucharest
  'Bratislava',    // Bratislava
  'Brussel',       // Brussels
  'Cardiff',       // Cardiff
  'Chisinau',      // Chișinău
  'Dublin',        // Dublin
  'Edinburgh',     // Edinburgh
  'Helsinki',      // Helsinki
  'Kiev',          // Kyiv
  'Kopenhagen',    // Copenhagen
  'Lissabon',      // Lisbon
  'Ljubljana',     // Ljubljana
  'Londen',        // London
  'Luxemburg',     // Luxembourg
  'Madrid',        // Madrid
  'Minsk',         // Minsk
  'Moskou',        // Moscow - Note: Not in our current dataset (outside map bounds)
  'Nicosia',       // Nicosia - Note: Not in our current dataset (outside map bounds)
  'Oslo',          // Oslo
  'Parijs',        // Paris
  'Podgorica',     // Podgorica
  'Praag',         // Prague
  'Pristina',      // Pristina
  'Reykjavik',     // Reykjavik
  'Riga',          // Riga
  'Rome',          // Rome
  'Sarajevo',      // Sarajevo
  'Skopje',        // Skopje
  'Sofia',         // Sofia
  'Stockholm',     // Stockholm
  'Tallinn',       // Tallinn
  'Tirana',        // Tirana
  'Valletta',      // Valletta
  'Vilnius',       // Vilnius
  'Warschau',      // Warsaw
  'Wenen',         // Vienna
  'Zagreb'         // Zagreb
];

// Create mapping from Dutch names to English names for filtering
const dutchToEnglishMap = {
  'Amsterdam': 'Amsterdam',
  'Ankara': 'Ankara',
  'Athene': 'Athens',
  'Belfast': 'Belfast',  // Note: Belfast is not in our current dataset (UK regional capital)
  'Belgrado': 'Belgrade',
  'Berlijn': 'Berlin',
  'Bern': 'Bern',
  'Boedapest': 'Budapest',
  'Boekarest': 'Bucharest',
  'Bratislava': 'Bratislava',
  'Brussel': 'Brussels',
  'Cardiff': 'Cardiff',  // Note: Cardiff is not in our current dataset (UK regional capital)
  'Chisinau': 'Chișinău',
  'Dublin': 'Dublin',
  'Edinburgh': 'Edinburgh',  // Note: Edinburgh is not in our current dataset (UK regional capital)
  'Helsinki': 'Helsinki',
  'Kiev': 'Kyiv',
  'Kopenhagen': 'Copenhagen',
  'Lissabon': 'Lisbon',
  'Ljubljana': 'Ljubljana',
  'Londen': 'London',
  'Luxemburg': 'Luxembourg',
  'Madrid': 'Madrid',
  'Minsk': 'Minsk',
  'Oslo': 'Oslo',
  'Parijs': 'Paris',
  'Podgorica': 'Podgorica',
  'Praag': 'Prague',
  'Pristina': 'Pristina',
  'Reykjavik': 'Reykjavik',
  'Riga': 'Riga',
  'Rome': 'Rome',
  'Sarajevo': 'Sarajevo',
  'Skopje': 'Skopje',
  'Sofia': 'Sofia',
  'Stockholm': 'Stockholm',
  'Tallinn': 'Tallinn',
  'Tirana': 'Tirana',
  'Valletta': 'Valletta',
  'Vilnius': 'Vilnius',
  'Warschau': 'Warsaw',
  'Wenen': 'Vienna',
  'Zagreb': 'Zagreb'
};

// Read the current quiz data
const quizData = JSON.parse(fs.readFileSync('public/quizCapitals.json', 'utf8'));

// Filter capitals to only include those in Lili's list
const filteredCapitals = quizData.capitals.filter(capital => {
  // Check if this capital is in the required list (by English name)
  const englishNames = Object.values(dutchToEnglishMap);
  return englishNames.includes(capital.capital);
});

// Create new quiz data with filtered capitals
const filteredQuizData = {
  ...quizData,
  capitals: filteredCapitals,
  metadata: {
    ...quizData.metadata,
    totalCapitals: filteredCapitals.length,
    filteredFor: 'Lili\'s curriculum',
    originalTotal: quizData.capitals.length,
    filterDate: new Date().toISOString(),
    requiredCities: requiredCities
  }
};

// Write the filtered data
fs.writeFileSync('public/quizCapitals.json', JSON.stringify(filteredQuizData, null, 2));

console.log(`✅ Filtered quiz data created!`);
console.log(`📊 Original cities: ${quizData.capitals.length}`);
console.log(`📊 Filtered cities: ${filteredCapitals.length}`);
console.log(`🎯 Cities found in dataset:`);

filteredCapitals.forEach(capital => {
  console.log(`   - ${capital.capital} (${capital.country})`);
});

console.log(`\n❌ Cities from Lili's list NOT found in dataset:`);
const foundCapitals = filteredCapitals.map(c => c.capital);
const notFound = Object.values(dutchToEnglishMap).filter(city => !foundCapitals.includes(city));
notFound.forEach(city => {
  const dutchName = Object.keys(dutchToEnglishMap).find(k => dutchToEnglishMap[k] === city);
  console.log(`   - ${city} (${dutchName}) - likely outside map bounds or not a country capital`);
});