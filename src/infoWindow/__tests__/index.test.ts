import { getByTestId } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { addInfoWindowListenerToMap } from '..';
import { getRandomInt, mockGoogleMaps } from '../../../test-lib';

describe('InfoWindow', () => {
  const apiKey = getRandomInt() + '';
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    mockGoogleMaps(container);
  });

  it('will wire up the click listeners for the map points', async () => {
    const map = new google.maps.Map(container);

    const { infoWindow } = addInfoWindowListenerToMap(map, {}, apiKey);

    userEvent.click(getByTestId(container, 'mock-marker'));

    expect(infoWindow.setContent).toHaveBeenCalledWith(expect.stringContaining('Store 2'));
    expect(infoWindow.setPosition).toHaveBeenCalledWith(
      expect.objectContaining({ positionName: 'testPosition' }),
    );
    expect(infoWindow.open).toHaveBeenCalledWith(map);
  });

  it('will apply custom options to the InfoWindow', () => {
    const map = new google.maps.Map(container);

    addInfoWindowListenerToMap(map, { infoWindowOptions: { maxWidth: 500 } }, apiKey);

    expect(google.maps.InfoWindow).toHaveBeenCalledWith({
      pixelOffset: new google.maps.Size(0, -30),
      maxWidth: 500,
    });
  });

  it('will close the info window when clicked away', () => {
    const map = new google.maps.Map(container);

    const { infoWindow } = addInfoWindowListenerToMap(map, {}, apiKey);

    expect(map.addListener).toHaveBeenCalledWith('click', expect.any(Function));

    userEvent.click(container);

    expect(infoWindow.close).toHaveBeenCalled();
  });
});
