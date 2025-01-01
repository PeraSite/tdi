import { Container, createContainer } from '@/index';
import { describe, expect, it } from 'vitest';

describe('index exports', () => {
    it('should export Container', () => {
        expect(Container).toBeDefined();
    });

    it('should export createContainer', () => {
        expect(createContainer).toBeDefined();
    });
});
