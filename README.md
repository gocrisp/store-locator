# @gocrisp/store-locator

Store locator template page for use on any website. Intended for use with the Crisp GeoJSON connector.

## Add the store locator to your site

1. First, go set up a GeoJSON outbound connector on https://platform.gocrisp.com/. It will give you a URL to use later.
2. Create a [Google Maps API Key](https://developers.google.com/maps/gmp-get-started).
3. Install this package
```bash
yarn add @gocrisp/store-locator
```
4. Then, wherever you want to include the store locator map, insert this snippet:
```javascript
import storeLocator from '@gocrisp/store-locator';

storeLocator.init({
  component: document.getElementById('store-locator-map'),
  geoJsonUrl: '<URL from the GeoJSON connector>',
  loaderOptions: { apiKey: '<your Google Maps API key>' },
});
```

By default, this will use the center of the US and a zoom level of 4, but all [google maps options](https://developers.google.com/maps/documentation/javascript/overview#MapOptions) are configurable with the `mapOptions` property.


## Example App

To run the example app locally, you need to build the npm package into `dist` and then run the example app. You can either run the store-locator code with `yarn dev` to watch for changes or build it once with `yarn build`, but with the former you will need to run `dev` and `example` simultaneously.

```bash
yarn install
yarn start
```

The example is automatically updated from the `main` branch and served here:
https://gocrisp.github.io/store-locator
