import { DistanceResult } from '.';

export const closeButtonId = 'map_close-store-list-button';
export const listId = 'map_store-list';
export const messageId = 'map_store-list-message';

export type ContentTemplateArgs = {
  store: DistanceResult;
  formatLogoPath?: (feature: google.maps.Data.Feature) => string;
};

export const storeTemplate = ({ store, formatLogoPath }: ContentTemplateArgs): string => {
  const banner = store.feature.getProperty('banner');
  const name = store.feature.getProperty('name');
  const address = store.feature.getProperty('formattedAddress');
  const location = (store.feature.getGeometry() as google.maps.Data.Point).get();

  return `
    <li>
      <button
        data-lat="${location.lat()}"
        data-lng="${location.lng()}"
        title="${banner ?? ''} ${name ?? ''}"
      >
        ${banner || name ? `<p class="map_banner">${banner ?? ''} ${name ?? ''}</p>` : ''}
        ${
          banner && formatLogoPath
            ? `<img class="map_logo" alt="" src="${formatLogoPath(store.feature)}" />`
            : ''
        }
        <p class="map_distance">${store.distanceText}</p>
        ${address ? `<p class="map_address">${address}</p>` : ''}
      </button>
    </li>
  `;
};

export const panelTemplate = `
  <h2 id="store-list-header">Nearby Locations</h2>
  <button type="button" id="${closeButtonId}" class="close-button">
    <img alt="Close Store List" src="http://www.google.com/intl/en_us/mapfiles/close.gif" />
  </button>
  <ul id="${listId}"></ul>
  <div id="${messageId}"></div>`;
