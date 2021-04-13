import defaultTemplate from './contentTemplate';

export type SearchBoxOptions = {
  /** https://developers.google.com/maps/documentation/javascript/places-autocomplete */
  autocompleteOptions?: google.maps.places.AutocompleteOptions;
  originMarkerOptions?: google.maps.MarkerOptions;
  controlPosition?: google.maps.ControlPosition;
  template?: string;
  searchZoom?: number;
};

type SearchBox = {
  autocomplete: google.maps.places.Autocomplete;
  originMarker: google.maps.Marker;
};

const defaultAutocompleteOptions = {
  types: ['address'],
  componentRestrictions: { country: 'us' },
  fields: ['address_components', 'geometry', 'name'],
};

export const addSearchBoxToMap = (
  map: google.maps.Map,
  onUpdate: () => Promise<void>,
  {
    autocompleteOptions,
    originMarkerOptions,
    controlPosition,
    template = defaultTemplate,
    searchZoom = 9,
  }: SearchBoxOptions,
): SearchBox => {
  const container = document.createElement('div');
  container.innerHTML = template;
  const input = container.querySelector('input') as HTMLInputElement;

  map.controls[controlPosition ?? google.maps.ControlPosition.TOP_RIGHT].push(container);

  const autocomplete = new google.maps.places.Autocomplete(input, {
    ...defaultAutocompleteOptions,
    ...autocompleteOptions,
  });

  const originMarker = new google.maps.Marker({
    map,
    visible: false,
    position: map.getCenter(),
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
    ...originMarkerOptions,
  });

  // Add a marker on search
  autocomplete.addListener('place_changed', async () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      originMarker.setVisible(false);
      global.window.alert(`No address available for input: ${place.name}`);
      return;
    }

    const originLocation = place.geometry.location;
    map.setCenter(originLocation);
    map.setZoom(searchZoom);

    originMarker.setPosition(originLocation);
    originMarker.setVisible(true);

    await onUpdate();
  });

  return { autocomplete, originMarker };
};
