import { describe, expect, it } from 'vitest';
import { Container } from '@/container';

describe('Container Constructor', () => {
    it('returns container from context', () => {
        const container = Container.create({ a: 1 });
        expect(container.get('a')).toBe(1);
    });
});
