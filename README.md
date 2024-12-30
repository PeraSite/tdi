# tdi (tiny di)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40perasite%2Ftdi)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/perasite/tdi/test.yml)
![Codecov](https://img.shields.io/codecov/c/github/PeraSite/tdi)
![NPM Version](https://img.shields.io/npm/v/%40perasite%2Ftdi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A ~1kB, zero-dependencies, immutable, type-safe, IoC container for TypeScript.

*heavily inspired by [itijs](https://itijs.org/) library.*

## Features
- Zero runtime dependencies
- Tiny size (~2kB)
- No side-effect & Immutable container
- Type-safe & Intellisense support
- Supports Promise & async/await
- Caches resolved value

## Installation
```bash
pnpm install @perasite/tdi
```

## Usage
### Basic Usage
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
  foo: 'bar',
  jazz: async () => "rizz",
  logger: (): ILogger => new ConsoleLogger()
});

container.items.foo; // 'bar'
await container.items.jazz; // 'rizz'
container.items.logger.log('Hello, World!');
//             ^ { logger: ILogger }
```

### Managing Dependencies
```typescript
class Foo {
  constructor(private logger: ILogger) {}

  bar() {
    this.logger.log('Hello, World!');
  }
}

const container = createContainer()
  .add({ 
    logger: (): ILogger => new ConsoleLogger(), 
  })
  .add(ctx => ({
	foo: new Foo(ctx.logger)
  }));

container.items.foo.bar();
// Output: Hello, World!
```

### Merging Containers
```typescript
const container1 = createContainer().add({ foo: 'bar' });
const container2 = createContainer().add({ jazz: 'rizz' });

const container = container1.merge(container2);

container.items.foo; // 'bar'
container.items.jazz; // 'rizz'
```

### Upsert Dependencies
```typescript
const container = createContainer().add({ foo: 'bar' });
```
