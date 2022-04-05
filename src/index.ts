import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { addInfoWindowListenerToMap, InfoWindowOptions } from './infoWindow';
import { addSearchBoxToMap, SearchBoxOptions } from './searchBox';
import { addStoreListToMapContainer, StoreList, StoreListOptions } from './storeList';

import './styles.css';

export type StoreLocatorOptions = {
  /** DOM element that the map will be inserted into */
  container: HTMLElement;
  /** From https://www.npmjs.com/package/@googlemaps/js-api-loader
   * We are defaulting the use of `libraries: ['places', 'geometry']`.
   * You should also at least include an `apiKey`.
   * Optional only if you are pre-loading the google maps library.
   */
  loaderOptions?: LoaderOptions;
  /** The URL provided from your GeoJSON destination connector OR Custom GeoJSON that has already been loaded into the browser */
  geoJson: string | object;
  /** By default we are centering on the entire US */
  mapOptions?: google.maps.MapOptions;
  /** Optional - if you don't include this then logos won't be shown */
  formatLogoPath?: (feature: google.maps.Data.Feature) => string;
  infoWindowOptions?: InfoWindowOptions;
  searchBoxOptions?: SearchBoxOptions;
  storeListOptions?: StoreListOptions;
};

export type StoreLocatorMap = {
  map: google.maps.Map;
  infoWindow: google.maps.InfoWindow;
  autocomplete: google.maps.places.Autocomplete;
  originMarker: google.maps.Marker;
  storeList: StoreList;
};

export const defaultCenter = { lat: 39.8283, lng: -98.5795 };
export const defaultZoom = 4;

const defaultMapOptions = { center: defaultCenter, zoom: defaultZoom };

const validateOptionsJs = (options?: Partial<StoreLocatorOptions>) => {
  if (!options) {
    throw new Error('You must define the required options.');
  }
  if (!options.container) {
    throw new Error('You must define a `container` element to put the map in.');
  }
  if (!options.geoJson) {
    throw new Error('You must define the `geoJson` as a URL or GeoJSON object.');
  }
};

export const createStoreLocatorMap = async (
  options: StoreLocatorOptions,
): Promise<StoreLocatorMap> => {
  validateOptionsJs(options);

  const {
    container,
    loaderOptions,
    geoJson,
    mapOptions,
    formatLogoPath,
    infoWindowOptions,
    searchBoxOptions,
    storeListOptions,
  } = options;

  if (!window.google || !window.google.maps || !window.google.maps.version) {
    if (!loaderOptions || !loaderOptions.apiKey) {
      throw new Error('You must define the `loaderOptions` and its `apiKey`.');
    }
    const loader = new Loader({ ...loaderOptions, libraries: ['places', 'geometry'] });
    await loader.load();
  } else if (!window.google.maps.geometry || !window.google.maps.places) {
    throw new Error(
      'If you are loading the Google Maps JS yourself, you need to load the `places` and `geometry` libraries with it.',
    );
  }

  const map = new google.maps.Map(container, { ...defaultMapOptions, ...mapOptions });

  if (typeof geoJson === 'string') {
    map.data.loadGeoJson(geoJson);
  } else {
    map.data.addGeoJson(geoJson);
  }

  const { infoWindow, showInfoWindow } = addInfoWindowListenerToMap(
    map,
    infoWindowOptions ?? {},
    loaderOptions?.apiKey,
    formatLogoPath,
  );

  const storeList = addStoreListToMapContainer(
    container,
    map,
    showInfoWindow,
    storeListOptions ?? {},
    formatLogoPath,
  );

  const searchBox = addSearchBoxToMap(map, storeList.showStoreList, searchBoxOptions ?? {});

  return { map, infoWindow, ...searchBox, storeList };
};
