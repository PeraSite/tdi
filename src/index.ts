import { Container } from './container';

export { Container } from './container';

export function createContainer<ParentContext extends {} = {}>(
    parentContainer?: Container<ParentContext>
) {
    return Container.createFrom(parentContainer);
}

