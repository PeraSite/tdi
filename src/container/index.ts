import { Node } from './node';
import {
    Assign,
    ContextGetter,
    Intersection,
    MyRecord,
    Prettify
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

    /**
     * @deprecated Use addContainer to safely add tokens or upsertContainer to overwrite tokens instead
     */
    public merge<OtherContext extends {}>(
        other: Container<OtherContext>,
    ): Container<Prettify<Assign<Context, OtherContext>>> {
        return this.upsertContainer(other);
    }

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

    public upsertContainer<OtherContext extends {}>(
        other: Container<OtherContext>,
    ): Container<Prettify<Assign<Context, OtherContext>>> {
        return new Container({
            ...this._context,
            ...other._context,
        }) as unknown as Container<Prettify<Assign<Context, OtherContext>>>;
    }

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
        if(!keys.every(key => key in other._context)) {
            throw new Error('Tokens not found in other container');
        }

        const newContext = keys.reduce(
            (acc, key) => {
                acc[key] = other._context[key];
                return acc;
            },
            {} as Pick<OtherContext, K>,
        );

        // @ts-expect-error - we are sure that newContext is a valid context for new container
        return this.add(newContext);
    }

    public upsertTokens<
        OtherContext extends {},
        K extends keyof OtherContext,
    >(
        other: Container<OtherContext>,
        ...keys: K[]
    ): Container<Prettify<Assign<Context, Pick<OtherContext, K>>>> {
        const newContext = keys.reduce(
            (acc, key) => {
                acc[key] = other._context[key];
                return acc;
            },
            {} as Pick<OtherContext, K>,
        );

        return this.upsert(newContext) as Container<
            Prettify<Assign<Context, Pick<OtherContext, K>>>
        >;
    }
}

export function createContainer<ParentContext extends {} = {}>(
    parentContainer?: Container<ParentContext>,
) {
    return Container.createFrom(parentContainer);
}
