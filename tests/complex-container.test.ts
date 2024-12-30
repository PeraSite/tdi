import { describe, expect, it } from 'vitest';
import { createContainer } from '@/container';

describe('Complex Container', () => {
    it('resolves complex container', async () => {
        const container = createContainer()
            .add({ a: 'A' })
            .add({ k: 'K' })
            .upsert((ctx) => ({
                a: 22,
                c: async () => {
                    expect(ctx.a).toBe(22);
                    return 'C';
                },
            }))
            .upsert((ctx) => ({
                b: 'B',
                c: async () => {
                    expect(ctx.a).toBe(22);
                    return 'C';
                },
            }))
            .add(() => {
                return { f: 'F', g: 'G' };
            });

        await expect(container.get('c')).resolves.toBe('C');
        expect(container.get('f')).toBe('F');
        expect(container.get('a')).toBe(22);
    });
});
