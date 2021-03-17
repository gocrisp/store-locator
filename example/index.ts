import { hello } from '../'; // @gocrisp/store-locator

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('map-container');
  if (container) {
    container.textContent = `Add a map here! Function outputs: ${hello()}. Test Change.`;
  }
});
