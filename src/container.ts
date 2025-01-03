import {
    ContextGetter,
    UnpackFunction,
    Assign,
    Intersection,
    MyRecord,
    Prettify,
} from '@/types';
import { addGetter, intersectionKeys } from '@/utils';

/**
 * IoC Container class for managing dependency injection
 */
export class Container<Context extends {}> {
    /**
     * Cache for storing resolved values
     */
    protected readonly _cache: { [K in keyof Context]?: any };

    /**
     * Context object containing token-value pairs
     */
    protected readonly _context: Context;

    /**
     * Creates a new Container instance
     * @param context Initial context object
     */
    static create<Context extends {}>(context?: Context) {
        return new Container(context);
    }

    /**
     * Creates a new Container instance from an existing container
     * @param container Source container to copy from
     */
    static createFrom<Context extends {}>(container?: Container<Context>) {
        return new Container(container?._context);
    }

    /**
     * Initializes the container with the given context
     * @param context Initial context object
     */
    constructor(context?: Context) {
        this._context = context ?? <Context>{};
        this._cache = {};
    }

    /**
     * Gets a value from the container by token
     * @param token The token to retrieve
     * @returns The value associated with the token
     * @throws Error if the token is not found in the container
     */
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

    /**
     * Gets all items in the container as a getter object
     * @returns An object with getters for each token in the container
     */
    public get items(): ContextGetter<Context> {
        const itemMap = <ContextGetter<Context>>{};
        for (const key in this.getTokens()) {
            addGetter(itemMap, key, () => {
                return this.get(key as any);
            });
        }
        return itemMap;
    }

    /**
     * Gets all available tokens in the container
     * @returns An object with token names as keys
     */
    public getTokens(): {
        [T in keyof Context]: T;
    } {
        return Object.fromEntries(
            Object.keys(this._context).map((el) => [el, el]),
        ) as any;
    }

    /**
     * Updates or inserts new values into the container
     * @param newContext New context object or function that returns context
     * @returns New container with updated or inserted values
     * @throws Error if the context function fails to execute
     */
    public upsert<NewContext extends {}>(
        newContext:
            | NewContext
            | ((
                  containers: ContextGetter<Context>,
                  self: Container<Context>,
              ) => NewContext),
    ): Container<Prettify<Assign<Context, NewContext>>> {
        if (typeof newContext === 'function') {
            // @ts-expect-error - we are sure that newContext is a function that takes containers and self
            const createdContext = newContext(this.items, this);

            const wrappedContext = Object.keys(createdContext).reduce(
                (acc, key) => {
                    // @ts-expect-error - we are sure that newContext is a function that takes containers and self
                    acc[key as keyof NewContext] = (
                        containers: ContextGetter<Context>,
                        self: Container<Context>,
                    ) => {
                        // @ts-expect-error - we are sure that newContext is a function that takes containers and self
                        return newContext(containers, self)[key];
                    };
                    return acc;
                },
                {} as NewContext,
            );

            return new Container({
                ...this._context,
                ...wrappedContext,
            }) as any;
        }

        return new Container({ ...this._context, ...newContext }) as any;
    }

    /**
     * Safely adds new values to the container without overwriting existing ones
     * @param newContextOrCb New context object or function that returns context
     * @returns New container with added values
     * @throws Error if any tokens already exist in the current container
     */
    public add<
        NewContext extends Intersection<
            MyRecord<
                Context,
                'You are overwriting this token. It is not safe. Use an unsafe `upsert` method'
            >,
            NewContext
        >,
    >(
        newContextOrCb:
            | NewContext
            | ((
                  items: ContextGetter<Context>,
                  self: Container<Context>,
              ) => NewContext),
    ): Container<Prettify<Assign<Context, NewContext>>> {
        const newContext =
            typeof newContextOrCb === 'function'
                ? newContextOrCb(this.items, this)
                : newContextOrCb;

        const duplicates = intersectionKeys(newContext, this.getTokens());
        if (duplicates)
            throw new Error(`Tokens already exist: ['${duplicates}']`);

        return this.upsert(newContextOrCb);
    }

