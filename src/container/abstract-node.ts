import { UnpackFunction } from "../types";

export abstract class AbstractNode<Context extends {}> {
    public abstract get<T extends keyof Context>(
        token: T
    ): UnpackFunction<Context[T]>;

    public abstract getTokens<T extends keyof Context>(): { [M in T]: T };
}
