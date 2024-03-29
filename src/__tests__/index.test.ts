import { mocked } from 'ts-jest/utils';
import { Loader } from '@googlemaps/js-api-loader';
import userEvent from '@testing-library/user-event';
import { getByTestId, screen } from '@testing-library/dom';
import { createStoreLocatorMap, defaultZoom, defaultCenter } from '../';
import { getRandomInt, mockGoogleMaps } from '../../test-lib';
import { ContentTemplateArgs } from '../infoWindow/contentTemplate';

jest.mock('@googlemaps/js-api-loader');
const mockLoader = mocked(Loader, true);
describe('storeLocator', () => {
  const loaderOptions = { apiKey: getRandomInt() + '' };
  const geoJson = 'http://example.com/geo.json';

  let container: HTMLElement;

  beforeEach(() => {
    mockLoader.mockReset();

    // @ts-expect-error resetting
    window.google = undefined;
    // @ts-expect-error resetting
    global.google = undefined;

    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    mockGoogleMaps(container, mockLoader);
  });

  it('will throw an error if there are no options', async () => {
    // @ts-expect-error: we're testing the non-ts version
    await expect(createStoreLocatorMap()).rejects.toThrow('You must define the required options');
  });

  it('will throw an error if there is no `container`', async () => {
    await expect(
      // @ts-expect-error: we're testing the non-ts version
      createStoreLocatorMap({ loaderOptions, geoJson }),
    ).rejects.toThrowError('You must define a `container` element to put the map in.');
  });

  it('will throw an error if there is no Google maps API key', async () => {
    await expect(createStoreLocatorMap({ container, geoJson })).rejects.toThrowError(
      'You must define the `loaderOptions` and its `apiKey`.',
    );
  });

  it('will load the google maps api js with the provided options', () => {
    createStoreLocatorMap({ container, loaderOptions, geoJson });

    expect(mockLoader).toHaveBeenCalledWith(expect.objectContaining(loaderOptions));
  });

  it('will throw any errors loading the maps api', async () => {
    const error = new Error('things');

    // @ts-expect-error: not mocking the whole thing
    mockLoader.mockImplementationOnce(() => ({
      load: () => Promise.reject(error),
    }));

    await expect(createStoreLocatorMap({ container, loaderOptions, geoJson })).rejects.toEqual(
      error,
    );
  });

  it('will create a basic map in the given container', async () => {
    const { map } = await createStoreLocatorMap({ container, loaderOptions, geoJson });

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
      geoJson,
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

  it('throws an error if there is no `geoJson` url', async () => {
    await expect(
      // @ts-expect-error: we're testing the non-ts version
      createStoreLocatorMap({ container, loaderOptions }),
    ).rejects.toThrowError('You must define the `geoJson` as a URL or GeoJSON object.');
  });

  it('loads locations from the GeoJSON', async () => {
    const { map } = await createStoreLocatorMap({ container, loaderOptions, geoJson });

    expect(map.data.loadGeoJson).toHaveBeenCalledWith(geoJson);
  });

  it('will provide defaults for the info window', async () => {
    const { map, infoWindow } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJson,
    });

    expect(infoWindow).not.toBeUndefined();
    expect(map.data.addListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('will allow for a custom infoWindow template', async () => {
    const { infoWindow } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJson,
      infoWindowOptions: {
        template: ({ feature }: ContentTemplateArgs) =>
          `custom template ${feature.getProperty('store')}`,
      },
    });

    expect(infoWindow).not.toBeUndefined();

    userEvent.click(getByTestId(container, 'mock-marker'));

    expect(infoWindow.setContent).toHaveBeenCalledWith('custom template Store 2');
  });

  it('will add a search box to the map', async () => {
    const { autocomplete, originMarker } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJson,
      searchBoxOptions: { template: 'custom search box <input>' },
    });

    expect(autocomplete).not.toBeUndefined();
    expect(originMarker).not.toBeUndefined();
    expect(container).toHaveTextContent('x');
  });

  it('will add the store list panel to the map container', async () => {
    await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJson,
      storeListOptions: {
        panelTemplate: `<h2 id="store-list-header">Store Locations</h2>`,
      },
    });

    expect(screen.getByRole('region', { name: 'Store Locations' })).toBeInTheDocument();
  });

  it('will show the side panel on search', async () => {
    await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJson,
    });

    const searchBox = screen.getByLabelText('Find nearest store');

    userEvent.type(searchBox, 'Anything{enter}');

    expect(screen.getByRole('region', { name: 'Nearby Locations' })).toBeInTheDocument();

    const result = await screen.findByText("Josie's Patisserie Bristol");
    expect(result).toBeInTheDocument();
  });

  it('will accept custom json that has already been loaded', async () => {
    const customJson = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [-0.1234, 51.1234],
          },
          type: 'Feature',
          properties: {
            store: "Josie's Other Cafe Custom Json",
            storeFullAddress: '123 Main St',
          },
        },
      ],
    };

    const { map } = await createStoreLocatorMap({
      container,
      loaderOptions,
      geoJson: customJson,
    });

    expect(map.data.addGeoJson).toHaveBeenCalledWith(customJson);
  });

  it('will allow you to pre-load the google maps library', async () => {
    // @ts-expect-error unknown is google maps
    window.google = mockGoogleMaps(container);

    await createStoreLocatorMap({ container, geoJson });

    expect(mockLoader).not.toHaveBeenCalled();
  });
});
