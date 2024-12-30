import { Node } from './node';
import {
    Assign,
    ContextGetter,
    FullyUnpackObject,
    Intersection,
    KeysOrCb,
    MyRecord,
    Prettify,
} from '@/types';
import { intersectionKeys } from '@/utils';

export class Container<Context extends {}> extends Node<Context> {
    static create<Context extends {}>(context?: Context) {
        return new Container(context);
    }

    static createFrom<Context extends {}>(container?: Container<Context>) {
        return new Container(container?._context);
    }

    constructor(_context?: Context) {
        super(_context);
    }

    // SAVE: NewContext extends {! [T in keyof NewContext]: NewContext[T] }
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

    public add<
        // This "magic" type gives user an Error in an IDE with a helpful message
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

        // Step 1: Runtime check for existing tokens in context
        const duplicates = intersectionKeys(newContext, this.getTokens());
        if (duplicates)
            throw new Error(`Tokens already exist: ['${duplicates}']`);

        // Step 2: If everything is fine add a newContext
        return this.upsert(newContextOrCb);
    }

    public merge<OtherContext extends {}>(
        other: Container<OtherContext>,
    ): Container<Prettify<Assign<Context, OtherContext>>> {
        const mergedContext = {
            ...this._context,
            ...other._context,
        } as unknown as Prettify<Assign<Context, OtherContext>>;

        return new Container(mergedContext);
    }

    // this can be optimized
    public async getContainerSet<T extends keyof Context>(
        tokensOrCb: KeysOrCb<Context>,
    ) {
        const tokens: T[] = this._extractTokens(tokensOrCb);
        const promiseTokens: T[] = [];
        const allPromises: any = [];
        for (const token of tokens) {
            if (this.items[token] instanceof Promise) {
                promiseTokens.push(token);
                allPromises.push(this.items[token]);
            }
        }

        const containerDecoratedMap: {
            [K in T]: FullyUnpackObject<Context>[K];
        } = {} as any;

        // Step 1: Assign all values
        tokens.forEach((token) => {
            // @ts-expect-error - we are sure that token is a key of Context
            containerDecoratedMap[token as any] = this.items[token];
        });

        // Step 2: Overwrite Promise like values with promise results
        const rez = await Promise.all(allPromises);
        promiseTokens.forEach((token, index) => {
            containerDecoratedMap[token] = rez[index];
        });

        return containerDecoratedMap;
    }

    private _extractTokens<T extends keyof Context>(
        tokensOrCb: KeysOrCb<Context>,
    ): T[] {
        if (typeof tokensOrCb === 'function') {
            return tokensOrCb(this.getTokens()) as any;
        } else {
            return tokensOrCb as any;
        }
    }
}

export function createContainer<ParentContext extends {} = {}>(
    parentContainer?: Container<ParentContext>,
) {
    return Container.createFrom(parentContainer);
}
