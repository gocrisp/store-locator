import { createStoreLocatorMap, StoreLocatorMap } from '../src';

export default (): Promise<StoreLocatorMap> =>
  createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
    geoJson: './sample.json',
    mapOptions: { center: { lat: 52.632469, lng: -1.689423 }, zoom: 7 },
    infoWindowOptions: {
      template: ({ feature }) => feature.getProperty('banner'),
    },
    searchBoxOptions: {
      autocompleteOptions: {
        componentRestrictions: { country: 'gb' },
      },
      template:
        '<input type="text" placeholder="Search Here!" style="margin: 20px; font-size: 2em;">',
    },
    storeListOptions: {
      filterFn: (_, i) => i < 12,
      unitSystem: 'metric',
      panelTemplate: '<ul id="map_store-list"></ul><div id="map_store-list-message"></div>',
      storeTemplate: ({ store }) => `<li>${store.feature.getProperty('name')}</li>`,
    },
  });
