import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';

type StoreLocatorOptions = {
  // These are "optional" because we can't rely on TS to check things
  // in the case that users aren't using TS
  container?: HTMLElement | null;
  loaderOptions?: LoaderOptions;
  geoJsonUrl?: string;
  mapOptions?: google.maps.MapOptions;
};

type StoreLocatorMap = {
  map: google.maps.Map;
  infoWindow: google.maps.InfoWindow;
};

export const defaultCenter = { lat: 52.632469, lng: -1.689423 };
export const defaultZoom = 7;

const defaultMapOptions = { center: defaultCenter, zoom: defaultZoom };

// TODO make this overrideable
const infoWindowContentTemplate = (feature: google.maps.Data.Feature) =>
  `<h2>${feature.getProperty('name')}</h2>
  <p>${feature.getProperty('description')}</p>
  <p>
  <b>Open:</b> ${feature.getProperty('hours')}
  <br/><b>Phone:</b> ${feature.getProperty('phone')}
  </p>`;

export const createStoreLocatorMap = ({
  container,
  loaderOptions,
  geoJsonUrl,
  mapOptions,
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

    const infoWindow = new google.maps.InfoWindow();
    infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });

    map.data.addListener('click', ({ feature }: { feature: google.maps.Data.Feature }) => {
      infoWindow.setContent(infoWindowContentTemplate(feature));
      infoWindow.setPosition((feature.getGeometry() as google.maps.Data.Point).get());
      infoWindow.open(map);
    });

    return { map, infoWindow };
  });
};
