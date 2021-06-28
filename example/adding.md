---
title: 'Adding Data'
href: '#adding'
---

## Adding Data

Similarly to how you are able to use any json as the source for the map, you can add your own data to the data from the Crisp GeoJSON connector wherever you are setting up the map. Below are a few examples of how to do this.

The main example below shows how we can add two extra stores to the [Basic example](#). You'll notice how above, there are now points on the map in Oxford and Sheffield.

### Code

```TypeScript
import { Loader } from '@googlemaps/js-api-loader';
import { createStoreLocatorMap, StoreLocatorMap } from '@gocrisp/store-locator';

import '@gocrisp/store-locator/dist/store-locator.css';

document.addEventListener('DOMContentLoaded', async () => {
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
    // The rest is the same as the Basic example and optional for a US map.
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
});
```

### Other Options

Above, we're loading one set of data from a URL that has GeoJSON data and another set of data is provided inline and then they are combined and added to the map. 

You can load data from multiple sources in any way that is useful for that particular data set. Here are a few examples.


#### Load preformatted GeoJSON


As seen above, this is how we would load the data from Crisp's GeoJSON connector, replacing "sample.json" with the URL provided in the connector. Any URL that contains formatted GeoJSON can be used in this way.

Note, we expect each "Feature" to contain properties for `store` and `storeFullAddress`. If they are not, we can format the data like we do in the CSV example below, or it's possible to change the [Templates](#templates) to conform to the alternate format.

```TypeScript
const crispJsonSample = await fetch('sample.json');
const crispJson = await crispJsonSample.json();
```

#### Static data inline

```TypeScript
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
  ...
];
```

#### From a CSV

As long as the CSV is hosted online somewhere that can be accessed by the user loading the map, you can use the CSV directly with something like [papaparse](https://www.papaparse.com/).

Assuming your columns are: Store Name, Store Address, Latitutde, Longitude, and you have this file ("sample.csv"):
```CSV
Quadrant Shopping Centre,Dilwyn St Swansea SA1 3QW United Kingdom,51.620153,-3.934483
Bullring Open Market,5BB Edgbaston St Birmingham United Kingdom,52.476142,-1.891116
```

You could load it with the following snippet and add it to the `allStores` array:
```TypeScript
const fetchResult = await fetch('sample.csv');
const fetchText = await fetchResult.text();
const csv = Papa.parse<string>(fetchText);
const csvStores = csv.data.map(store => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [+store[3], +store[2]],
  },
  properties: {
    store: store[0],
    storeFullAddress: store[1],
  },
}));
```
