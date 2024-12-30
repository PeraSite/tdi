import { describe, expect, it, vi } from 'vitest';
import { createContainer } from '@/container';

describe('Container Get', () => {
    it('returns a value as a value', () => {
        const container = createContainer().add({
            a: 123,
        });
        expect(container.get('a')).toBe(123);
    });

    it('throws if a token is missing', () => {
        const container = createContainer().add({
            a: 123,
        });
        expect(() => {
            // @ts-expect-error
            container.get('c');
        }).toThrowError();
    });

    it('returns function result and not a function', () => {
        const container = createContainer().add({
            functionToken: () => 'optimus',
        });
        expect(container.get('functionToken')).toBe('optimus');
    });

    it('returns correct tokens for merged and overridden nodes', () => {
        const container = createContainer()
            .add({ optimus: () => 'prime', a: 123 })
            .upsert({ a: '123' });
        expect(container.getTokens()).toMatchObject({
            optimus: 'optimus',
            a: 'a',
        });
    });

    it('returns cached value of a function', () => {
        const fn = vi.fn();
        const container = createContainer().add({
            optimus: () => {
                fn();
                return 'prime';
            },
        });
        container.get('optimus');
        container.get('optimus');
        container.get('optimus');
        expect(container.get('optimus')).toBe('prime');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('returns promises of async functions', async () => {
        const container = createContainer().add({
            optimus: async () => 'prime',
        });

        await expect(container.get('optimus')).resolves.toBe('prime');
    });

    it('handles async errors', async () => {
        const container = createContainer().add({
            optimus: async () => 'prime',
            megatron: async () => {
                throw 'some error';
            },
        });

        await expect(container.get('optimus')).resolves.toBe('prime');
        await expect(container.get('megatron')).rejects.toBe('some error');
    });

    it('calls inner function twice and outer function once', () => {
        const outerFn = vi.fn();
        const innerFn = vi.fn();

        const container = createContainer().add({
            outer: () => {
                outerFn();
                return {
                    inner: () => {
                        innerFn();
                        return 'inner';
                    },
                };
            },
            foo: 'bar',
            jazz: 'hands',
        });

        expect(outerFn).toBeCalledTimes(0);
        expect(innerFn).toBeCalledTimes(0);

        const outer1 = container.get('outer');
        outer1.inner();
        const outer2 = container.get('outer');
        outer2.inner();

        expect(outerFn).toBeCalledTimes(1);
        expect(innerFn).toBeCalledTimes(2);
    });

    it('throws when adding exist token', () => {
        const container = createContainer().add({
            a: 123,
        });
        expect(() => {
            container.add({
                // @ts-expect-error - adding duplicate token for testing
                a: 123,
            });
        }).toThrowError();
    });
});
