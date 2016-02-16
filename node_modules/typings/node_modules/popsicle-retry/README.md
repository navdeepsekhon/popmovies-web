# Popsicle Retry

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Enable request retries for Popsicle (>= 3.2).

## Installation

```sh
npm install popsicle-retry --save
```

## Usage

```js
var request = require('popsicle').request
var retry = require('popsicle-retry')

request('http://example.com')
  .use(retry())
  .then(...)
```

### Options

* **maxRetries** The maximum number of attempts (default: `5`)
* **retryDelay** The milliseconds between each new attempt (default: `5000`)
* **shouldRetry(request: Request): boolean** A custom function to approve retries (default: on `5xx` status or unavailable error)
* **onRetry(request: Request): any** A function that runs on each retry with the new request instance (default `noop`)

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/popsicle-retry.svg?style=flat
[npm-url]: https://npmjs.org/package/popsicle-retry
[downloads-image]: https://img.shields.io/npm/dm/popsicle-retry.svg?style=flat
[downloads-url]: https://npmjs.org/package/popsicle-retry
[travis-image]: https://img.shields.io/travis/blakeembrey/popsicle-retry.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/popsicle-retry
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/popsicle-retry.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/popsicle-retry?branch=master