    /**
     * Merges another container into this one
     * @deprecated Use addContainer to safely add tokens or upsertContainer to overwrite tokens instead
     * @param other Container to merge tokens from
     * @returns New container with merged tokens
     */
    public merge<OtherContext extends {}>(
        other: Container<OtherContext>,
    ): Container<Prettify<Assign<Context, OtherContext>>> {
        return this.upsertContainer(other);
    }

    /**
     * Adds tokens from another container without overwriting existing ones
     * @param other Container to add tokens from
     * @returns New container with added tokens
     * @throws Error if any tokens already exist in the current container
     */
    public addContainer<
        OtherContext extends Intersection<
            MyRecord<
                Context,
                'You are overwriting this token. It is not safe. Use upsertContainer instead'
            >,
            OtherContext
        >,
    >(
        other: Container<OtherContext>,
    ): Container<Prettify<Assign<Context, OtherContext>>> {
        const duplicates = intersectionKeys(other._context, this.getTokens());
        if (duplicates)
            throw new Error(`Tokens already exist: ['${duplicates}']`);

        return this.upsertContainer(other);
    }

    /**
     * Updates or inserts tokens from another container
     * @param other Container to merge tokens from
     * @returns New container with merged tokens
     */
    public upsertContainer<OtherContext extends {}>(
        other: Container<OtherContext>,
    ): Container<Prettify<Assign<Context, OtherContext>>> {
        return new Container({
            ...this._context,
            ...other._context,
        }) as unknown as Container<Prettify<Assign<Context, OtherContext>>>;
    }

    /**
     * Adds specific tokens from another container
     * @param other Container to add tokens from
     * @param keys Array of token keys to add
     * @returns New container with added tokens
     * @throws Error if any specified tokens are not found in the source container
     * @throws Error if any tokens already exist in the current container
     */
    public addTokens<
        OtherContext extends Intersection<
            MyRecord<
                Context,
                'You are overwriting this token. It is not safe. Use an unsafe `upsertTokens` method'
            >,
            Pick<OtherContext, K>
        >,
        K extends keyof OtherContext,
    >(
        other: Container<OtherContext>,
        ...keys: K[]
    ): Container<Prettify<Assign<Context, Pick<OtherContext, K>>>> {
        if (!keys.every((key) => key in other._context)) {
            throw new Error('Tokens not found in other container');
        }

        const newContext = keys.reduce(
            (acc, key) => {
                // @ts-expect-error - we are sure that newContext is a function that takes containers and self
                acc[key] = () => other.get(key);
                return acc;
            },
            {} as Pick<OtherContext, K>,
        );

        // @ts-expect-error - we are sure that newContext is a function that takes containers and self
        return this.add(newContext);
    }

    /**
     * Updates specific tokens from another container
     * @param other Container to update tokens from
     * @param keys Array of token keys to update
     * @returns New container with updated tokens
     * @throws Error if any specified tokens are not found in the source container
     */
    public upsertTokens<OtherContext extends {}, K extends keyof OtherContext>(
        other: Container<OtherContext>,
        ...keys: K[]
    ): Container<Prettify<Assign<Context, Pick<OtherContext, K>>>> {
        const newContext = keys.reduce(
            (acc, key) => {
                // @ts-expect-error - we are sure that newContext is a function that takes containers and self
                acc[key] = () => other.get(key);
                return acc;
            },
            {} as Pick<OtherContext, K>,
        );

        return this.upsert(newContext);
    }
}

/**
 * Creates a new container instance
 * @param parentContainer Parent container to inherit from
 * @returns New container instance
 */
export function createContainer<ParentContext extends {} = {}>(
    parentContainer?: Container<ParentContext>,
) {
    return Container.createFrom(parentContainer);
}
