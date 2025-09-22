
type FormatValues = Record<string, string | undefined>;

const templateRegex = /\$(?:\[([^\{\}]+)\])?\{(\w+)\}/g; // matches $[prefix]{key} or ${key}

export function formatSymbolInfo(lenseFormat: string, values: FormatValues) {
    return lenseFormat.replace(templateRegex, (_, prefix, key) => {
        return key in values && values[key]
            ? (prefix ?? '') + values[key]
            : '';
    });
}
