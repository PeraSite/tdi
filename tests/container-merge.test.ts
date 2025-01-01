import { describe, expect, it } from 'vitest';
import { createContainer } from '@/container';

describe('Container Operations', () => {
    describe('addContainer', () => {
        it('merges two containers with different keys', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ baz: 'qux' });

            const merged = container1.addContainer(container2);

            expect(merged.get('foo')).toBe('bar');
            expect(merged.get('baz')).toBe('qux');
        });

        it('throws error when trying to merge containers with duplicate keys', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ foo: 'baz' });

            // @ts-expect-error - testing for error
            expect(() => container1.addContainer(container2)).toThrow(
                "Tokens already exist: ['foo']"
            );
        });

        it('preserves lazy resolution in merged containers', () => {
            const container1 = createContainer()
                .add({ name: 'John' })
                .add((ctx) => ({
                    greeting: `Hello, ${ctx.name}`,
                }));
            const container2 = createContainer().add({ title: 'Mr.' });

            const merged = container1.addContainer(container2);
            expect(merged.get('greeting')).toBe('Hello, John');
            expect(merged.get('title')).toBe('Mr.');
        });
    });

    describe('upsertContainer', () => {
        it('merges two containers with different keys', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ baz: 'qux' });

            const merged = container1.upsertContainer(container2);

            expect(merged.get('foo')).toBe('bar');
            expect(merged.get('baz')).toBe('qux');
        });

        it('overwrites keys from first container with second container', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ foo: 'baz' });

            const merged = container1.upsertContainer(container2);

            expect(merged.get('foo')).toBe('baz');
        });

        it('preserves lazy resolution in merged containers', () => {
            const container1 = createContainer()
                .add({ name: 'John' })
                .add((ctx) => ({
                    greeting: `Hello, ${ctx.name}`,
                }));
            const container2 = createContainer().add({ name: 'Jane' });

            const merged = container1.upsertContainer(container2);
            expect(merged.get('greeting')).toBe('Hello, Jane');
        });
    });

    describe('merge (deprecated)', () => {
        it('behaves same as upsertContainer', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ foo: 'baz' });

            const mergeResult = container1.merge(container2);
            const upsertResult = container1.upsertContainer(container2);

            expect(mergeResult.get('foo')).toBe(upsertResult.get('foo'));
        });
    });
});
