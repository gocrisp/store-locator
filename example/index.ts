import 'babel-polyfill';
import 'highlight.js/styles/tomorrow-night-blue.css';

import { Loader } from '@googlemaps/js-api-loader';
import { StoreLocatorMap } from '../src';

import BasicUsageMd from './basic.md';
import BasicUsageExample from './basic';
import OptionsMd from './options.md';
import OptionsExample from './options';
import TemplatesMd from './templates.md';
import TemplatesExample from './templates';
import ObjectsMd from './objects.md';
import ObjectsExample from './objects';
import AddingMd from './adding.md';
import AddingExample from './adding';

type Page = {
  title: string;
  href: string;
  html: string;
  example: () => Promise<StoreLocatorMap>;
};

const links: Page[] = [
  { ...BasicUsageMd.meta, html: BasicUsageMd.html, example: BasicUsageExample },
  { ...OptionsMd.meta, html: OptionsMd.html, example: OptionsExample },
  { ...AddingMd.meta, html: AddingMd.html, example: AddingExample },
  { ...TemplatesMd.meta, html: TemplatesMd.html, example: TemplatesExample },
  { ...ObjectsMd.meta, html: ObjectsMd.html, example: ObjectsExample },
];

document.addEventListener('DOMContentLoaded', async () => {
  const loader = new Loader({
    apiKey: process.env.GOOGLE_MAPS_API_KEY as string,
    libraries: ['places', 'geometry'],
  });
  await loader.load();

  const navContainer = document.querySelector('nav ul') as HTMLElement;
  const exampleContainer = document.getElementById('example-container') as HTMLElement;

  const onClick = (page: Page) => () => {
    // update active nav item
    const oldNav = navContainer.querySelector('a.active');
    oldNav?.classList.remove('active');
    oldNav?.setAttribute('aria-current', '');
    const newActiveLink = navContainer.querySelector(`a[href="${page.href}"]`) as HTMLAnchorElement;
    newActiveLink.classList.add('active');
    newActiveLink.setAttribute('aria-current', 'page');

    // update displayed doc
    exampleContainer.innerHTML = page.html;
    // for bootstrap styles
    exampleContainer.querySelector('table')?.classList.add('table');
    // make sure relative links do the onclick
    document.querySelectorAll('a[href^="#"]').forEach(e => {
      const link = e as HTMLAnchorElement;
      const pageLink = '#' + link.href.split('#')[1];
      const matchingPage = links.find(l => l.href === pageLink);
      if (matchingPage) {
        link.onclick = onClick(matchingPage);
      }
    });

    // update map
    page.example();
  };

  links.forEach(page => {
    const li = document.createElement('li');
    li.classList.add('nav-item');

    const a = document.createElement('a');
    a.classList.add('nav-link');
    a.href = page.href;
    a.innerText = page.title;
    a.onclick = onClick(page);

    li.appendChild(a);
    navContainer?.appendChild(li);

    if (page.href === window.location.hash || (window.location.hash === '' && page.href === '#')) {
      a.click();
    }
  });
});
