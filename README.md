# tdi (tiny di)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40perasite%2Ftdi)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/perasite/tdi/test.yml)
![Codecov](https://img.shields.io/codecov/c/github/PeraSite/tdi)
![NPM Version](https://img.shields.io/npm/v/%40perasite%2Ftdi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A 1kB, zero-dependencies, immutable, type-safe, IoC container for TypeScript.

*heavily inspired by [itijs](https://itijs.org/) library.*

## Installation
```bash
pnpm install @perasite/tdi
```

## Usage
```typescript
import { createContainer } from '@perasite/tdi';

interface ILogger {
  log(message: string): void;
}

class ConsoleLogger implements ILogger {
  log(message: string) {
	console.log(message);
  }
};

const container = createContainer().add({
	logger: (): ILogger => new ConsoleLogger()
});

container.items.logger.log('Hello, World!');
// Output: Hello, World!
```

## Features
- Zero runtime dependencies
- Tiny size (~2kB)
- No side-effect & Immutable container
- Type-safe & Intellisense support
- Supports Promise & async/await
- Caches resolved value
