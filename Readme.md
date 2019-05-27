# Drill4J Project · [![Build Status](https://cloud.drone.io/api/badges/Drill4J/browser-extension/status.svg)](https://cloud.drone.io/Drill4J/browser-extension)

<img src="./logo.svg" alt="Logo" width="128" align="right">

Drill4J is a plugin management platform for real-time application profiling and extension that does not affect code base.

Drill4J allows you to:

- automate and organize data
- choose the right solutions for specific tasks
- increase the velocity and quality of the team
- store all plugins in one place
- flexible configuration of agents and plugins for project needs

## Documentation

Check out our [documentation](https://github.com/Drill4J/browser-extension/tree/master/dev-guide)

## Development installation

For development you need a [node.js](https://nodejs.org).

To launch the development environment, follow these steps:

1.  open console from the project root
2.  run the command `npm install`
3.  run the command `npm start`
4.  enjoy the development.

## Production version installation

For making build you need a [node.js](https://nodejs.org).

To get production bundle, follow these steps:

1.  open console from the project root
2.  run the command `npm install`
3.  run the command `npm build`
4.  in project root will be created 'build' folder with UI bundle, witch can be used on production server.

## All npm commands

`npm start` - launch the development environment

`npm build` - build the product version in the `build` folder

`npm test` - run tests when changing files

`npm lint` - run tslint

`npm typecheck` - run TypeScript typechecing

## Technology

Used technology stack: [TypeScript](https://www.typescriptlang.org/) [React](https://reactjs.org/)
