import { createStoreLocatorMap, StoreLocatorMap } from '../src';

export default (): Promise<StoreLocatorMap> =>
  createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: process.env.GOOGLE_MAPS_API_KEY as string },
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
            store: "Fred's Smoothies, Great Bend",
            storeFullAddress: '123 Main St, Great Bend, KS',
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-98.3407384, 40.9212822],
          },
          properties: {
            store: "Fred's Smoothies Grand Island",
            storeFullAddress: '123 Main St, Grand Island, NE',
          },
        },
      ],
    },
    mapOptions: {
      zoom: 6,
      scrollwheel: false,
    },
    formatLogoPath: () => `https://maps.google.com/mapfiles/ms/icons/blue.png`,
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
      controlPosition: google.maps.ControlPosition.BOTTOM_CENTER,
    },
    storeListOptions: {
      filterFn: () => true,
      unitSystem: 'imperial',
    },
  });
