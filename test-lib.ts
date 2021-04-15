import geoJson from './static/sample.json';

export const getRandomInt = (): number => Math.floor(Math.random() * Math.floor(10000));

// from google.maps.ControlPosition
enum ControlPosition {
  BOTTOM_CENTER = 0.0,
  BOTTOM_LEFT = 1.0,
  BOTTOM_RIGHT = 2.0,
  LEFT_BOTTOM = 3.0,
  LEFT_CENTER = 4.0,
  LEFT_TOP = 5.0,
  RIGHT_BOTTOM = 6.0,
  RIGHT_CENTER = 7.0,
  RIGHT_TOP = 8.0,
  TOP_CENTER = 9.0,
  TOP_LEFT = 10.0,
  TOP_RIGHT = 11.0,
}
enum TravelMode {
  BICYCLING = 'BICYCLING',
  DRIVING = 'DRIVING',
  TRANSIT = 'TRANSIT',
  WALKING = 'WALKING',
}
enum UnitSystem {
  IMPERIAL = 0.0,
  METRIC = 1.0,
}
enum DistanceMatrixStatus {
  INVALID_REQUEST = 'INVALID_REQUEST',
  MAX_DIMENSIONS_EXCEEDED = 'MAX_DIMENSIONS_EXCEEDED',
  MAX_ELEMENTS_EXCEEDED = 'MAX_ELEMENTS_EXCEEDED',
  OK = 'OK',
  OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
  REQUEST_DENIED = 'REQUEST_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const mockGoogleMaps = (
  container: HTMLElement,
  limitDistanceMatrixService?: number,
): void => {
  const mapAddListenerMock = jest.fn();
  const dataAddListenerMock = jest.fn();

  // Add a fake "marker" so we can give it an onclick that we can trigger in tests
  const marker = document.createElement('button');
  marker.setAttribute('data-testid', 'mock-marker');
  container.appendChild(marker);

  const getStoreByLocation = (location: google.maps.LatLng) =>
    geoJson.features.find(
      s =>
        s.geometry.coordinates[0] === location.lng() &&
        s.geometry.coordinates[1] === location.lat(),
    );

  global.google = {
    maps: {
      Map: jest.fn(),
      // @ts-expect-error: not mocking the whole thing
      Marker: jest.fn(),
      InfoWindow: jest.fn(),
      Size: jest.fn(),
      ControlPosition,
      // @ts-expect-error: not mocking the whole thing
      places: {
        Autocomplete: jest.fn(),
      },
      DistanceMatrixService: jest.fn(),
      TravelMode,
      UnitSystem,
      DistanceMatrixStatus,
      geometry: {
        // @ts-expect-error: not mocking the whole thing
        spherical: {
          computeDistanceBetween: jest
            .fn()
            .mockImplementation((_, location: google.maps.LatLng) => {
              // Should be the same three as defined in the getDistanceMatrix mock plus two others
              const returnInFirstSort = ['Bristol', 'Cardiff', 'Wimborne', 'Brighton', 'Newtown'];
              const store = getStoreByLocation(location);
              if (store && returnInFirstSort.find(name => store.properties.store.includes(name))) {
                return 0;
              }

              return 1;
            }),
        },
      },
    },
  };

  (global.google.maps.DistanceMatrixService as jest.Mock).mockImplementation(() => ({
    getDistanceMatrix: jest
      .fn()
      .mockImplementation(
        ({ destinations }: { destinations: Array<google.maps.LatLng> }, callback) => {
          // this tests to make sure that we are truncating the original list properly
          // google maps api DistanceMatrixService will fail if we pass in >25 destinations
          if (limitDistanceMatrixService && destinations.length > limitDistanceMatrixService) {
            throw new Error(
              `Too many destinations passed into the DistanceMatrixService request (${destinations.length})`,
            );
          }

          const elements = destinations.map((location: google.maps.LatLng) => {
            const store = getStoreByLocation(location);
            let value = getRandomInt() + 4;
            if (store?.properties.store === "Josie's Patisserie Bristol") {
              value = 1;
            } else if (store?.properties.store === "Josie's Patisserie Cardiff") {
              value = 2;
            } else if (store?.properties.store === "Josie's Patisserie Wimborne") {
              value = 3;
            }

            return { distance: { value, text: 'distance' } };
          });

          callback({ rows: [{ elements }] }, google.maps.DistanceMatrixStatus.OK);
        },
      ),
  }));

  (global.google.maps.Map as jest.Mock).mockImplementation(() => ({
    setZoom: jest.fn(),
    setCenter: jest.fn(),
    getCenter: jest.fn().mockImplementation(() => 'map-center'),
    addListener: mapAddListenerMock,
    data: {
      loadGeoJson: jest.fn(),
      addGeoJson: jest.fn(),
      addListener: dataAddListenerMock,
      forEach: jest.fn().mockImplementation((callback: () => void) =>
        geoJson.features
          .map(f => ({
            getProperty: (name: 'store' | 'storeFullAddress') => f.properties[name] as string,
            getGeometry: () => ({
              get: () => ({
                lng: () => f.geometry.coordinates[0],
                lat: () => f.geometry.coordinates[1],
              }),
            }),
          }))
          .forEach(callback),
      ),
    },
    controls: {
      [google.maps.ControlPosition.BOTTOM_RIGHT]: {
        push: jest.fn(component => container.appendChild(component)),
      },
      [google.maps.ControlPosition.TOP_RIGHT]: {
        push: jest.fn(component => container.appendChild(component)),
      },
    },
  }));

  (global.google.maps.InfoWindow as jest.Mock).mockImplementation(() => ({
    setContent: jest.fn(),
    setPosition: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
  }));

  (global.google.maps.places.Autocomplete as jest.Mock).mockImplementation(function (
    input: HTMLInputElement,
  ) {
    return {
      addListener: jest.fn().mockImplementation((type: string, callback: () => Promise<void>) => {
        if (type === 'place_changed') {
          input.onkeypress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              callback();
            }
          };
        }
      }),
      getPlace: jest
        .fn()
        .mockImplementation(() => ({ geometry: { location: { lat: 1, lng: 2 } } })),
    };
  });

  // @ts-expect-error: not mocking the whole thing
  (global.google.maps.Marker as jest.Mock).mockImplementation(() => ({
    setVisible: jest.fn(),
    setPosition: jest.fn(),
  }));

  mapAddListenerMock.mockImplementation((_, handler: () => void) => {
    container.onclick = handler;
  });

  dataAddListenerMock.mockImplementation(
    (_, handler: (event: { feature: google.maps.Data.Feature }) => void) => {
      marker.onclick = () => {
        handler({ feature: mockFeature({ store: 'Store 2' }) });
      };
    },
  );
};

export const mockFeature = (properties: Record<string, unknown>): google.maps.Data.Feature =>
  (({
    getProperty: (name: string) => properties[name],
    getGeometry: () => ({
      get: () => ({ lat: () => 1, lng: () => 2, positionName: 'testPosition' }),
    }),
  } as unknown) as google.maps.Data.Feature);
