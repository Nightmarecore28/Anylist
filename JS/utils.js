export function createId() {

    return Date.now().toString(36) +
        Math.random().toString(36).substring(2);

}


export function formatDate(date) {

    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(new Date(date));

}


export function getProgress(list) {

    if (list.items.length === 0) {
        return 0;
    }

    const completed = list.items.filter(
        item => item.completed
    ).length;

    return Math.round(
        (completed / list.items.length) * 100
    );

}