---
title: 'Templates'
href: '#templates'
---

## Templates

Templates are specific display options that let you control the html that we are using on the different pieces of the Store Locator.

You can use these as simple options to change minor pieces of the html. Or you can make major changes to how everything is displayed in conjunction with adding your own CSS or modifying the `GeoJSON` with additional fields. Wherever we are referencing a "Feature" (store location), we are using the `google.maps.Data.Feature` object so that you will always have access to any extra properties you append to the `GeoJSON`.

### Code

```TypeScript
import { createStoreLocatorMap, StoreLocatorMap } from '@gocrisp/store-locator';

import '@gocrisp/store-locator/dist/store-locator.css';

document.addEventListener('DOMContentLoaded', () => {
  createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: '<your Google Maps API key>' },
    geoJson: './sample.json',
    mapOptions: { center: { lat: 52.632469, lng: -1.689423 }, zoom: 7 },
    infoWindowOptions: {
      template: ({ feature }) => feature.getProperty('store'),
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
});
```

### Defaults

These are the default templates that we are using for each part of the map if you do not define alternatives.

#### infoWindowOptions.template

This is what goes inside the popup bubble when you click on a location pin on the map. The null checks have been omitted for brevity.

```TypeScript
type ContentTemplateArgs = {
  feature: google.maps.Data.Feature;
  apiKey: string;
  formatLogoPath?: (feature: google.maps.Data.Feature) => string;
};

const template = ({ feature, apiKey, formatLogoPath }: ContentTemplateArgs): string => {
  const position = (feature.getGeometry() as google.maps.Data.Point).get();

  return `<div class="map_infowindow_content">
    <div class="map_info">
      <h2>${feature.getProperty('store')}</h2>
      <p>${feature.getProperty('storeFullAddress')}</p>
    </div>
    <img class="map_logo" src="${formatLogoPath(feature)}" alt="" />
    <img
      class="map_streetview"
      src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"
      alt=""
    />
  </div>`;
};
```

#### searchBoxOptions.template

This will be used to display the Search Box in the upper right corner of the map. It needs to include an `<input>` element to be used for the `Autocomplete`. This one is just a string because it is static.

```HTML
<div class="map_search-box-card">
  <label for="map_search-box">
    Find nearest store
  </label>
  <div class="map_search-box-input-container">
    <input id="map_search-box" type="text" placeholder="Enter an address" />
  </div>
</div>
```

#### storeListOptions.panelTemplate

This is the static part of the search results panel on the left of the map, so it is also a string. The ids are important here as they will be used to fill in the results.

```HTML
<h2 id="store-list-header">Nearby Locations</h2>
<button type="button" id="map_close-store-list-button" class="close-button">
  <img alt="Close Store List" src="https://www.google.com/intl/en_us/mapfiles/close.gif" />
</button>
<ul id="map_store-list"></ul>
<div id="map_store-list-message"></div>
```

#### storeListOptions.storeTemplate

This is used for the dynamic part of the search results panel. It will be displayed once per result. Similar to the infoWindowOptions template, this has a reference to the `store` and the `formatLogoPath` in the parameters. As before, null checks are omitted here for brevity.

We are using the `data-lat` and `data-lng` to re-center the map on click and open the corresponding InfoWindow.

```TypeScript
type DistanceResult = {
  feature: google.maps.Data.Feature;
  distanceText: string;
};

type ContentTemplateArgs = {
  store: DistanceResult;
  formatLogoPath?: (feature: google.maps.Data.Feature) => string;
};

const storeTemplate = ({ store, formatLogoPath }: ContentTemplateArgs): string => {
  const storeName = store.feature.getProperty('store');
  const address = store.feature.getProperty('storeFullAddress');
  const location = (store.feature.getGeometry() as google.maps.Data.Point).get();

  return `
    <li>
      <button
        data-lat="${location.lat()}"
        data-lng="${location.lng()}"
        title="${storeName}"
      >
        <p class="map_banner">${storeName}</p>
        <img class="map_logo" alt="" src="${formatLogoPath(store.feature)}" />
        <p class="map_distance">${store.distanceText}</p>
        <p class="map_address">${address}</p>
      </button>
    </li>
  `;
};

```
