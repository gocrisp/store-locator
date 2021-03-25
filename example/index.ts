import { createStoreLocatorMap } from '../src';

document.addEventListener('DOMContentLoaded', () => {
  createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
    geoJsonUrl: './sample.json', // ./static/sample.json
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
  });
});
