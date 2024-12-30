export type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export type GetContainerFormat<ProviderFunction extends (...args: any) => any> =
    UnPromisify<ReturnType<ProviderFunction>>;

export type Assign<OldContext extends object, NewContext extends object> = {
    [Token in keyof ({
        [K in keyof OldContext]: OldContext[K];
    } & {
        [K in keyof NewContext]: NewContext[K];
    })]: Token extends keyof NewContext
        ? NewContext[Token]
        : Token extends keyof OldContext
          ? OldContext[Token]
          : never;
};

export type Prettify<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export type UnpackFunction<T> = T extends (...args: any) => infer U ? U : T;
export type UnpackObject<T> = {
    [K in keyof T]: UnpackFunction<T[K]>;
};

export type UnpromisifyObject<T> = {
    [K in keyof T]: UnPromisify<T[K]>;
};

export type FullyUnpackObject<T extends {}> = UnpromisifyObject<
    UnpackObject<T>
>;

export type KeysOrCb<Context extends {}> =
    | Array<keyof Context>
    | ((t: { [K in keyof Context]: K }) => Array<keyof Context>);

export type MyRecord<O extends {}, T> = {
    [K in keyof O]: T;
};
export type ContextGetter<Context extends {}> = {
    [CK in keyof Context]: UnpackFunction<Context[CK]>;
};

export type UnpackFunctionReturn<T> = T extends (arg: T) => infer U ? U : T;
export type ContextGetterWithCache<Context extends {}> = {
    [CK in keyof Context]: UnpackFunctionReturn<Context[CK]>;
};

export type Intersection<T extends object, U extends object> = Pick<
    T,
    Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>;
