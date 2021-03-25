import { addInfoWindowListenerToMap } from '..';
import { getRandomInt } from '../../../test-lib';

describe('InfoWindow', () => {
  const apiKey = getRandomInt() + '';
  let container: HTMLElement;
  const mapAddListenerMock = jest.fn();
  const dataAddListenerMock = jest.fn();

  let clickItemHandler: (properties: Record<string, unknown>) => void;
  let clickMapHandler: () => void;

  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    global.google = {
      // @ts-expect-error: not mocking the whole thing
      maps: {
        Map: jest.fn(),
        InfoWindow: jest.fn(),
        Size: jest.fn(),
      },
    };

    (global.google.maps.Map as jest.Mock).mockImplementation(() => ({
      addListener: mapAddListenerMock,
      data: {
        loadGeoJson: jest.fn(),
        addListener: dataAddListenerMock,
      },
    }));

    (global.google.maps.InfoWindow as jest.Mock).mockImplementation(() => ({
      setContent: jest.fn(),
      setPosition: jest.fn(),
      setOptions: jest.fn(),
      open: jest.fn(),
      close: jest.fn(),
    }));

    mapAddListenerMock.mockImplementation((_, handler: () => void) => {
      clickMapHandler = handler;
    });

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

  it('will wire up the click listeners for the map points', async () => {
    const map = new google.maps.Map(container);

    const infoWindow = addInfoWindowListenerToMap(map, apiKey, {});

    clickItemHandler({ name: 'Store 1' });

    expect(infoWindow.setOptions).toHaveBeenCalled();
    expect(infoWindow.setContent).toHaveBeenCalledWith(expect.stringContaining('Store 1'));
    expect(infoWindow.setPosition).toHaveBeenCalledWith(
      expect.objectContaining({ positionName: 'testPosition' }),
    );
    expect(infoWindow.open).toHaveBeenCalledWith(map);
  });

  it('will close the info window when clicked away', () => {
    const map = new google.maps.Map(container);

    const infoWindow = addInfoWindowListenerToMap(map, apiKey, {});

    expect(map.addListener).toHaveBeenCalledWith('click', expect.any(Function));

    clickMapHandler();

    expect(infoWindow.close).toHaveBeenCalled();
  });
});
