# What is this?

This is a zero dependency package that provides some expirable implementations of common Data Structures.  
Thanks to the [npm-package-ts-scaffolding](https://github.com/Cadienvan/npm-package-ts-scaffolding) it is importable both via CommonJS and ES Modules.  


# How do I install it?

You can install it by using the following command:

```bash
npm install @cadienvan/expirables
```

# Available Data Structures

## ExpirableMap

An extension of the native `Map` class that adds the ability to set an expiration time for each entry.
[See the README.md](./src/Map/README.md)

## ExpirableSet

An extension of the native `Set` class that adds the ability to set an expiration time for each entry.
[See the README.md](./src/Set/README.md)

## ExpirableQueue

An implementation of a simple queue with the ability to set an expiration time for each entry.
[See the README.md](./src/Queue/README.md)

# Tests

You can run the tests by using the following command:

```bash
npm test
```

# Scaffolding

This project was generated using Cadienvan's own [npm-package-ts-scaffolding](https://github.com/Cadienvan/npm-package-ts-scaffolding) so it has all the necessary tools to develop, test and publish a TypeScript package importable both via CommonJS and ES Modules.
