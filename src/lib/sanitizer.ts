export const removeNonPrintableChars = (s: string) => s.replace(/[\x00-\x1F\x7F]/g, " ")
