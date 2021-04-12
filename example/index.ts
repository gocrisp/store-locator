import 'babel-polyfill';
import { StoreLocatorMap } from '../src';

import BasicUsageMd from './basic.md';
import BasicUsageExample from './basic';
import OptionsMd from './options.md';
import TemplatesMd from './templates.md';
import ObjectsMd from './objects.md';

type Page = {
  title: string;
  href: string;
  html: string;
  example: () => Promise<StoreLocatorMap>;
};

const links: Page[] = [
  { ...BasicUsageMd.meta, html: BasicUsageMd.html, example: BasicUsageExample },
  { ...OptionsMd.meta, html: OptionsMd.html, example: BasicUsageExample },
  { ...TemplatesMd.meta, html: TemplatesMd.html, example: BasicUsageExample },
  { ...ObjectsMd.meta, html: ObjectsMd.html, example: BasicUsageExample },
];

document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.querySelector('nav ul') as HTMLElement;
  const exampleContainer = document.getElementById('example-container') as HTMLElement;

  const onClick = (page: Page) => (event: Event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    // update active nav item
    const oldNav = navContainer.querySelector('a.active');
    oldNav?.classList.remove('active');
    oldNav?.setAttribute('aria-current', '');
    event.target.classList.add('active');
    event.target.setAttribute('aria-current', 'page');

    // update displayed doc
    exampleContainer.innerHTML = page.html;

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

    if (
      page.href === window.location.hash ||
      (window.location.hash === '' && page.href === '#')
    ) {
      a.click();
    }

    li.appendChild(a);
    navContainer?.appendChild(li);
  });
});
