// TODO make this overrideable
export default (feature: google.maps.Data.Feature, apiKey: string): string => {
  const position = (feature.getGeometry() as google.maps.Data.Point).get();

  return `<div className="styles.infoBoxContainer">
    <div className="styles.content">
      <div className="styles.info">
        <h2>${feature.getProperty('banner') ?? ''} ${feature.getProperty('name')}</h2>
        <p>${feature.getProperty('formattedAddress')}</p>
      </div>
      <img className={styles.logo} src="img/logo_${feature.getProperty('banner')}.png" alt="" />
      <img
        className={styles.streetView}
        src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"
        alt=""
      />
    </div>
  </div>`;
};
