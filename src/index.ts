import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { addInfoWindowListenerToMap, InfoWindowOptions } from './infoWindow';
import { addSearchBoxToMap, SearchBoxOptions } from './searchBox';
import { addStoreListToMapContainer, StoreListOptions } from './storeList';

import './styles.css';

export type StoreLocatorOptions = {
  /** DOM element that the map will be inserted into */
  container: HTMLElement;
  /** From https://www.npmjs.com/package/@googlemaps/js-api-loader
   * We are defaulting the use of `libraries: ['places', 'geometry']`.
   * You should also at least include an `apiKey`.
   */
  loaderOptions: LoaderOptions;
  /** The URL provided from your GeoJSON destination connector OR Custom GeoJSON that has already been loaded into the browser */
  geoJson: string | object; // eslint-disable-line @typescript-eslint/ban-types
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
  if (!options.loaderOptions || !options.loaderOptions.apiKey) {
    throw new Error('You must define the `loaderOptions` and its `apiKey`.');
  }
  if (!options.geoJson) {
    throw new Error('You must define the `geoJson` as a URL or GeoJSON object.');
  }
};

// We can use a method if the options need to rely on google.maps.* enums,
// Then we can wait until the google maps library has been loaded before we reference them
type Options = StoreLocatorOptions | ((loaded: boolean) => StoreLocatorOptions);

export const createStoreLocatorMap = (optionsArg: Options): Promise<StoreLocatorMap> => {
  let options: StoreLocatorOptions;
  if (optionsArg instanceof Function) {
    // we mostly just need the `loaderOptions` here and they will never be using the
    // google.maps.* references
    options = optionsArg(false);
  } else {
    options = optionsArg;
  }
  validateOptionsJs(options);

  const loader = new Loader({ ...options.loaderOptions, libraries: ['places', 'geometry'] });

  return loader.load().then(() => {
    if (optionsArg instanceof Function) {
      // Now we can determine the full options - including those with google.maps.* references
      options = optionsArg(true);
    }

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

    const map = new google.maps.Map(container, { ...defaultMapOptions, ...mapOptions });

    if (typeof geoJson === 'string') {
      map.data.loadGeoJson(geoJson);
    } else {
      map.data.addGeoJson(geoJson);
    }

    const { infoWindow, showInfoWindow } = addInfoWindowListenerToMap(
      map,
      loaderOptions.apiKey,
      infoWindowOptions ?? {},
      formatLogoPath,
    );

    const { showStoreList } = addStoreListToMapContainer(
      container,
      map,
      showInfoWindow,
      storeListOptions ?? {},
      formatLogoPath,
    );

    const searchBox = addSearchBoxToMap(map, showStoreList, searchBoxOptions ?? {});

    return { map, infoWindow, ...searchBox };
  });
};
