import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { addInfoWindowListenerToMap } from './infoWindow';
import { ContentTemplateArgs } from './infoWindow/contentTemplate';

type StoreLocatorOptions = {
  // These are "optional" because we can't rely on TS to check things
  // in the case that users aren't using TS
  container?: HTMLElement | null;
  loaderOptions?: LoaderOptions;
  geoJsonUrl?: string;
  mapOptions?: google.maps.MapOptions;
  infoWindowTemplate?: (args: ContentTemplateArgs) => string;
};

type StoreLocatorMap = {
  map: google.maps.Map;
  infoWindow: google.maps.InfoWindow;
};

export const defaultCenter = { lat: 52.632469, lng: -1.689423 };
export const defaultZoom = 7;

const defaultMapOptions = { center: defaultCenter, zoom: defaultZoom };

export const createStoreLocatorMap = ({
  container,
  loaderOptions,
  geoJsonUrl,
  mapOptions,
  infoWindowTemplate,
}: StoreLocatorOptions): Promise<StoreLocatorMap> => {
  if (!container) {
    throw new Error('You must define a `container` element to put the map in.');
  }
  if (!loaderOptions || !loaderOptions.apiKey) {
    throw new Error('You must define the `loaderOptions` and its `apiKey`.');
  }
  if (!geoJsonUrl) {
    throw new Error('You must define the `geoJsonUrl`.');
  }

  const loader = new Loader(loaderOptions);

  return loader.load().then(() => {
    const map = new google.maps.Map(container, { ...defaultMapOptions, ...mapOptions });

    map.data.loadGeoJson(geoJsonUrl);

    const infoWindow = addInfoWindowListenerToMap(map, loaderOptions.apiKey, infoWindowTemplate);

    return { map, infoWindow };
  });
};
