import { screen } from '@testing-library/dom';
import { addSearchBoxToMap } from '..';
import { mockGoogleMaps } from '../../../test-lib';

describe('Search Box', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    mockGoogleMaps(container);
  });

  it('will be added to the map that is passed in', () => {
    const map = new google.maps.Map(container);
    const onUpdate = jest.fn();

    const { autocomplete } = addSearchBoxToMap(map, onUpdate, {});

    expect(autocomplete).toBeDefined();
    expect(onUpdate).not.toHaveBeenCalled();

    expect(map.controls[google.maps.ControlPosition.TOP_RIGHT].push).toHaveBeenCalled();
    expect(screen.getByLabelText('Find nearest store')).toBeInTheDocument();
  });

  it('will have an autocomplete field', () => {
    const map = new google.maps.Map(container);

    addSearchBoxToMap(map, jest.fn(), {
      controlPosition: google.maps.ControlPosition.BOTTOM_RIGHT,
      autocompleteOptions: { componentRestrictions: { country: 'ca' }, fields: ['geometry'] },
    });

    const input = screen.getByLabelText('Find nearest store');

    expect(google.maps.places.Autocomplete).toHaveBeenCalledWith(input, {
      types: ['address'], // default
      componentRestrictions: { country: 'ca' },
      fields: ['geometry'],
    });
  });

  it('will have configurable html', () => {
    const map = new google.maps.Map(container);

    const template = `<label for="search-box">Find the closest Crisp Cafe</label>
      <input id="search-box" />`;

    const autocomplete = addSearchBoxToMap(map, jest.fn(), { template });

    expect(autocomplete).toBeDefined();

    expect(screen.getByLabelText('Find the closest Crisp Cafe')).toBeInTheDocument();
  });

  describe('on search', () => {
    let onSearch: () => void;
    let map: google.maps.Map;
    let autocomplete: google.maps.places.Autocomplete;
    let originMarker: google.maps.Marker;
    let onUpdate: jest.Mock;

    beforeEach(() => {
      map = new google.maps.Map(container);
      onUpdate = jest.fn();

      const searchBox = addSearchBoxToMap(map, onUpdate, {
        searchZoom: 8,
        originMarkerOptions: { icon: 'http://google.com/custom-marker.jpg' },
      });
      autocomplete = searchBox.autocomplete;
      originMarker = searchBox.originMarker;

      onSearch = (autocomplete.addListener as jest.Mock).mock.calls[0][1];

      (autocomplete.getPlace as jest.Mock).mockImplementation(() => ({
        geometry: {
          location: 'fake-location',
        },
      }));

      global.window.alert = jest.fn();
    });

    it('will use the place_changed listener', () => {
      expect(autocomplete.addListener).toHaveBeenCalledWith('place_changed', expect.any(Function));
    });

    it('will not show the marker on load', () => {
      expect(google.maps.Marker).toHaveBeenCalledWith(expect.objectContaining({ visible: false }));
    });

    it('will center the (hidden) marker on the map', () => {
      expect(google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({ map, position: 'map-center' }),
      );
    });

    it('will have a configurable map marker options', () => {
      expect(google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'http://google.com/custom-marker.jpg' }),
      );
    });

    it('will pop up an alert if the place is invalid', () => {
      (autocomplete.getPlace as jest.Mock).mockImplementationOnce(() => ({
        geometry: undefined,
      }));

      onSearch();

      expect(window.alert).toHaveBeenCalled();
      expect(map.setCenter).not.toHaveBeenCalled();
    });

    it('will show a marker', () => {
      onSearch();
      expect(originMarker.setVisible).toHaveBeenCalledWith(true);
      expect(originMarker.setPosition).toHaveBeenCalledWith('fake-location');
    });

    it('will center on the autocomplete place', () => {
      onSearch();

      expect(map.setCenter).toHaveBeenCalledWith('fake-location');
    });

    it('will zoom in', () => {
      onSearch();
      expect(map.setZoom).toHaveBeenCalledWith(8);
    });

    it('will trigger the onUpdate that is passed in', () => {
      onSearch();
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
