---
title: 'Display Options'
href: '#options'
---

## Display Options

Anywhere that we are passing in an "options" object as defined by the Google Maps Javascript API, we are including it in the `StoreLocatorOptions` for you to customize. We use minimal defaults so that they are easy to override.

These are described at a high level on our [Basic Usage](#) example. Template options are described [here](#templates).

<div class="alert alert-info">
Google Enums: Note that for any options that require the <code>google.maps.*</code> reference, you must pass in the options as a function. You will get an error if you try to reference <code>google.maps</code> as a value unless the maps library has loaded so this function will take one boolean parameter of whether or not the library has been loaded, that you can then use to determine whether it is safe to reference <code>google.maps</code> yet or not. See how we are defining <code>searchBoxOptions.controlPosition</code> below.
</div>

### Code

```TypeScript
import { createStoreLocatorMap, StoreLocatorMap } from '@gocrisp/store-locator';

import '@gocrisp/store-locator/dist/store-locator.css';

document.addEventListener('DOMContentLoaded', () => {
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
});
```

### Options details

#### geoJson

Normally, this will just be the url of a [GeoJSON](https://geojson.org/) file. It needs to have a type of `FeatureCollection`. When using this with a Crisp GeoJSON Outbound Connector, the URL will be supplied to you.

One way that this could be customized is by parsing it with your own backend service and adding extra information to each "Feature". The way that the [templates](#templates) are set up, you can easily customize them to include extra data or re-formatted data.

You can also customize this by loading the GeoJSON in the browser, modifying it, and passing the JSON object in for this object. This could also be useful (with or without modifying it) if you need to define how this file is being loaded. In the example above, we are passing in a couple of static points to put on the map instead of using a file at all.


#### mapOptions

These are the [`google.maps.MapOptions`](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions) that get passed in on map creation. If don't pass in anything for `mapOptions`, the following will be used:

```json
{
  center: { // the center of the US
    lat: 39.8283,
    lng: -98.5795,
  },
  zoom: 4,
}
```

In the example above, you can see that we've let the center default to the middle of the US this time, but we've still customized the zoom to be more zoomed-in than '4'. We've also turned off the `scrollwheel` functionality so that the user has to use the `+` and `-` to zoom.


#### formatLogoPath

Logos are displayed on both the `infoWindow` (when you click on a map pin) and on the search results pane on the left. By default, both of the templates (`infoWindowOptions.template` and `storeListOptions.template`) use the method you define here. You may choose to [customize those templates](#templates) instead of defining `formatLogoPath`.

You can also choose whether to display logos at all. If this option is omitted, no logo will be displayed. The intention of this method is to let you define where your logos are and what format they are in. It is also useful for removing special characters.

If we have two files in the `/img` directory, [`josiescafe.png`](/img/josiescafe.png) and [`josiespatisserie.png`](/img/josiespatisserie.png), we could use this definition to format the path from banners with the values of "Josie's Cafe" and "Josie's Patisserie":

```TypeScript
formatLogoPath: feature =>
  `img/${feature
    .getProperty('banner')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')}.png`,
```

In the main example above, you can see how we can alternatively use one static image and not base the definition on the feature at all.


#### infoWindowOptions

These are the options that will help you to customize the `InfoWindow` that pops up when you click on a map marker. The inner `infoWindowOptions` accepts anything from Google's [InfoWindowOptions](https://developers.google.com/maps/documentation/javascript/reference/info-window?hl=en#InfoWindowOptions) and we are setting the `pixelOffset` by default. In the example above we are also adding a `minWidth` just for demonstration purposes.

```TypeScript
infoWindowOptions: {
  infoWindowOptions: {
    // default:
    pixelOffset: new google.maps.Size(0, -30),
  },
  template: () => string, // see "templates" doc
}
```

#### searchBoxOptions

These options have to do with how we display the search box and what happens when you search. We are using an [Autocomplete](https://developers.google.com/maps/documentation/javascript/places-autocomplete) here instead of a SearchBox so that the user is more likely to find a store that is defined in our GeoJSON. These are the defaults that we are defining:

```TypeScript
searchBoxOptions: {
  autocompleteOptions: {
    types: ['address'],
    componentRestrictions: { country: 'us' },
    fields: ['address_components', 'geometry', 'name'],
  },
  originMarkerOptions: {
    map, // reference to the map
    visible: false, // this gets set to "true" on search
    position: map.getCenter(), // based on search results
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
  },
  controlPosition: google.maps.ControlPosition.TOP_RIGHT,
  template: string, // see "templates" doc
  searchZoom: 9,
}
```

##### autocompleteOptions

These define how the search box will behave. See [here](https://developers.google.com/maps/documentation/javascript/places-autocomplete#add-autocomplete) for a list of the options that are available. By default, we are searching based on address and limiting the results to those in the US.

##### originMarkerOptions

This will configure the marker that shows up in the center of the map (on the found location) when you search. Any of the [`google.maps.MarkerOptions`](https://developers.google.com/maps/documentation/javascript/markers?hl=en) are valid here. The defaults that we set are mostly just for reference and things like showing and hiding based on whether a search was performed or not.

##### controlPosition

This just defines where on the map the search box will be displayed. We are defaulting to `TOP_RIGHT` but any of the `google.maps.ControlPosition` values are valid. See the note above about using Google's enum values.

##### searchZoom

This is defaulted to 9. The intention is to zoom in on a pin once you have searched for a location. 

#### storeListOptions

These options will configure how the search results are computed and displayed. These are the defaults.

```TypeScript
storeListOptions: {
  filterFn: (item: DistanceResult, i: number) => i < 10,
  travelMode: google.maps.TravelMode.DRIVING,
  unitSystem: 'imperial',
  panelTemplate: string, // see "templates" doc
  storeTemplate: () => string,
}
```

##### filterFn

This function will let you filter the search results based on any criteria. By default the results list is truncated to 10 results. This will return a boolean result based on whether the item should be included in the results list. The parameters are:
- `item`, which is a `DistanceResult` with a property for `feature` (the `google.maps.Data.Feature`) and the `distanceText`, which is the string which states how far this item is from the center of the map, e.g., "5.2 mi".
- `i`, the index of the result. Useful for truncating the list.

Note that the results list is already truncated by the limits on the Distance Matrix API. We are limited to 25 destinations. So before we determine actual driving distances, we are using the "geometry" library to find the 25 locations closest to the center (the searched point), by straight-line distance. Then we use the Distance Matrix API to get the driving distance to those results and display the driving distance on the results.

##### travelMode

This will be used to determine the distance to the location via the [Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/overview#travel_modes). We are using `DRIVING` as the default.

##### unitSystem

Either 'metric' or 'imperial', this will determine how the results are displayed - in miles or kilometers.
