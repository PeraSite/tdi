import { describe, expect, it } from 'vitest';
import { createContainer } from '@/container';

describe('Edge Case', () => {
    it('avoids infinite loop', async () => {
        const container = createContainer()
            .add({ a: async () => 'A', b: 'B', c: 'C' })
            .add({
                d: async () => {
                    return 'D';
                },
            })
            .upsert((ctx) => ({
                d: async () => {
                    expect(ctx.b).toBe('B');
                    return 'D2';
                },
            }));

        await expect(container.items.d).resolves.toBe('D2');
    });

    it('never evaluates unrequested tokens', async () => {
        let r = createContainer()
            .add({
                b: async () => {
                    throw new Error('This should not be called');
                },
                c: 'C',
            })
            .add((ctx) => {
                return {
                    d: async () => {
                        expect(ctx.c).toBe('C');
                        return 'D';
                    },
                };
            });

        await r.get('d');
        await expect(r.items.d).resolves.toBe('D');
    });
});
