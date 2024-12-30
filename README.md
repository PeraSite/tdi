# tdi

A 2kB, zero-depdendency, pure, type-safe, DI library for TypeScript.

*heavily inspired by [itijs](https://itijs.org/) library*

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
- Zero runtime dependency
- Tiny size (~2kB)
- No side-effect & Immutable container
- Type-safe & Intellisense support
- Supports Promise & async/await
- Caches resolved value
