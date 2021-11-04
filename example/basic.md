---
title: 'Basic Usage'
href: '#'
---

## Basic Usage

Please refer to the [README on Github](https://github.com/gocrisp/store-locator) for basic installation instructions. Below is how we are initializing the example above.

### See Also

- [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/overview)
- [Google Maps Basic Store Locator Tutorial](https://developers.google.com/codelabs/maps-platform/google-maps-simple-store-locator)
- [sample.json](sample.json)

### Code

We recommend you use NPM to install the `@gocrisp/store-locator` package, but if you are not using modern tooling the "Script tag" example will show you how to use our hosted version.

<div class="tabs-body">
  <ul class="nav nav-tabs tabs" role="tablist">
    <li class="nav-item" role="presentation">
      <a class="nav-link active" id="npm-tab" data-bs-toggle="tab" data-bs-target="#npm" type="button" role="tab" aria-controls="npm" aria-selected="true">NPM</a>
    </li>
    <li class="nav-item" role="presentation">
      <a class="nav-link" id="legacy-tab" data-bs-toggle="tab" data-bs-target="#legacy" type="button" role="tab" aria-controls="legacy" aria-selected="false">Script tag</a>
    </li>
  </ul>
  <div class="tab-content">
    <div class="tab-pane fade show active" id="npm" role="tabpanel" aria-labelledby="npm-tab">


```TypeScript
import { createStoreLocatorMap, StoreLocatorMap } from '@gocrisp/store-locator';

import '@gocrisp/store-locator/dist/store-locator.css';

document.addEventListener('DOMContentLoaded', () => {
  createStoreLocatorMap({
    container: document.getElementById('map-container') as HTMLElement,
    loaderOptions: { apiKey: '<your Google Maps API key>' },
    geoJson: 'sample.json',
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

</div>
<div class="tab-pane fade" id="legacy" role="tabpanel" aria-labelledby="legacy-tab">

```HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://storage.googleapis.com/crisp-store-locator/${package_version}/dist/store-locator.css" />
    <title>Store Locator Example</title>

    <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', function () {
        window.storeLocator.createStoreLocatorMap({
          container: document.getElementById("map-container"),
          // Replace with the URL from the GeoJSON Outbound Connector
          geoJson: 'sample.json',
          mapOptions: { center: { lat: 52.632469, lng: -1.689423 }, zoom: 7 },
          formatLogoPath: function (feature) {
            // Replace with the path to your logos
            return `https://storage.googleapis.com/crisp-store-locator/${package_version}/static/img/${feature
              .getProperty('store')
              .toLowerCase()
              // remove after 2nd space
              .split(' ')
              .slice(0, 2)
              .join('')
              // remove special characters
              .replace(/[^a-z0-9]/g, '')}.png`;
          },
          searchBoxOptions: {
            autocompleteOptions: {
              componentRestrictions: { country: 'gb' },
            },
          },
          storeListOptions: {
            filterFn: function (_, i) { return i < 12; },
            unitSystem: 'metric',
          },
        });
      });
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry,places"></script>
    <script src="https://storage.googleapis.com/crisp-store-locator/${package_version}/dist/store-locator.umd.js"></script>
  </head>
  <body>
    <h1>Map Example</h1>
    <div id="map-container" style="height: 400px"></div>
  </body>
</html>
```

</div>
</div>
</div>



## Options

All of the available configurations options are listed below. More customization is also possible via the [Google Map Objects](#objects) that we return upon initialization. There are more details about the more complex options in the [options](#options) example and information about how to configure the templates in the [templates](#templates) example.


<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Required</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>container</code></td>
      <td>✅</td>
      <td><code>HTMLElement</code></td>
      <td>
        The element on the page where the map will go. It should have a height defined. This is the same container you'd call <code>new google.maps.Map(container)</code> with if you were initializing it directly.
      </td>
    </tr>
    <tr>
      <td><code>loaderOptions</code></td>
      <td>✅*</td>
      <td><code>LoaderOptions</code></td>
      <td>
        The options as defined for the <a href="https://www.npmjs.com/package/@googlemaps/js-api-loader">Google Maps Javascript API Loader</a>. We are requiring an <code>apiKey</code> be passed in. We are automatically including the "places" and "geometry" libraries, since they are necessary for the functionality in this component, but this can be easily overridden here.
        <br/><br/>
        *This is required unless you are pre-loading the google maps library. If you omit it in that case, the streetview not be shown in the <code>InfoWindow</code>.
      </td>
    </tr>
    <tr>
      <td><code>geoJson</code></td>
      <td>✅</td>
      <td><code>string</code> (URL) or <code>object</code> (GeoJSON)</td>
      <td>
        This will usually be the URL of a GeoJSON file or endpoint. This is where you will put the <code>URL</code> from the outbound connector. If you need more control over what is getting passed in, you can pass a JSON object in here with the GeoJSON.
      </td>
    </tr>
    <tr>
      <td><code>mapOptions</code></td>
      <td></td>
      <td>
        <a href="https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions">google.maps.MapOptions</a>
      </td>
      <td>
        By default we are including a <code>center</code> at the middle of the United States and a <code>zoom</code> of 4.
      </td>
    </tr>
    <tr>
      <td><code>formatLogoPath</code></td>
      <td></td>
      <td><code>(feature: google.maps.Data.Feature) => string</code></td>
      <td>
        This method will be used to determine how to include an image based on store name in the <code>feature</code> object. You will usually want to remove spaces, add a folder and a file extension, etc. See example above.
      </td>
    </tr>
    <tr>
      <td><code>infoWindowOptions</code></td>
      <td></td>
      <td><pre>
{
  <a href="https://developers.google.com/maps/documentation/javascript/reference/info-window?hl=en#InfoWindowOptions">infoWindowOptions</a>,
  <a href="#templates">template</a>: () => string,
}</pre>
      </td>
      <td>
        These options define how the "info window" is displayed when you click on a map marker.
      </td>
    </tr>
    <tr>
      <td><code>searchBoxOptions</code></td>
      <td></td>
      <td><pre>
{
  <a href="https://developers.google.com/maps/documentation/javascript/places-autocomplete?hl=en#add-autocomplete">autocompleteOptions</a>,
  <a href="https://developers.google.com/maps/documentation/javascript/markers?hl=en#add">originMarkerOptions</a>,
  <a href="https://developers.google.com/maps/documentation/javascript/controls?hl=en#ControlPositioning">controlPosition</a>,
  <a href="#templates">template</a>: string,
  searchZoom: number,
}</pre>
      </td>
      <td>
        This will let you configure how the search box in the upper right corner will be displayed.
      </td>
    </tr>
    <tr>
      <td><code>storeListOptions</code></td>
      <td></td>
      <td><pre>
{
  filterFn: (item, index, map) => boolean;
  <a href="https://developers.google.com/maps/documentation/distance-matrix/overview?hl=en#travel_modes">travelMode</a>,
  unitSystem: 'imperial' | 'metric',
  <a href="#templates">panelTemplate</a>: string;
  <a href="#templates">storeTemplate</a>: () => string;
}</pre>
      </td>
      <td>
        This will define how the results are calculated and how the results are displayed in the left panel when searching.
      </td>
    </tr>
  </tbody>
</table>
