import {
  panelTemplate,
  closeButtonId,
  listId,
  storeTemplate,
  messageId,
  ContentTemplateArgs,
} from './contentTemplate';

const storeListPanelId = 'map_store-list-panel';

export type StoreListOptions = {
  maxStoresToDisplay?: number;
  travelMode?: google.maps.TravelMode;
  unitSystem?: 'imperial' | 'metric';
  panelTemplate?: string;
  storeTemplate?: (args: ContentTemplateArgs) => string;
};

type StoreList = {
  showStoreList: () => Promise<void>;
};

export type DistanceResult = {
  feature: google.maps.Data.Feature;
  distanceText: string;
};

type DistanceMatrixValue = {
  text: string;
  value: number;
};

const getDistanceMatrix = (
  service: google.maps.DistanceMatrixService,
  parameters: google.maps.DistanceMatrixRequest,
): Promise<Array<DistanceMatrixValue>> =>
  new Promise((resolve, reject) => {
    service.getDistanceMatrix(parameters, (response, status) => {
      if (status != google.maps.DistanceMatrixStatus.OK || !response) {
        reject(response);
      } else {
        resolve(
          response.rows[0].elements.map(e => ({
            text: e.distance.text,
            value: e.distance.value,
          })),
        );
      }
    });
  });

const getStoresClosestToCenterOfMap = async (
  map: google.maps.Map,
  {
    maxStoresToDisplay = 5,
    travelMode = google.maps.TravelMode.DRIVING,
    unitSystem, // defaults to 'imperial' in ternary below
  }: StoreListOptions,
): Promise<Array<DistanceResult>> => {
  const stores: Array<google.maps.Data.Feature> = [];
  const destinations: Array<google.maps.LatLng> = [];

  const center = map.getCenter();
  if (!center) {
    return [];
  }

  // Get locations and create array for stores
  map.data.forEach(store => {
    const location = (store.getGeometry() as google.maps.Data.Point).get();
    destinations.push(location);
    stores.push(store);
  });

  // find driving distances from center of map
  const service = new google.maps.DistanceMatrixService();

  const distancesList = await getDistanceMatrix(service, {
    origins: [center],
    destinations,
    travelMode,
    unitSystem:
      unitSystem === 'metric' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL,
  });

  // apply distance info to our stores list
  const storesWithDistances = stores.map((store, i) => ({
    store,
    distanceText: distancesList[i].text,
    distanceValue: distancesList[i].value,
  }));

  // Sort and format for display
  return storesWithDistances
    .sort((s1, s2) => s1.distanceValue - s2.distanceValue)
    .map(s => ({
      feature: s.store,
      distanceText: s.distanceText,
    }))
    .slice(0, maxStoresToDisplay);
};

const showLocation = (
  map: google.maps.Map,
  showInfoWindow: (feature: google.maps.Data.Feature) => void,
  lat: number,
  lng: number,
) => {
  map.setCenter({ lat, lng });
  map.setZoom(13);

  map.data.forEach(feature => {
    const location = (feature.getGeometry() as google.maps.Data.Point).get();
    if (location.lat() == lat && location.lng() == lng) {
      showInfoWindow(feature);
    }
  });
};

const showStoreList = (
  map: google.maps.Map,
  showInfoWindow: (feature: google.maps.Data.Feature) => void,
  options: StoreListOptions,
  formatLogoPath?: (feature: google.maps.Data.Feature) => string,
) => async (): Promise<void> => {
  const sortedStores = await getStoresClosestToCenterOfMap(map, options);

  const panel = document.getElementById(storeListPanelId) as HTMLElement;
  const list = document.getElementById(listId) as HTMLElement;
  const message = document.getElementById(messageId) as HTMLElement;

  if (sortedStores.length) {
    const template = options.storeTemplate ?? storeTemplate;
    list.innerHTML = sortedStores.map(store => template({ store, formatLogoPath })).join('');
    message.innerHTML = '';

    list.querySelectorAll('button').forEach(button => {
      button.onclick = () =>
        showLocation(
          map,
          showInfoWindow,
          +(button.getAttribute('data-lat') || 0),
          +(button.getAttribute('data-lng') || 0),
        );
    });
  } else {
    list.innerHTML = '';
    message.innerHTML = 'There are no locations that match the given criteria.';
  }

  panel.classList.add('open');
};

export const addStoreListToMapContainer = (
  container: HTMLElement,
  map: google.maps.Map,
  showInfoWindow: (feature: google.maps.Data.Feature) => void,
  options: StoreListOptions,
  formatLogoPath?: (feature: google.maps.Data.Feature) => string,
): StoreList => {
  const panel = document.createElement('section');
  panel.id = storeListPanelId;
  panel.classList.add('map_store-list-panel');
  panel.setAttribute('aria-labelledby', 'store-list-header');

  panel.innerHTML = options.panelTemplate ?? panelTemplate;
  container.appendChild(panel);

  const closeButton = document.getElementById(closeButtonId) as HTMLButtonElement;
  if (closeButton) {
    closeButton.onclick = () => {
      panel.classList.remove('open');
    };
  }

  return {
    showStoreList: showStoreList(map, showInfoWindow, options, formatLogoPath),
  };
};
