export const logEntries = [];

export function addLogEntry(entry) {
    logEntries.push(entry);
    console.log('New log entry:', entry);
}