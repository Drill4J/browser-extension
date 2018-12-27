# Drill4J Project

## Development installation

For development you need a [node.js](https://nodejs.org).

To launch the development environment, follow these steps:

1.  open console from the project root
2.  run the command `npm install`
3.  to proxy requests to the server, create `.env` file in root folder

    ```
    PROXY_PATH=http://your_server:port/
    ```

4.  run the command `npm run dev`
5.  enjoy the development.

## Production version installation

For making build you need a [node.js](https://nodejs.org).

To get production bundle, follow these steps:

1.  open console from the project root
2.  run the command `npm install`
3.  run the command `npm run build`
4.  in project root will be created 'build' folder with UI bundle, witch can be used on production server.


## All npm commands

`npm run lint` - syntax and formatting check with eslint

`npm run format` - reformat js, scss and md using eslint and prettier

`npm run dev` - launch the development environment

`npm run build` - build the product version in the `build` folder

`npm run test` - single run all tests

`npm run test:watch` - run tests when changing files

`npm run manage:translations` - checking the relevance of localization

## Technology

Used technology stack: [React](https://reactjs.org/), [Redux](https://redux.js.org/)
