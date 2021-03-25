import defaultTemplate from './contentTemplate';

export type SearchBoxOptions = {
  /* https://developers.google.com/maps/documentation/javascript/places-autocomplete */
  autocompleteOptions?: google.maps.places.AutocompleteOptions;
  controlPosition?: google.maps.ControlPosition;
  template?: string;
};

const defaultAutocompleteOptions = {
  types: ['address'],
  componentRestrictions: { country: 'us' },
  fields: ['address_components', 'geometry', 'name'],
};

export const addSearchBoxToMap = (
  map: google.maps.Map,
  { autocompleteOptions, controlPosition, template = defaultTemplate }: SearchBoxOptions,
): google.maps.places.Autocomplete => {
  const container = document.createElement('div');
  container.innerHTML = template;
  const input = container.querySelector('input') as HTMLInputElement;

  map.controls[controlPosition ?? google.maps.ControlPosition.TOP_RIGHT].push(container);

  return new google.maps.places.Autocomplete(input, {
    ...defaultAutocompleteOptions,
    ...autocompleteOptions,
  });
};
