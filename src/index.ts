import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';

type StoreLocatorOptions = {
  // These are "optional" because we can't rely on TS to check things
  // in the case that users aren't using TS
  container?: HTMLElement | null;
  loaderOptions?: LoaderOptions;
  mapOptions?: google.maps.MapOptions;
  // geoJsonUrl?: string;
};

export const unitedStatesCenterLatLng = { lat: 39.8283, lng: -98.5795 };
export const defaultZoom = 4;

const defaultMapOptions = { center: unitedStatesCenterLatLng, zoom: defaultZoom };

export const createStoreLocatorMap = ({
  container,
  loaderOptions,
  mapOptions,
}: StoreLocatorOptions): Promise<google.maps.Map> => {
  if (!container) {
    throw new Error('You must define a `container` to put the map in.');
  }
  if (!loaderOptions || !loaderOptions.apiKey) {
    throw new Error('You must define the `loaderOptions` and its `apiKey`.');
  }

  const loader = new Loader(loaderOptions);

  return loader.load().then(() => {
    return new google.maps.Map(container, { ...defaultMapOptions, ...mapOptions });
  });
};
