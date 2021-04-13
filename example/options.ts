import { createStoreLocatorMap, StoreLocatorMap } from '../src';

export default (): Promise<StoreLocatorMap> =>
  createStoreLocatorMap((loaded: boolean) => ({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
    geoJson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-98.7625347, 38.3627242],
          },
          properties: {
            banner: "Fred's Smoothies",
            name: 'Great Bend',
            formattedAddress: '123 Main St, Great Bend, KS',
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-98.3407384, 40.9212822],
          },
          properties: {
            banner: "Fred's Smoothies",
            name: 'Grand Island',
            formattedAddress: '123 Main St, Grand Island, NE',
          },
        },
      ],
    },
    mapOptions: {
      zoom: 6,
      scrollwheel: false,
    },
    formatLogoPath: () => `http://maps.google.com/mapfiles/ms/icons/blue.png`,
    infoWindowOptions: {
      infoWindowOptions: {
        minWidth: 600,
      },
    },
    searchBoxOptions: {
      autocompleteOptions: {
        componentRestrictions: { country: 'us' },
      },
      originMarkerOptions: {
        label: 'Search Label',
      },
      controlPosition: loaded ? google.maps.ControlPosition.BOTTOM_CENTER : undefined,
    },
    storeListOptions: {
      filterFn: () => true,
      unitSystem: 'imperial',
    },
  }));
