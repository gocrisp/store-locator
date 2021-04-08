import { screen, getByRole, findAllByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { addStoreListToMapContainer } from '..';
import { mockGoogleMaps } from '../../../test-lib';

const testMaxDestinationsPerRequest = 5;

describe('Store List', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    mockGoogleMaps(container, testMaxDestinationsPerRequest);
  });

  it('will not show a store list on load', () => {
    const map = new google.maps.Map(container);
    addStoreListToMapContainer(
      container,
      map,
      jest.fn(),
      {},
      undefined,
      testMaxDestinationsPerRequest,
    );

    const panel = screen.getByRole('region', { name: 'Nearby Locations' });
    expect(panel).toBeInTheDocument();
    expect(panel).not.toHaveClass('open');
  });

  describe('when we search for a location', () => {
    let map: google.maps.Map;
    let showStoreList: () => Promise<void>;

    beforeEach(() => {
      map = new google.maps.Map(container);
      const storeList = addStoreListToMapContainer(
        container,
        map,
        jest.fn(),
        {
          filterFn: (_, i) => i < 3,
        },
        undefined,
        testMaxDestinationsPerRequest,
      );
      showStoreList = storeList.showStoreList;
    });

    it('will show a store list when given a list of stores', async () => {
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      expect(panel).toHaveClass('open');
    });

    it('will sort the list by distance', async () => {
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      const listItems = await findAllByRole(panel, 'listitem');

      expect(listItems[0]).toHaveTextContent("Josie's Patisserie Bristol");
      expect(listItems[1]).toHaveTextContent("Josie's Patisserie Cardiff");
      expect(listItems[2]).toHaveTextContent("Josie's Patisserie Wimborne");
    });

    it('will truncate the list based on the `filterFn` setting', async () => {
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      const listItems = await findAllByRole(panel, 'listitem');

      expect(listItems).toHaveLength(3);
    });

    it('will close when the close button is clicked', async () => {
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });
      const closeButton = getByRole(panel, 'button', { name: 'Close Store List' });

      expect(panel).toHaveClass('open');
      userEvent.click(closeButton);
      expect(panel).not.toHaveClass('open');
    });

    it('will zoom in on the location when a result is clicked', async () => {
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      const cardiffItem = getByRole(panel, 'button', { name: "Josie's Patisserie Cardiff" });

      userEvent.click(cardiffItem);

      expect(map.setCenter).toHaveBeenCalledWith(expect.objectContaining({ lat: 51.479756 }));
      expect(map.setCenter).toHaveBeenCalledWith(expect.objectContaining({ lng: -3.155305 }));
      expect(map.setZoom).toHaveBeenCalledWith(13);
    });
  });

  describe('when there are no results', () => {
    let map: google.maps.Map;

    beforeEach(() => {
      map = new google.maps.Map(container);

      (map.data.forEach as jest.Mock).mockImplementationOnce(() => jest.fn());
    });
    it('will show a message', async () => {
      const { showStoreList } = addStoreListToMapContainer(
        container,
        map,
        jest.fn(),
        {},
        undefined,
        testMaxDestinationsPerRequest,
      );
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      expect(panel).toHaveTextContent('There are no locations');
    });
  });

  describe('when the api returns a rejection status', () => {
    let map: google.maps.Map;

    beforeEach(() => {
      map = new google.maps.Map(container);

      (global.google.maps.DistanceMatrixService as jest.Mock).mockImplementation(() => ({
        getDistanceMatrix: jest.fn().mockImplementation((_, callback) => {
          callback({ rows: [] }, google.maps.DistanceMatrixStatus.MAX_DIMENSIONS_EXCEEDED);
        }),
      }));

      global.console.error = jest.fn();
    });
    it('will show an error message', async () => {
      const { showStoreList } = addStoreListToMapContainer(
        container,
        map,
        jest.fn(),
        {},
        undefined,
        testMaxDestinationsPerRequest,
      );
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      expect(panel).toHaveClass('open');
      expect(panel).toHaveTextContent('There was an error');
    });
    it('will log the error details to the console', async () => {
      const { showStoreList } = addStoreListToMapContainer(
        container,
        map,
        jest.fn(),
        {},
        undefined,
        testMaxDestinationsPerRequest,
      );
      await showStoreList();

      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('MAX_DIMENSIONS_EXCEEDED'),
      );
    });
  });

  describe('when the api returns an empty response', () => {
    let map: google.maps.Map;

    beforeEach(() => {
      map = new google.maps.Map(container);

      (global.google.maps.DistanceMatrixService as jest.Mock).mockImplementation(() => ({
        getDistanceMatrix: jest.fn().mockImplementation((_, callback) => {
          callback(undefined, google.maps.DistanceMatrixStatus.OK);
        }),
      }));

      global.console.error = jest.fn();
    });

    it('will show an error message', async () => {
      const { showStoreList } = addStoreListToMapContainer(
        container,
        map,
        jest.fn(),
        {},
        undefined,
        testMaxDestinationsPerRequest,
      );
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      expect(panel).toHaveClass('open');
      expect(panel).toHaveTextContent('There was an error');
    });
    it('will log the error details to the console', async () => {
      const { showStoreList } = addStoreListToMapContainer(
        container,
        map,
        jest.fn(),
        {},
        undefined,
        testMaxDestinationsPerRequest,
      );
      await showStoreList();

      expect(global.console.error).toHaveBeenCalledWith(expect.stringContaining('no response'));
    });
  });
});
