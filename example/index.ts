import { createStoreLocatorMap } from '../src';

document.addEventListener('DOMContentLoaded', () => {
  createStoreLocatorMap({
    container: document.getElementById('map-container'),
    loaderOptions: { apiKey: 'AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk' },
  });

  //   const marker = new google.maps.Marker({
  //     position: { lat: 34.397, lng: -80.644 },
  //     map,
  //   });

  //   const infoWindow = new google.maps.InfoWindow({
  //     content: '<p>Marker Location: ' + marker.getPosition() + '</p>',
  //   });

  //   google.maps.event.addListener(marker, 'click', () => infoWindow.open(map, marker));

  //   return map;
  // });
});
