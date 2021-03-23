import '@testing-library/jest-dom';
import { mocked } from 'ts-jest/utils';
import { Loader } from '@googlemaps/js-api-loader';
import { createStoreLocatorMap, defaultZoom, defaultCenter } from '../';
import { getRandomInt } from '../../test-lib';

jest.mock('@googlemaps/js-api-loader');
const mockLoader = mocked(Loader, true);

describe('storeLocator', () => {
  const loaderOptions = { apiKey: getRandomInt() + '' };
  const geoJsonUrl = 'http://example.com/geo.json';

  let container: HTMLElement | null;

  beforeEach(() => {
    mockLoader.mockClear();
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container');

    // @ts-expect-error: not mocking the whole thing
    mockLoader.mockImplementation(() => ({ load: () => Promise.resolve() }));

    global.google = {
      // @ts-expect-error: not mocking the whole thing
      maps: {
        Map: jest.fn(),
        InfoWindow: jest.fn(),
        Size: jest.fn(),
      },
    };

    (global.google.maps.Map as jest.Mock).mockImplementation(() => ({
      addListener: jest.fn(),
      data: {
        loadGeoJson: jest.fn(),
        addListener: jest.fn(),
      },
    }));

    (global.google.maps.InfoWindow as jest.Mock).mockImplementation(() => ({
      setContent: jest.fn(),
      setPosition: jest.fn(),
      setOptions: jest.fn(),
      open: jest.fn(),
    }));
  });

  it('will throw an error if there is no `container`', () => {
    expect(() => {
      createStoreLocatorMap({});
    }).toThrowError('You must define a `container` element to put the map in.');
  });

  it('will throw an error if there is no Google maps API key', () => {
    expect(() => {
      createStoreLocatorMap({ container });
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
});
