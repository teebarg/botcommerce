export function getFloatValue(s: string) {
    return parseFloat(parseFloat(s).toFixed(2));
}

export function compareFloats(f1: number, f2: number) {
    const diff = f1 - f2;
    if (Math.abs(diff) < 0.01) {
        return 0;
    } else if (diff < 0) {
        return -1;
    } else {
        return 1;
    }
}

export function camelCase(input: string): string {
    // Step 1: Convert the string to lowercase
    let result = input.toLowerCase();

    // Step 2: Replace non-alphanumeric characters with spaces
    result = result.replace(/[^a-zA-Z0-9]+/g, " ");

    // Step 3: Split the string into words
    const words = result.split(" ");

    // Step 4: Capitalize the first letter of each word (except the first word)
    for (let i = 1; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }

    // Step 5: Join the words back together
    return words.join("");
}
