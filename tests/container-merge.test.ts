import { describe, expect, it } from 'vitest';
import { createContainer } from '@/container';

describe('Container Merge', () => {
    it('merge two container', () => {
        const container1 = createContainer().add({ foo: 'bar' });
        const container2 = createContainer().add({ baz: 'qux' });

        const merged = container1.merge(container2);

        expect(merged.get('foo')).toBe('bar');
        expect(merged.get('baz')).toBe('qux');
    });

    it('overwrites first container with second container', () => {
        const container1 = createContainer().add({ foo: 'bar' });
        const container2 = createContainer().add({ foo: 'baz' });

        const merged = container1.merge(container2);

        expect(merged.get('foo')).toBe('baz');
    });

    it('lazily resolve dependencies', () => {
        const originalContainer = createContainer()
            .add({ name: 'John' })
            .add((ctx) => ({
                greeting: `Hello, ${ctx.name}`,
            }));
        const modifiedContainer = originalContainer.upsert({ name: 'Lukas' });

        expect(originalContainer.get('greeting')).toBe('Hello, John');
        expect(modifiedContainer.get('greeting')).toBe('Hello, Lukas');
    });
});
