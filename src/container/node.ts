import { AbstractNode } from './abstract-node';
import { ContextGetter, UnpackFunction } from '@/types';
import { addGetter } from '@/utils';
import { Container } from './index';

export class Node<Context extends {}> extends AbstractNode<Context> {
    /**
     * When we create a new class instance or function, we cache the output
     */
    protected readonly _cache: { [K in keyof Context]?: any };

    /**
     * Holds key:value factories in a form token:factory
     */
    protected readonly _context: Context;

    constructor(_context?: Context) {
        super();
        this._context = _context ?? <Context>{};
        this._cache = {};
    }

    public get<SearchToken extends keyof Context>(
        token: SearchToken,
    ): UnpackFunction<Context[SearchToken]> {
        if (token in this._context) {
            const tokenValue = this._context[token];

            if (token in this._cache) {
                return this._cache[token];
            }

            if (typeof tokenValue === 'function') {
                if (tokenValue.length > 0) {
                    const providedValue = tokenValue(this.items, this);
                    const value =
                        typeof providedValue === 'function'
                            ? providedValue()
                            : providedValue;
                    this._cache[token] = value;
                    return value;
                }

                const providedValue = tokenValue();
                this._cache[token] = providedValue;
                return providedValue;
            }

            this._cache[token] = tokenValue;
            return tokenValue as any;
        }

        throw new Error(`Can't find token '${String(token)}' value`);
    }

    protected _updateContext(updatedContext: Context) {
        for (const [token, value] of Object.entries(updatedContext)) {
            // Save state and clear cache
            // @ts-expect-error - we are sure that token is a key of Context
            this._context[token] = value;

            // @ts-expect-error - we are sure that token is a key of Context
            delete this._cache[token];
        }
    }

    public delete<SearchToken extends keyof Context>(
        token: SearchToken,
    ): Container<Omit<Context, SearchToken>> {
        delete this._context[token];
        delete this._cache[token];

        return this as any;
    }

    public get items(): ContextGetter<Context> {
        const itemMap = <ContextGetter<Context>>{};
        for (const key in this.getTokens()) {
            addGetter(itemMap, key, () => {
                return this.get(key as any);
            });
        }
        return itemMap;
    }

    public getTokens(): {
        [T in keyof Context]: T;
    } {
        return Object.fromEntries(
            Object.keys(this._context).map((el) => [el, el]),
        ) as any;
    }
}
