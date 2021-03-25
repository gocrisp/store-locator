import '@testing-library/jest-dom';
import { mocked } from 'ts-jest/utils';
import { Loader } from '@googlemaps/js-api-loader';
import { createStoreLocatorMap, defaultZoom, defaultCenter } from '../';
import { getRandomInt } from '../../test-lib';
import { ContentTemplateArgs } from '../infoWindow/contentTemplate';

jest.mock('@googlemaps/js-api-loader');
const mockLoader = mocked(Loader, true);

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

describe('storeLocator', () => {
  const loaderOptions = { apiKey: getRandomInt() + '' };
  const geoJsonUrl = 'http://example.com/geo.json';
  const dataAddListenerMock = jest.fn();
  let clickItemHandler: (properties: Record<string, unknown>) => void;

  let container: HTMLElement;

  beforeEach(() => {
    mockLoader.mockClear();
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    // @ts-expect-error: not mocking the whole thing
    mockLoader.mockImplementation(() => ({ load: () => Promise.resolve() }));

    global.google = {
      maps: {
        Map: jest.fn(),
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
      addListener: jest.fn(),
      data: {
        loadGeoJson: jest.fn(),
        addListener: dataAddListenerMock,
      },
      controls: {
        [google.maps.ControlPosition.TOP_RIGHT]: {
          push: jest.fn(component => container.appendChild(component)),
        },
      },
    }));

    (global.google.maps.InfoWindow as jest.Mock).mockImplementation(() => ({
      setContent: jest.fn(),
      setPosition: jest.fn(),
      setOptions: jest.fn(),
      open: jest.fn(),
    }));

    dataAddListenerMock.mockImplementation(
      (_, handler: (event: { feature: google.maps.Data.Feature }) => void) => {
        clickItemHandler = (properties: Record<string, unknown>) => {
          const feature = ({
            getProperty: (name: string) => properties[name],
            getGeometry: () => ({
              get: () => ({ lat: () => 1, lng: () => 2, positionName: 'testPosition' }),
            }),
          } as unknown) as google.maps.Data.Feature;
          handler({ feature });
        };
      },
    );
  });

  it('will throw an error if there are no options', () => {
    expect(() => {
      // @ts-expect-error: we're testing the non-ts version
      createStoreLocatorMap();
    }).toThrowError('You must define the required options');
  });

  it('will throw an error if there is no `container`', () => {
    expect(() => {
      // @ts-expect-error: we're testing the non-ts version
      createStoreLocatorMap({ loaderOptions, geoJsonUrl });
    }).toThrowError('You must define a `container` element to put the map in.');
  });

  it('will throw an error if there is no Google maps API key', () => {
    expect(() => {
      // @ts-expect-error: we're testing the non-ts version
      createStoreLocatorMap({ container, geoJsonUrl });
    }).toThrowError('You must define the `loaderOptions` and its `apiKey`.');
  });

  it('will load the google maps api js with the provided options', () => {
    createStoreLocatorMap({ container, loaderOptions, geoJsonUrl });

    expect(mockLoader).toHaveBeenCalledWith(expect.objectContaining(loaderOptions));
  });

  it('will throw any errors loading the maps api', async () => {
    const error = new Error('things');

    // @ts-expect-error: not mocking the whole thing
    mockLoader.mockImplementationOnce(() => ({
      load: () => Promise.reject(error),
    }));

    await expect(createStoreLocatorMap({ container, loaderOptions, geoJsonUrl })).rejects.toEqual(
      error,
    );
  });

  it('will create a basic map in the given container', async () => {
    const { map } = await createStoreLocatorMap({ container, loaderOptions, geoJsonUrl });

    expect(map).not.toBeUndefined();
    expect(google.maps.Map).toHaveBeenCalledWith(container, {
      center: defaultCenter,
      zoom: defaultZoom,
    });
  });

  it('will accept custom MapOptions', async () => {
    await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJsonUrl,
      mapOptions: {
        zoom: 3,
        maxZoom: 8,
      },
    });

    expect(google.maps.Map).toHaveBeenCalledWith(expect.any(HTMLElement), {
      center: defaultCenter,
      zoom: 3,
      maxZoom: 8,
    });
  });

  it('throws an error if there is no `geoJsonUrl`', () => {
    expect(() => {
      // @ts-expect-error: we're testing the non-ts version
      createStoreLocatorMap({ container, loaderOptions });
    }).toThrowError('You must define the `geoJsonUrl`.');
  });

  it('loads locations from the GeoJSON', async () => {
    const { map } = await createStoreLocatorMap({ container, loaderOptions, geoJsonUrl });

    expect(map.data.loadGeoJson).toHaveBeenCalledWith(geoJsonUrl);
  });

  it('will provide defaults for the info window', async () => {
    const { map, infoWindow } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJsonUrl,
    });

    expect(infoWindow).not.toBeUndefined();
    expect(map.data.addListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('will allow for a custom infoWindow template', async () => {
    const { infoWindow } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJsonUrl,
      infoWindowTemplate: ({ feature }: ContentTemplateArgs) =>
        `custom template ${feature.getProperty('name')}`,
    });

    expect(infoWindow).not.toBeUndefined();

    clickItemHandler({ name: 'Store 2' });

    expect(infoWindow.setContent).toHaveBeenCalledWith('custom template Store 2');
  });

  it('will add a search box to the map', async () => {
    const { searchBox } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJsonUrl,
      searchBoxOptions: { template: 'custom search box <input>' },
    });

    expect(searchBox).not.toBeUndefined();
    expect(container).toHaveTextContent('x');
  });
});
