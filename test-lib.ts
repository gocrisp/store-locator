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

export const mockGoogleMaps = (container: HTMLElement): void => {
  const mapAddListenerMock = jest.fn();
  const dataAddListenerMock = jest.fn();

  // Add a fake "marker" so we can give it an onclick that we can trigger in tests
  const marker = document.createElement('button');
  marker.setAttribute('data-testid', 'mock-marker');
  container.appendChild(marker);

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
    },
  };

  (global.google.maps.Map as jest.Mock).mockImplementation(() => ({
    setZoom: jest.fn(),
    setCenter: jest.fn(),
    getCenter: () => 'map-center',
    addListener: mapAddListenerMock,
    data: {
      loadGeoJson: jest.fn(),
      addListener: dataAddListenerMock,
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

  (global.google.maps.places.Autocomplete as jest.Mock).mockImplementation(() => ({
    addListener: jest.fn(),
    getPlace: jest.fn(),
  }));

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
        handler({ feature: mockFeature({ name: 'Store 2' }) });
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
