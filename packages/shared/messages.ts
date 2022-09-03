export const comparisonMessages = {
    matched: 'Screenshot matched comparison image file.',
    different(overwrote: boolean) {
        const extraMessage = overwrote ? ' Overwrote comparison file with new screenshot.' : '';
        return `Screenshot differed from comparison image file.${extraMessage}`;
    },
    missing(wrote: boolean) {
        const extraMessage = wrote ? ' Saved new screenshot to file. Run again to compare.' : '';
        return `Comparison screenshot file is missing.${extraMessage}`;
    },
} as const;
