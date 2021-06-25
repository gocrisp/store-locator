import { createStoreLocatorMap, StoreLocatorMap } from '../src';

export default async (): Promise<StoreLocatorMap> => {
  // Manually load sample.json
  const crispJsonSample = await fetch('sample.json');
  const crispJson = await crispJsonSample.json();

  // Static list of extra stores to add to the map
  const extraStores = [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-1.194936, 51.720208],
      },
      properties: {
        store: 'Oxford Supermarket',
        storeFullAddress: '170 Pegasus Rd, Oxford OX4 6JQ, United Kingdom',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-1.463959, 53.370169],
      },
      properties: {
        store: 'Asda Sheffield Queens Road Supermarket',
        storeFullAddress: '405 Queens Rd, Lowfield Sheffield S2 4DR, United Kingdom',
      },
    },
  ];

  // This will combine the lists from store.json and the extraStores above
  // If we have duplicates, we can also filter them here
  const allStores = [...crispJson.features, ...extraStores];

  return createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: process.env.GOOGLE_MAPS_API_KEY as string },
    // We can include allStores here like this instead of using 'sample.json' directly
    geoJson: {
      type: 'FeatureCollection',
      features: allStores,
    },
    mapOptions: { center: { lat: 52.632469, lng: -1.689423 }, zoom: 7 },
    formatLogoPath: feature =>
      `img/${feature
        .getProperty('store')
        .toLowerCase()
        // remove after 2nd space
        .split(' ')
        .slice(0, 2)
        .join('')
        // remove special characters
        .replace(/[^a-z0-9]/g, '')}.png`,
    searchBoxOptions: {
      autocompleteOptions: {
        componentRestrictions: { country: 'gb' },
      },
    },
    storeListOptions: {
      filterFn: (_, i) => i < 12,
      unitSystem: 'metric',
    },
  });
};
