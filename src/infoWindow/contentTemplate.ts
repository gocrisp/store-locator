export type ContentTemplateArgs = {
  feature: google.maps.Data.Feature;
  apiKey: string;
  logoRootPath?: string;
  logoExtension?: string;
};

export default ({
  feature,
  apiKey,
  logoRootPath,
  logoExtension = 'png',
}: ContentTemplateArgs): string => {
  const position = (feature.getGeometry() as google.maps.Data.Point).get();
  const banner = feature.getProperty('banner');
  const name = feature.getProperty('name');
  const address = feature.getProperty('formattedAddress');

  return `<div className="styles.infoBoxContainer">
    <div className="styles.content">
      <div className="styles.info">
        ${banner || name ? `<h2>${banner ?? ''} ${name ?? ''}</h2>` : ''}
        ${address ? `<p>${address}</p>` : ''}
      </div>
      ${
        banner && logoRootPath
          ? `<img role="img" className="styles.logo" src="${logoRootPath}${banner.replace(
              / /g,
              '_',
            )}.${logoExtension}" alt="" />`
          : ''
      }
      ${
        position && position.lat() && position.lng() && apiKey
          ? `<img
            role="img"
            className={styles.streetView}
            src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"
            alt=""
          />`
          : ''
      }
    </div>
  </div>`;
};
