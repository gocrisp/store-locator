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

    const autocomplete = addSearchBoxToMap(map, {});

    expect(autocomplete).toBeDefined();

    expect(map.controls[google.maps.ControlPosition.TOP_RIGHT].push).toHaveBeenCalled();
    expect(screen.getByLabelText('Find nearest store')).toBeInTheDocument();
  });

  it('will have an autocomplete field', () => {
    const map = new google.maps.Map(container);

    addSearchBoxToMap(map, {
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

    const autocomplete = addSearchBoxToMap(map, { template });

    expect(autocomplete).toBeDefined();

    expect(screen.getByLabelText('Find the closest Crisp Cafe')).toBeInTheDocument();
  });
});
