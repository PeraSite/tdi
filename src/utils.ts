export function intersectionKeys(
    needle: { [key: string]: any },
    haystack: { [key: string]: any }
) {
    const haystackKeys = Object.keys(haystack);
    const duplicates = haystackKeys.filter(x => x in needle);
    if (duplicates.length === 0) {
        return undefined;
    }
    return duplicates.join("', '");
}

export function addGetter(object: any, key: PropertyKey, fn: any) {
    Object.defineProperty(object, key, {
        get() {
            return fn();
        },
        enumerable: true,
    });
}
