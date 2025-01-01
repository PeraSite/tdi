import { describe, expect, it, vi } from 'vitest';
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
                "Tokens already exist: ['foo']",
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

    describe('addTokens', () => {
        it('adds tokens', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ baz: 'qux' });

            const added = container1.addTokens(container2, 'baz');

            expect(added.get('foo')).toBe('bar');
            expect(added.get('baz')).toBe('qux');
        });

        it('throws when add duplicate token', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ foo: 'baz' });

            // @ts-expect-error - testing for error
            expect(() => container1.addTokens(container2, 'foo')).toThrow(
                "Tokens already exist: ['foo']",
            );
        });

        it('throws when trying to add selected duplicate token', () => {
            const source = createContainer().add({
                duplicate: 123,
                unique: 456,
            });
            const target = createContainer().add({ duplicate: 123 });

            // @ts-expect-error - testing for error
            expect(() => source.addTokens(target, 'duplicate')).toThrow(
                "Tokens already exist: ['duplicate']",
            );
        });

        it('preserves lazy resolution in merged containers', () => {
            const container1 = createContainer()
                .add({ name: 'John' })
                .add((ctx) => ({
                    greeting: `Hello, ${ctx.name}`,
                }));
            const container2 = createContainer().add({ title: 'Mr.' });

            const merged = container1.addTokens(container2, 'title');
            expect(merged.get('greeting')).toBe('Hello, John');
            expect(merged.get('title')).toBe('Mr.');
        });

        it("creating container doesn't call constructor", () => {
            const spy = vi.fn(() => 'dd');
            const container = createContainer().add({ foo: spy });

            createContainer().addTokens(container, 'foo');

            expect(spy).not.toHaveBeenCalled();
        });

        it("creating container doesn't call async constructor", async () => {
            const spy = vi.fn(async () => 'dd');
            const container = createContainer().add({ foo: spy });

            createContainer().addTokens(container, 'foo');

            expect(spy).not.toHaveBeenCalled();
        });

        it('adds specific tokens from another container', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({
                baz: 'qux',
                hello: 'world',
            });

            const result = container1.addTokens(container2, 'baz');

            expect(result.get('foo')).toBe('bar');
            expect(result.get('baz')).toBe('qux');
            // @ts-expect-error - testing error on accessing non-added token
            expect(() => result.get('hello')).toThrow();
        });

        it('adds multiple tokens at once', () => {
            const source = createContainer().add({
                token1: 'value1',
                token2: 'value2',
                token3: 'value3',
            });
            const target = createContainer().add({ existing: 'value' });

            const result = target.addTokens(source, 'token1', 'token3');

            expect(result.get('existing')).toBe('value');
            expect(result.get('token1')).toBe('value1');
            expect(result.get('token3')).toBe('value3');
            // @ts-expect-error - testing error on accessing non-added token
            expect(() => result.get('token2')).toThrow();
        });

        it('handles function tokens correctly', () => {
            const source = createContainer().add({
                fn: () => 'computed value',
                normalValue: 'static',
            });
            const target = createContainer();

            const result = target.addTokens(source, 'fn', 'normalValue');

            expect(result.get('fn')).toBe('computed value');
            expect(result.get('normalValue')).toBe('static');
        });

        it('handles async function tokens', async () => {
            const source = createContainer().add({
                asyncFn: async () => 'async result',
                syncValue: 'sync',
            });
            const target = createContainer();

            const result = target.addTokens(source, 'asyncFn', 'syncValue');

            await expect(result.get('asyncFn')).resolves.toBe('async result');
            expect(result.get('syncValue')).toBe('sync');
        });

        it('throws when trying to add non-existent tokens', () => {
            const source = createContainer().add({ existing: 'value' });
            const target = createContainer();

            // @ts-expect-error - testing for runtime error with non-existent key
            expect(() => target.addTokens(source, 'nonexistent')).toThrow();
        });

        it('resolves nested dependencies', () => {
            const getName = vi.fn();
            const getGreeting = vi.fn();

            const rootContainer = createContainer().add((ctx) => ({
                name: () => {
                    getName();
                    return 'root';
                },
            }));

            const level1Container = createContainer(rootContainer).add(
                (ctx) => ({
                    greeting: () => {
                        getGreeting();
                        return `Hello, ${ctx.name}`;
                    },
                }),
            );

            const level2Container = createContainer().addTokens(
                level1Container,
                'greeting',
            );

            expect(level2Container.get('greeting')).toBe('Hello, root');
            expect(getName).toHaveBeenCalledOnce();
            expect(getGreeting).toHaveBeenCalledOnce();
        });

        it('resolves async nested dependencies', async () => {
            const getName = vi.fn();
            const getGreeting = vi.fn();

            const rootContainer = createContainer().add((ctx) => ({
                name: async () => {
                    getName();
                    return 'root';
                },
            }));

            const level1Container = createContainer(rootContainer).add(
                (ctx) => ({
                    greeting: async () => {
                        getGreeting();
                        return `Hello, ${await ctx.name}`;
                    },
                }),
            );

            const level2Container = createContainer().addTokens(
                level1Container,
                'greeting',
            );

            await expect(level2Container.get('greeting')).resolves.toBe(
                'Hello, root',
            );
            expect(getName).toHaveBeenCalledOnce();
            expect(getGreeting).toHaveBeenCalledOnce();
        });
    });

    describe('upsertTokens', () => {
        it('adds tokens from another container', () => {
            const container1 = createContainer().add({ foo: 'bar' });
            const container2 = createContainer().add({ baz: 'qux' });

            const result = container1.upsertTokens(container2, 'baz');

            expect(result.get('foo')).toBe('bar');
            expect(result.get('baz')).toBe('qux');
        });

        it('overwrites existing tokens', () => {
            const container1 = createContainer().add({
                foo: 'bar',
                common: 'old',
            });
            const container2 = createContainer().add({
                baz: 'qux',
                common: 'new',
            });

            const result = container1.upsertTokens(container2, 'common');

            expect(result.get('foo')).toBe('bar');
            expect(result.get('common')).toBe('new');
        });

        it('preserves lazy evaluation when upserting tokens', () => {
            const container1 = createContainer().add({
                name: 'John',
                greeting: (ctx: any) => `Hello, ${ctx.name}`,
            });
            const container2 = createContainer().add({
                name: 'Jane',
                title: 'Ms.',
            });

            const result = container1.upsertTokens(container2, 'name');

            expect(result.get('greeting')).toBe('Hello, Jane');
        });

        it('resolves nested dependencies', () => {
            const getName = vi.fn();
            const getGreeting = vi.fn();

            const rootContainer = createContainer().add((ctx) => ({
                name: () => {
                    getName();
                    return 'root';
                },
            }));

            const level1Container = createContainer(rootContainer).add(
                (ctx) => ({
                    greeting: () => {
                        getGreeting();
                        return `Hello, ${ctx.name}`;
                    },
                }),
            );

            const level2Container = createContainer().addTokens(
                level1Container,
                'greeting',
            );

            const level3Container = createContainer()
                .add({
                    greeting: 'WRONG STRING',
                })
                .upsertTokens(level2Container, 'greeting');

            expect(level3Container.get('greeting')).toBe('Hello, root');
            expect(getName).toHaveBeenCalledOnce();
            expect(getGreeting).toHaveBeenCalledOnce();
        });

        it('resolves async nested dependencies', async () => {
            const getName = vi.fn();
            const getGreeting = vi.fn();

            const rootContainer = createContainer().add((ctx) => ({
                name: async () => {
                    getName();
                    return 'root';
                },
            }));

            const level1Container = createContainer(rootContainer).add(
                (ctx) => ({
                    greeting: async () => {
                        getGreeting();
                        return `Hello, ${await ctx.name}`;
                    },
                }),
            );

            const level2Container = createContainer().addTokens(
                level1Container,
                'greeting',
            );

            const level3Container = createContainer()
                .add({
                    greeting: 'WRONG STRING',
                })
                .upsertTokens(level2Container, 'greeting');

            await expect(level3Container.get('greeting')).resolves.toBe(
                'Hello, root',
            );
            expect(getName).toHaveBeenCalledOnce();
            expect(getGreeting).toHaveBeenCalledOnce();
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
