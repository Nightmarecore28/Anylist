import { loadLists, saveLists } from "./storage.js";


export function updateListSettings(
    listId,
    name,
    background,
    rainbow,
    itemColor
) {

    const lists = loadLists();

    const list = lists.find(
        list => list.id === listId
    );

    if (!list) {
        return;
    }

    list.name = name;

    list.settings.background = background;

    list.settings.rainbow = rainbow;

    list.settings.itemColor = itemColor;

    list.updatedAt = Date.now();

    saveLists(lists);

}