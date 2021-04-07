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
  // maxStoresToDisplay?: number;
  filterFn?: (item: DistanceResult, index: number, map: google.maps.Map) => boolean;
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
      if (status != google.maps.DistanceMatrixStatus.OK) {
        reject(`DistanceMatrixService Response Status: ${status}`);
      } else if (!response) {
        reject('DistanceMatrixService returned no response');
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
    filterFn = (_, i) => i < 10,
    travelMode = google.maps.TravelMode.DRIVING,
    unitSystem, // defaults to 'imperial' in ternary below
  }: StoreListOptions,
  maxDestinationsPerDistanceMatrixRequest: number,
): Promise<Array<DistanceResult>> => {
  type StoreWithStraightLineDistance = {
    store: google.maps.Data.Feature;
    location: google.maps.LatLng;
    distance: number;
  };

  const stores: Array<StoreWithStraightLineDistance> = [];

  const center = map.getCenter();
  if (!center) {
    return [];
  }

  // Get locations and create array for stores
  map.data.forEach(store => {
    const location = (store.getGeometry() as google.maps.Data.Point).get();
    stores.push({
      store,
      location,
      distance: google.maps.geometry.spherical.computeDistanceBetween(center, location),
    });
  });

  // sort by straight-line distance to the center
  const closestStores = stores
    .sort((s1, s2) => s1.distance - s2.distance)
    .slice(0, maxDestinationsPerDistanceMatrixRequest);

  // find driving distances from center of map
  const service = new google.maps.DistanceMatrixService();

  const distancesList = await getDistanceMatrix(service, {
    origins: [center],
    destinations: closestStores.map(({ location }) => location),
    travelMode,
    unitSystem:
      unitSystem === 'metric' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL,
  });

  // apply distance info to our stores list
  const storesWithDrivingDistances = closestStores.map((store, i) => ({
    ...store,
    // they are returned in teh same order as we pass them in as destinations
    distanceText: distancesList[i].text,
    distanceValue: distancesList[i].value,
  }));

  // Sort and format for display
  return storesWithDrivingDistances
    .sort((s1, s2) => s1.distanceValue - s2.distanceValue)
    .map(s => ({
      feature: s.store,
      distanceText: s.distanceText,
    }))
    .filter((result, index) => filterFn(result, index, map));
};

const findFeatureByLatLng = (map: google.maps.Map, lat: number, lng: number) => {
  const featuresWithLatLng: Array<{
    lat: number;
    lng: number;
    feature: google.maps.Data.Feature;
  }> = [];

  map.data.forEach(feature => {
    const location = (feature.getGeometry() as google.maps.Data.Point).get();
    featuresWithLatLng.push({
      lat: location.lat(),
      lng: location.lng(),
      feature,
    });
  });

  return featuresWithLatLng.find(f => f.lat === lat && f.lng === lng)?.feature;
};

const showLocation = (
  map: google.maps.Map,
  showInfoWindow: (feature: google.maps.Data.Feature) => void,
  lat: number,
  lng: number,
) => {
  map.setCenter({ lat, lng });
  map.setZoom(13);
  const matchingFeature = findFeatureByLatLng(map, lat, lng);
  if (matchingFeature) {
    showInfoWindow(matchingFeature);
  }
};

const showStoreList = (
  map: google.maps.Map,
  showInfoWindow: (feature: google.maps.Data.Feature) => void,
  options: StoreListOptions,
  maxDestinationsPerDistanceMatrixRequest: number,
  formatLogoPath?: (feature: google.maps.Data.Feature) => string,
) => async (): Promise<void> => {
  const panel = document.getElementById(storeListPanelId) as HTMLElement;
  const list = document.getElementById(listId) as HTMLElement;
  const message = document.getElementById(messageId) as HTMLElement;

  let sortedStores;
  try {
    sortedStores = await getStoresClosestToCenterOfMap(
      map,
      options,
      maxDestinationsPerDistanceMatrixRequest,
    );
  } catch (e) {
    console.error(e);
    list.innerHTML = '';
    message.innerHTML = 'There was an error determining the closest stores.';
    panel.classList.add('open');
    return;
  }

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
  /* As restricted by the google maps api - only exposed here for testing */
  maxDestinationsPerDistanceMatrixRequest = 25,
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
    showStoreList: showStoreList(
      map,
      showInfoWindow,
      options,
      maxDestinationsPerDistanceMatrixRequest,
      formatLogoPath,
    ),
  };
};
