import { screen, getByText, getByRole, findAllByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { addStoreListToMapContainer } from '..';
import { mockGoogleMaps } from '../../../test-lib';

describe('Store List', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    container = document.getElementById('map-container') as HTMLElement;

    mockGoogleMaps(container);
  });

  it('will not show a store list on load', () => {
    const map = new google.maps.Map(container);
    addStoreListToMapContainer(container, map, {});

    const panel = screen.getByRole('region', { name: 'Nearby Locations' });
    expect(panel).toBeInTheDocument();
    expect(panel).not.toHaveClass('open');
  });

  describe('when we search for a location', () => {
    let map: google.maps.Map;
    let showStoreList: () => Promise<void>;

    beforeEach(() => {
      map = new google.maps.Map(container);
      const storeList = addStoreListToMapContainer(container, map, { maxStoresToDisplay: 3 });
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

    it('will truncate the list based on the `maxStoresToDisplay` setting', async () => {
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
  });

  describe('when there are no results', () => {
    let map: google.maps.Map;

    beforeEach(() => {
      map = new google.maps.Map(container);

      (map.data.forEach as jest.Mock).mockImplementationOnce(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
    });
    it('will show a message', async () => {
      const { showStoreList } = addStoreListToMapContainer(container, map, {});
      await showStoreList();

      const panel = screen.getByRole('region', { name: 'Nearby Locations' });

      expect(panel).toHaveTextContent('There are no locations');
    });
  });
});
