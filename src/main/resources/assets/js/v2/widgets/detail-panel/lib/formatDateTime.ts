function pad(n: number, width: number): string {
    return String(n).padStart(width, '0');
}

/**
 * Formats an ISO timestamp string the same way the legacy `DateTimeFormatter.createHtml`
 * does — `yyyy-MM-dd HH:mm:ss` in the user's local time. Returns `''` for falsy input.
 */
export function formatDateTime(iso: string | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return (
        `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}` +
        ` ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}`
    );
}
