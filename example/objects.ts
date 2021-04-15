import { createStoreLocatorMap, StoreLocatorMap } from '../src';

export default async (): Promise<StoreLocatorMap> => {
  const storeLocator = await createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
    geoJson: './sample.json',
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

  const { map, infoWindow, autocomplete, originMarker } = storeLocator;

  // Custom map markers per store name
  map.data.setStyle(feature => ({
    icon: `https://maps.google.com/mapfiles/ms/icons/${
      (feature.getProperty('store') as string).startsWith("Josie's Patisserie") ? 'orange' : 'green'
    }.png`,
  }));

  // customize infoWindow after initialization
  infoWindow.setOptions({
    minWidth: 600,
  });

  // Apply extra logic on search
  autocomplete.addListener('place_changed', async () => {
    console.log(autocomplete.getPlace());
  });

  // remove the originMarker completely (the one that appears on search)
  originMarker.setMap(null);

  return storeLocator;
};
