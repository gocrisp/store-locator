import contentTemplate, { ContentTemplateArgs } from './contentTemplate';

export const addInfoWindowListenerToMap = (
  map: google.maps.Map,
  apiKey: string,
  infoWindowTemplate: (args: ContentTemplateArgs) => string = contentTemplate,
): google.maps.InfoWindow => {
  const defaultOptions = { pixelOffset: new google.maps.Size(0, -30) };

  const infoWindow = new google.maps.InfoWindow();
  infoWindow.setOptions(defaultOptions);

  map.data.addListener('click', ({ feature }: { feature: google.maps.Data.Feature }) => {
    infoWindow.setContent(infoWindowTemplate({ feature, apiKey }));
    infoWindow.setPosition((feature.getGeometry() as google.maps.Data.Point).get());
    infoWindow.open(map);
  });

  map.addListener('click', () => {
    infoWindow.close();
  });

  return infoWindow;
};
