# tdi (tiny di)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40perasite%2Ftdi)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/perasite/tdi/test.yml)
![Codecov](https://img.shields.io/codecov/c/github/PeraSite/tdi)
![NPM Version](https://img.shields.io/npm/v/%40perasite%2Ftdi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A tiny, zero-dependencies, immutable, type-safe, IoC container for TypeScript without decorator, reflections.

*heavily inspired by [itijs](https://itijs.org/) library.*

## Features
- **Hassle-free.** No decorators, reflection, magic strings, inherit. Just simple container.
- **Tiny.** No runtime dependencies, under 1kb gzipped.
- **Type-safe.** Supports type checking, auto-completion, go to definition.
- **Flexible.** Supports merging containers, upserting dependencies, and inject dependencies using context.
- **Async.** Supports async dependencies.

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

container.get("foo") // 'bar'
container.items.foo; // 'bar' (same as get())

await container.items.jazz; // 'rizz'
container.items.logger.log('Hello, World!');
//             ^ { logger: ILogger }
```

### Managing Dependencies using Context
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
const originalContainer = createContainer()
  .add({ name: 'John' })
  .add((ctx) => ({
    greeting: `Hello, ${ctx.name}`,
  }));

const modifiedContainer = originalContainer.upsert({ name: 'Lukas' });

originalContainer.items.greeting; // 'Hello, John'
modifiedContainer.items.greeting; // 'Hello, Lukas'
```

### Immutable Pure Container
```typescript
const container = createContainer().add({ foo: 'bar' });
const addedContainer = container.add({ jazz: 'rizz' });

container.items.jazz; // throws Error
addedContainer.items.jazz; // 'rizz'

const upsertedContainer = container.upsert({ foo: 'baz' });

container.items.foo; // 'bar'
upsertedContainer.items.foo; // 'baz'
```
