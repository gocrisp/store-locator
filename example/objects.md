---
title: 'Map Objects'
href: '#objects'
---

## Map Objects

Wherever we create a new object with the Google Maps Javascript API, we are returning it from `createStoreLocatorMap` so that you can perform further customizations on it after it is loaded. This includes the `Map` itself as well as the `InfoWindow`, `Autocomplete`, and search result `Marker`. We are not exposing anything from the search results panel because that is available in the DOM once it is rendered.

- `map`: [google.maps.Map](https://developers.google.com/maps/documentation/javascript/reference/map?hl=en#Map)
- `infoWindow`: [google.maps.InfoWindow](https://developers.google.com/maps/documentation/javascript/reference/info-window)
- `autocomplete`: [google.maps.places.Autocomplete](https://developers.google.com/maps/documentation/javascript/places-autocomplete)
- `originMarker`: [google.maps.Marker](https://developers.google.com/maps/documentation/javascript/markers)

Note that the `originMarker` is the pin that gets placed in the center of the map on search. If you'd like to customize the markers used on the store locations, that is done via the `map` object as seen below.

### Code

```TypeScript
import { createStoreLocatorMap, StoreLocatorMap } from '@gocrisp/store-locator';

import '@gocrisp/store-locator/dist/store-locator.css';

document.addEventListener('DOMContentLoaded', () => {
  const { map, infoWindow, autocomplete, originMarker } = await createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: '<your Google Maps API key>' },
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

  // The options above are the same as the Basic Usage example. This is where the fun happens:
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
});
```





