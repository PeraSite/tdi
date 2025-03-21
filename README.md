# tdi(tiny di)

![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40perasite%2Ftdi)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/perasite/tdi/test.yml)
![Codecov](https://img.shields.io/codecov/c/github/PeraSite/tdi)
![NPM Version](https://img.shields.io/npm/v/%40perasite%2Ftdi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A tiny, zero-dependencies, immutable, type-safe IoC container for TypeScript.

## Why tdi?

- 📦 **Tiny**: < 1KB minified + gzipped
- 🧩 **Simple**: No decorators, reflection, or magic strings
- 🛡️ **Type-safe**: Full TypeScript support with type inference and compile-time checks
- ⚡ **Async Support**: First-class support for async dependencies
- 🔒 **Immutable**: New container is created without mutating the original

## Installation

Choose your preferred package manager:

```bash
npm install @perasite/tdi    # npm
pnpm install @perasite/tdi   # pnpm
yarn add @perasite/tdi       # yarn
```

## Usage Examples

### 1️⃣ Basic DI Container
Create a container and add dependencies with automatic type inference. Access dependencies through the `items` property or `get()` method.

```typescript
import { createContainer } from '@perasite/tdi';

// Create a container with configuration
const container = createContainer()
  .add({
    config: {
      apiUrl: 'https://api.example.com', 
      timeout: 5000
    }
  });

// Access dependencies with full type safety
container.items.config;    // { apiUrl: string; timeout: number }
container.get('config');  // does the same
```

Dependencies can be values, functions, or promises. Function dependencies are evaluated when accessed.
```typescript
const container = createContainer()
  .add({
    lazyValue: () => 'Hello, world'
    asyncValue: async () => 'Hello, async world'
  });

container.items.lazyValue;  // 'Hello, world'
await container.items.asyncValue; // 'Hello, async world'
```

### 2️⃣ Compile-time Type Safety
The container prevents errors like duplicate dependencies and accessing non-existent values at compile time.
Use `upsert()` to safely update existing values when needed.

```typescript
const container = createContainer()
  .add({ 
    config: { apiUrl: 'https://api.example.com' }
  });

// ❌ Error: Unsafe overwrite. Use `upsert` instead
container.add({ 
  config: { timeout: 5000 }
});

// ❌ Error: Property `missing` does not exist
container.add((ctx) => ({
  service: () => ctx.missing 
}));

// ✅ Valid
container
  .upsert({ config: { apiUrl: 'https://new-api.com' } })
  .add((ctx) => ({
    newService: () => ctx.config.apiUrl
  }));
```

### 3️⃣ Dependency Resolution
Dependencies are lazily evaluated, ensuring they always reflect the current state when accessed through context.

```typescript
const userContainer = createContainer()
    .add({
        name: 'John'
    });

const greetContainer = createContainer(userContainer)
    .add((ctx) => ({
        greet: () => `Hello, ${ctx.name}!`
    }))
    .add((ctx) => ({
        formal: () => `${ctx.greet} How are you?`
    }));

const janeContainer = greetContainer.upsert({
    name: 'Jane'
});

// greet, formal are now automatically updated
janeContainer.items.name;   // 'Jane'
janeContainer.items.greet;  // 'Hello, Jane!'
janeContainer.items.formal; // 'Hello, Jane! How are you?'
```

### 4️⃣ Container Operations
Compose containers using various operations to manage dependencies effectively:
- `addContainer()`: Import all dependencies from another container
- `upsertContainer()`: Override existing dependencies from another container
- `addTokens()`: Import specific dependencies
- `upsertTokens()`: Override specific dependencies

```typescript
// Base container with configuration
const baseContainer = createContainer()
  .add({ config: { apiUrl: 'https://api.example.com' } });

// Add all dependencies
const extendedContainer = createContainer()
  .addContainer(baseContainer)
  .add({ additionalConfig: { timeout: 5000 } });

// Override existing dependencies
const updatedContainer = createContainer()
  .add({ config: { apiUrl: 'https://new-api.com' } })
  .upsertContainer(baseContainer)

// Import specific dependencies
const specificContainer = createContainer()
  .addTokens(baseContainer, 'config')

// Override specific dependencies
const specificUpdatedContainer = createContainer()
  .add({ config: { apiUrl: 'https://new-api.com' } })
  .upsertTokens(baseContainer, 'config');
```

### 5️⃣ Complex scenarios with testing
Create test environments by overriding production dependencies with mocks using `upsert`.

```typescript
interface IUserRepository {
  getUser(id: number): Promise<string>;
}

class UserRepository implements IUserRepository {
  async getUser(id: number): Promise<string> {
    return `User ${id} from Database`;
  }
}

class UserService {
  constructor(private userRepository: IUserRepository) {
  }

  async printName(id: number) {
    console.log(await this.userRepository.getUser(id));
  }
}

// Production container with real implementation
const prodContainer = createContainer()
  .add({
    userRepository: (): IUserRepository => new UserRepository(),
  })
  .add(ctx => ({
    userService: new UserService(ctx.userRepository),
  }));

// Test container with mock implementation
const testContainer = prodContainer
  .upsert({
    userRepository: (): IUserRepository => ({
      getUser: async () => 'Mock User',
    }),
  });

await prodContainer.get('userService').printName(1); // User 1 from Database
await testContainer.get('userService').printName(1); // Mock User
```

## Support

- 📫 Create an [issue](https://github.com/PeraSite/tdi/issues) for bug reports
- 💡 Start a [discussion](https://github.com/PeraSite/tdi/discussions) for feature requests
- 🤔 Ask questions in the [discussions](https://github.com/PeraSite/tdi/discussions) section

## License

MIT © [PeraSite](https://github.com/PeraSite)
