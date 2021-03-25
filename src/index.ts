import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { addInfoWindowListenerToMap } from './infoWindow';
import { ContentTemplateArgs } from './infoWindow/contentTemplate';
import { addSearchBoxToMap, SearchBoxOptions } from './searchBox';

type StoreLocatorOptions = {
  container: HTMLElement;
  loaderOptions: LoaderOptions;
  geoJsonUrl: string;
  mapOptions?: google.maps.MapOptions;
  infoWindowTemplate?: (args: ContentTemplateArgs) => string;
  logoRootPath?: string;
  logoExtension?: string;
  searchBoxOptions?: SearchBoxOptions;
};

type StoreLocatorMap = {
  map: google.maps.Map;
  infoWindow: google.maps.InfoWindow;
  searchBox: google.maps.places.Autocomplete;
};

export const defaultCenter = { lat: 52.632469, lng: -1.689423 };
export const defaultZoom = 7;

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
  if (!options.geoJsonUrl) {
    throw new Error('You must define the `geoJsonUrl`.');
  }
};

export const createStoreLocatorMap = (options: StoreLocatorOptions): Promise<StoreLocatorMap> => {
  validateOptionsJs(options);

  const {
    container,
    loaderOptions,
    geoJsonUrl,
    mapOptions,
    infoWindowTemplate,
    logoRootPath,
    logoExtension,
    searchBoxOptions,
  } = options;

  const loader = new Loader({ ...loaderOptions, libraries: ['places'] });

  return loader.load().then(() => {
    const map = new google.maps.Map(container, { ...defaultMapOptions, ...mapOptions });

    map.data.loadGeoJson(geoJsonUrl);

    const infoWindow = addInfoWindowListenerToMap(
      map,
      loaderOptions.apiKey,
      infoWindowTemplate,
      logoRootPath,
      logoExtension,
    );

    const searchBox = addSearchBoxToMap(map, searchBoxOptions ?? {});

    return { map, infoWindow, searchBox };
  });
};
