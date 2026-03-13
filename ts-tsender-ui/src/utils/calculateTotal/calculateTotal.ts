export const calculateTotal = (amounts: string): number => {
    if (!amounts) return 0;

    // This regex splits by comma, newline, semicolon, or whitespace
    return amounts
        .split(/[,\n; ]+/)
        .map((val) => parseFloat(val.trim())) // Convert to numbers
        .filter((val) => !isNaN(val))         // Remove invalid entries
        .reduce((sum, current) => sum + current, 0); // Add them up
};