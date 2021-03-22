import { createStoreLocatorMap } from '../src';

document.addEventListener('DOMContentLoaded', () => {
  createStoreLocatorMap({
    container: document.getElementById('map-container'),
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
    geoJsonUrl: './sample.json',
  });
});
