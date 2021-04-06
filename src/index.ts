import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { addInfoWindowListenerToMap, InfoWindowOptions } from './infoWindow';
import { addSearchBoxToMap, SearchBox, SearchBoxOptions } from './searchBox';
import { addStoreListToMapContainer, StoreListOptions } from './storeList';

export type StoreLocatorOptions = {
  /** DOM element that the map will be inserted into */
  container: HTMLElement;
  /** From https://www.npmjs.com/package/@googlemaps/js-api-loader
   * We are enforcing the use of `libraries: ['places']`.
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
  searchBox: SearchBox;
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

export const createStoreLocatorMap = (options: StoreLocatorOptions): Promise<StoreLocatorMap> => {
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

  const loader = new Loader({ ...loaderOptions, libraries: ['places'] });

  return loader.load().then(() => {
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

    return { map, infoWindow, searchBox };
  });
};
