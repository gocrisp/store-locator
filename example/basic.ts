import { createStoreLocatorMap, StoreLocatorMap } from '../src';

export default (): Promise<StoreLocatorMap> =>
  createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
    geoJson: './sample.json', // ./static/sample.json
    mapOptions: { center: { lat: 52.632469, lng: -1.689423 }, zoom: 7 },
    formatLogoPath: feature =>
      `img/${feature
        .getProperty('banner')
        .toLowerCase()
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