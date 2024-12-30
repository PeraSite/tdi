import { describe, expect, it } from 'vitest';
import { Container } from '@/container';

describe('Container Constructor', () => {
    it('returns container from context', () => {
        const container = Container.create({ a: 1 });
        expect(container.get('a')).toBe(1);
    });

    it('returns container from container', () => {
        const container = Container.create({ a: 1 });
        const newContainer = Container.createFrom(container);
        expect(newContainer.get('a')).toBe(1);
    });
});
