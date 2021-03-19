import { Loader } from '@googlemaps/js-api-loader';

document.addEventListener('DOMContentLoaded', () => {
  const loader = new Loader({
    apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk',
    version: 'weekly',
  });

  const container = document.getElementById('map-container');
  if (container) {
    return loader.load().then(() => {
      const map = new google.maps.Map(container as HTMLElement, {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
      });

      const marker = new google.maps.Marker({
        position: { lat: 34.397, lng: -80.644 },
        map,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: '<p>Marker Location: ' + marker.getPosition() + '</p>',
      });

      google.maps.event.addListener(marker, 'click', () => infoWindow.open(map, marker));

      return map;
    });
  }
});
