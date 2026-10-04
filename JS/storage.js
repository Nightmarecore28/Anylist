const STORAGE_KEY = "listManagerData";

export function loadLists() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Could not load lists:", error);
        return [];
    }
}


export function saveLists(lists) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lists)
    );

}