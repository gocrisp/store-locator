type ExampleMeta = {
  title: string;
  href: string;
};

declare module '*.md' {
  export const meta: ExampleMeta;
  export const html: string;
}
