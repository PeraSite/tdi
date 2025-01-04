# 🎯 tdi

![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40perasite%2Ftdi)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/perasite/tdi/test.yml)
![Codecov](https://img.shields.io/codecov/c/github/PeraSite/tdi)
![NPM Version](https://img.shields.io/npm/v/%40perasite%2Ftdi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚀 A tiny, zero-dependencies, immutable, type-safe IoC container for TypeScript.

## 🌟 Why tdi?

- 📦 **Tiny**: < 1KB minified + gzipped
- 🧩 **Simple**: No decorators, reflection, or magic strings
- 🛡️ **Type-safe**: Full TypeScript support with type inference and compile-time checks
- ⚡ **Async Support**: First-class support for async dependencies
- 🔒 **Immutable**: New container is created without mutating the original

## 📥 Installation

Choose your preferred package manager:

```bash
npm install @perasite/tdi    # npm
pnpm install @perasite/tdi   # pnpm
yarn add @perasite/tdi       # yarn
```

## 📘 Usage Examples

### 1️⃣ Basic DI Container
```typescript
import { createContainer } from '@perasite/tdi';

const container = createContainer()
  .add({
    config: {
      apiUrl: 'https://api.example.com',
      timeout: 5000
    }
  })

// Type is inferred automatically!
container.items.config;    // { apiUrl: string; timeout: number }
```

### 2️⃣ Compile-time Type Safety
```typescript
const container = createContainer()
  .add({ 
    config: { apiUrl: 'https://api.example.com' }
  });

// ❌ Compile Error: Duplicate key 'config'
container.add({ 
  config: { timeout: 5000 }  // Type error!
});

// ❌ Compile Error: Missing dependency
container.add((ctx) => ({
  service: () => ctx.missing  // Type error!
}));

// ✅ Valid operations
container
  .upsert({ config: { apiUrl: 'https://new-api.com' } })  // OK
  .add((ctx) => ({
    newService: () => ctx.config.apiUrl
  }));  // OK
```

### 3️⃣ Container chaining & Composition
```typescript
const container = createContainer()
    .add({
        name: 'John' // Value is eagerly resolved
    })
    .add((ctx) => ({
        greet: () => `Hello, ${ctx.name}!` // Value is lazily resolved
    }))
    .add((ctx) => ({
        formal: () => `${ctx.greet} How are you?`
    }));

// Upserting values (updates existing or adds new)
const updated = container.upsert({
    name: 'Jane',    // Updates existing
    title: 'Dr.'     // Adds new
});

updated.items.name;   // 'Jane'
updated.items.title;  // 'Dr.'
updated.items.formal; // 'Hello, Jane! How are you?'
```

### 4️⃣ Container Operations
```typescript
// Adding specific tokens from another container
const source = createContainer()
  .add({ a: 1, b: 2, c: 3 });

const target = createContainer()
  .addTokens(source, 'a', 'b');     // Only adds 'a' and 'b'
  
// Upserting specific tokens
const updatedTarget = target
  .upsertTokens(source, 'a');     // Only updates 'a'

// Merging containers
const merged = container
  .addContainer(updated)            // Adds all tokens
  .upsertContainer(source);         // Updates existing tokens
```

### 5️⃣ Async Promise Resolving
```typescript
const container = createContainer().add({
    timeConsumingTask: async () => {
        // Do API stuff
        return 'John';
    },
});

await container.items.timeConsumingTask; // "John"
```

## 💬 Support

- 📫 Create an [issue](https://github.com/PeraSite/tdi/issues) for bug reports
- 💡 Start a [discussion](https://github.com/PeraSite/tdi/discussions) for feature requests
- 🤔 Ask questions in the [discussions](https://github.com/PeraSite/tdi/discussions) section

## 📝 License

MIT © [PeraSite](https://github.com/PeraSite)
