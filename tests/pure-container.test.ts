import { describe, expect, it } from 'vitest';
import { createContainer } from '@/container';

describe('Container Purity', () => {
    it('add create a new container', () => {
        const container = createContainer().add({
            foo: 'bar',
        });

        container.add({
            someValue: '123',
        });

        // @ts-expect-error container does not contains key 'someValue'
        expect(() => container.get('someValue')).toThrowError();
    });

    it('upsert create a new container', () => {
        const container = createContainer().add({
            foo: 'bar',
        });

        container.upsert({
            someValue: '123',
        });

        // @ts-expect-error container does not contains key 'someValue'
        expect(() => container.get('someValue')).toThrowError();
    });

    it('upsert value does not modify original value', () => {
        const container = createContainer().add({
            foo: 'bar',
        });

        container.upsert({
            foo: 'new value',
        });

        expect(container.get('foo')).toBe('bar');
    });

    it('upsert getter does not modify original value', () => {
        const container = createContainer().add({
            foo: () => 'bar',
        });

        container.upsert({
            foo: () => 'new value',
        });

        expect(container.get('foo')).toBe('bar');
    });
});
