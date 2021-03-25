import { screen } from '@testing-library/dom';
import { addSearchBoxToMap } from '..';

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

describe('Search Box', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    global.google = {
      maps: {
        Map: jest.fn(),
        ControlPosition,
        // @ts-expect-error: not mocking the whole thing
        places: {
          Autocomplete: jest.fn(),
        },
      },
    };

    (global.google.maps.Map as jest.Mock).mockImplementation(() => ({
      controls: {
        [google.maps.ControlPosition.BOTTOM_RIGHT]: {
          push: jest.fn(component => container.appendChild(component)),
        },
        [google.maps.ControlPosition.TOP_RIGHT]: {
          push: jest.fn(component => container.appendChild(component)),
        },
      },
    }));
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
