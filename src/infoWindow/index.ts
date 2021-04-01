import defaultTemplate, { ContentTemplateArgs } from './contentTemplate';

export type InfoWindowOptions = {
  infoWindowOptions?: google.maps.InfoWindowOptions;
  template?: (args: ContentTemplateArgs) => string;
};

export type MapInfoWindow = {
  infoWindow: google.maps.InfoWindow;
  showInfoWindow: (feature: google.maps.Data.Feature) => void;
};

export const addInfoWindowListenerToMap = (
  map: google.maps.Map,
  apiKey: string,
  { template = defaultTemplate, infoWindowOptions }: InfoWindowOptions,
  formatLogoPath?: (feature: google.maps.Data.Feature) => string,
): MapInfoWindow => {
  const defaultOptions = { pixelOffset: new google.maps.Size(0, -30) };

  const infoWindow = new google.maps.InfoWindow({ ...defaultOptions, ...infoWindowOptions });

  const showInfoWindow = (feature: google.maps.Data.Feature) => {
    infoWindow.setContent(template({ feature, apiKey, formatLogoPath }));
    infoWindow.setPosition((feature.getGeometry() as google.maps.Data.Point).get());
    infoWindow.open(map);
  };

  map.data.addListener('click', ({ feature }: { feature: google.maps.Data.Feature }) => {
    showInfoWindow(feature);
  });

  map.addListener('click', () => {
    infoWindow.close();
  });

  return { infoWindow, showInfoWindow };
};
