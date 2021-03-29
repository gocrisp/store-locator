import { screen } from '@testing-library/dom';
import contentTemplate from '../contentTemplate';
import { getRandomInt, mockFeature } from '../../../test-lib';

describe('infoWindow template', () => {
  const apiKey = getRandomInt() + '';

  let container: HTMLElement;
  beforeEach(() => {
    document.body.innerHTML = '<div id="map-container"></div>';
    // @ts-expect-error: this is always defined
    container = document.getElementById('map-container');
  });

  it('will not show `undefined` for non-existent properties', async () => {
    container.innerHTML = contentTemplate({ feature: mockFeature({}), apiKey: '' });

    expect(container).toHaveTextContent('');
    expect(container.querySelectorAll('img').length).toBeFalsy();
  });

  it('will show the banner, name, and address', () => {
    container.innerHTML = contentTemplate({
      feature: mockFeature({
        banner: 'Fake Cafe',
        name: 'Buffalo',
        formattedAddress: '123 Main St, Buffalo, NY 12345',
      }),
      apiKey: '',
    });

    expect(screen.getByRole('heading')).toHaveTextContent('Fake Cafe Buffalo');
    expect(screen.getByText('123 Main St, Buffalo, NY 12345')).toBeInTheDocument();
    expect(container.querySelectorAll('img').length).toBeFalsy();
  });

  it('will show the banner logo if there is a banner and a `logoRootDir`', () => {
    container.innerHTML = contentTemplate({
      feature: mockFeature({ banner: 'Fake Cafe' }),
      apiKey: '',
      formatLogoPath: feature => `/img/${feature.getProperty('banner').replace(' ', '')}.png`,
    });

    const img = container.querySelector('img');

    expect(img).toBeDefined();
    expect(img?.src).toEqual('http://localhost/img/FakeCafe.png');
  });

  it('will show a streetview if the position is defined and we have an api key', () => {
    container.innerHTML = contentTemplate({
      feature: mockFeature({ banner: 'Fake Cafe' }),
      apiKey,
    });

    const img = container.querySelector('img');

    expect(img).toBeDefined();
    expect(img?.src).toEqual(
      `https://maps.googleapis.com/maps/api/streetview?size=350x120&location=1,2&key=${apiKey}`,
    );
  });
});
