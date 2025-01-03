# 🎯 tdi (tiny di)

![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40perasite%2Ftdi)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/perasite/tdi/test.yml)
![Codecov](https://img.shields.io/codecov/c/github/PeraSite/tdi)
![NPM Version](https://img.shields.io/npm/v/%40perasite%2Ftdi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚀 A tiny, zero-dependencies, immutable, type-safe IoC container for TypeScript.

## ✨ Features
- 🪶 **Lightweight**: Zero runtime dependencies, < 1kb gzipped
- 🔒 **Type-safe**: Full TypeScript support with type inference
- 🧩 **Simple**: No decorators, reflection, or magic strings
- ⚡️ **Async Support**: Handle async dependencies with ease
- 🔄 **Immutable**: Predictable state management

## 📦 Installation

```bash
# npm
npm install @perasite/tdi

# pnpm
pnpm install @perasite/tdi

# yarn
yarn add @perasite/tdi
```

## 💡 Usage

### Basic Container
```typescript
import { createContainer } from '@perasite/tdi';

const container = createContainer()
  .add({ 
    name: 'John',
    greet: (ctx) => `Hello, ${ctx.name}!`
  });

container.items.greet; // 'Hello, John!'
```

### Type Safety
```typescript
interface ILogger {
  log(message: string): void;
}

const container = createContainer()
  .add({
    logger: (): ILogger => ({
      log: (msg) => console.log(msg)
    })
  });

container.items.logger.log('Type-safe!');
//             ^ { logger: ILogger }
```

### Container Operations
```typescript
// Merge containers
const baseContainer = createContainer().add({ name: 'John' });
const extendedContainer = createContainer().add({ title: 'Mr.' });
const merged = baseContainer.addContainer(extendedContainer);

// Upsert values
const updated = container.upsert({ name: 'Jane' });

// Add specific tokens
const source = createContainer().add({ a: 1, b: 2, c: 3 });
const target = createContainer().addTokens(source, 'a', 'b');
```

### Async Dependencies
```typescript
const container = createContainer()
  .add({
    fetchUser: async () => {
      const response = await fetch('/api/user');
      return response.json();
    },
    userProfile: async (ctx) => {
      const user = await ctx.fetchUser;
      return `Profile of ${user.name}`;
    }
  });

await container.items.userProfile; // 'Profile of John'
```

## 📝 License
MIT © [PeraSite](https://github.com/PeraSite)
