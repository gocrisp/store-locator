# @gocrisp/store-locator

[![Package Version](https://img.shields.io/npm/v/@gocrisp/store-locator.svg)](https://www.npmjs.com/package/@gocrisp/store-locator) [![MIT License](https://img.shields.io/npm/l/stack-overflow-copy-paste.svg)](http://opensource.org/licenses/MIT)

A store locator component for use on any website. Intended for use with the Crisp GeoJSON connector. 

This uses the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview) to easily create a simple store locator from any GeoJSON source.

This package is intended to be framework-agnostic. We are using [microbundle](https://github.com/developit/microbundle) to create a package that supports many formats (CJS, UMD, ESM). Since we like to use TypeScript, types are available (but not required). And since we love React, we have also published a [React Component version](https://github.com/gocrisp/react-store-locator).

Please refer to [our example page](https://gocrisp.github.io/store-locator/) to see this package in action and for more advanced usage examples. The steps below will provide the minimum for creating a store locator.

## Create a Store Locator

### Set up services

First, go set up a GeoJSON outbound connector on https://platform.gocrisp.com/. It will give you a URL to use later. <!--TODO: needs details/link to BYT-573 or updates if we aren't using an outbound connector -->

Create a [Google Maps API Key](https://developers.google.com/maps/gmp-get-started) with the following APIs enabled:
- `Maps JavaScript API`
- `Places API`
- `Distance Matrix API`.


### Simple Implementation
Install this package
```bash
yarn add @gocrisp/store-locator
```

Then, wherever you want to include the store locator map, insert this snippet:
```javascript
import { createStoreLocatorMap } from '@gocrisp/store-locator';

createStoreLocatorMap({
  component: document.getElementById('store-locator-map'),
  geoJson: '<URL from the GeoJSON connector>',
  loaderOptions: { apiKey: '<your Google Maps API key>' },
});
```

Most of the Google Maps JavaScript API options and objects are available for customization as well. More details are available in the [examples and documentation](todo).

## Run the Example App Locally

To run the [example app](https://gocrisp.github.io/store-locator) locally, you need to build the npm package into `dist` and then run the example app. You can either run the store-locator code with `yarn dev` to watch for changes or build it once with `yarn build`, but with the former you will need to run `dev` and `example` simultaneously.

```bash
yarn install
yarn start
```
