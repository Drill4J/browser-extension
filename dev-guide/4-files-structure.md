# Files structure

`/dev-guide/` - developers guide.<br>

`/src/` - application sources:

- `/src/common/` - common constants, common css, css variables, fonts, images, icons, polyfils, urls.
- `/src/components/` - common, reusable components base.
- `/src/layouts/` - application layouts.
- `/src/popup-component/` - main development area for popup script.
- `/src/content-component/` - main development area for content script.
- `src/utils` - for common utils

> ##### All common components or presentational components should have following structure:
>
> ```
> ├── componentName
> │   ├── component-name.jsx
> │   ├── component-name.scss
> │   ├── index.js (with component's export)
> │   ├── constants.tjs (if component has local constants, which are used several times by sub components)
> │   └── sub-component-folder (if has)
> │       └── ...
> ```
