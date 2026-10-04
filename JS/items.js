import { loadLists, saveLists } from "./storage.js";
import { createId } from "./utils.js";


// ========================================
// ADD ITEM
// ========================================

export function addItem(listId, text) {

    const lists = loadLists();

    const list = lists.find(
        list => list.id === listId
    );

    if (!list) {
        return;
    }


    // Make old lists compatible

    if (!Array.isArray(list.items)) {

        list.items = [];

    }


    const now = Date.now();


    const newItem = {

        id: createId(),

        text: text,

        completed: false,

        createdAt: now,

        updatedAt: now,

        // Used for custom item ordering
        order: list.items.length

    };


    list.items.push(newItem);

    list.updatedAt = now;

    saveLists(lists);

}


// ========================================
// TOGGLE ITEM
// ========================================

export function toggleItem(listId, itemId) {

    const lists = loadLists();

    const list = lists.find(
        list => list.id === listId
    );

    if (!list) {
        return;
    }


    const item = list.items.find(
        item => item.id === itemId
    );

    if (!item) {
        return;
    }


    item.completed =
        !item.completed;


    const now = Date.now();


    item.updatedAt = now;

    list.updatedAt = now;


    saveLists(lists);

}


// ========================================
// DELETE ITEM
// ========================================

export function deleteItem(listId, itemId) {

    const lists = loadLists();

    const list = lists.find(
        list => list.id === listId
    );

    if (!list) {
        return;
    }


    list.items =
        list.items.filter(
            item => item.id !== itemId
        );


    // Rebuild item order after deletion

    list.items.forEach(
        (item, index) => {

            item.order = index;

        }
    );


    list.updatedAt =
        Date.now();


    saveLists(lists);

}


// ========================================
// RENAME / EDIT ITEM
// ========================================

export function updateItem(
    listId,
    itemId,
    changes
) {

    const lists = loadLists();


    const list = lists.find(
        list => list.id === listId
    );


    if (!list) {
        return null;
    }


    const item = list.items.find(
        item => item.id === itemId
    );


    if (!item) {
        return null;
    }


    Object.assign(
        item,
        changes
    );


    const now = Date.now();


    item.updatedAt = now;

    list.updatedAt = now;


    saveLists(lists);


    return item;

}


// ========================================
// RENAME ITEM
// ========================================

export function renameItem(
    listId,
    itemId,
    newText
) {

    const text =
        String(newText).trim();


    if (!text) {

        return null;

    }


    return updateItem(

        listId,

        itemId,

        {
            text: text
        }

    );

}


// ========================================
// SAVE CUSTOM ITEM ORDER
// ========================================

export function saveItemOrder(
    listId,
    itemIds
) {

    if (!Array.isArray(itemIds)) {

        return;

    }


    const lists = loadLists();


    const list = lists.find(
        list => list.id === listId
    );


    if (!list) {

        return;

    }


    itemIds.forEach(
        (id, index) => {

            const item =
                list.items.find(
                    item => item.id === id
                );


            if (item) {

                item.order = index;

            }

        }
    );


    list.updatedAt =
        Date.now();


    saveLists(lists);

}


// ========================================
// MOVE ITEM
// ========================================

export function moveItem(
    listId,
    itemId,
    newIndex
) {

    const lists = loadLists();


    const list = lists.find(
        list => list.id === listId
    );


    if (!list) {

        return;

    }


    const currentIndex =
        list.items.findIndex(
            item => item.id === itemId
        );


    if (currentIndex === -1) {

        return;

    }


    if (
        newIndex < 0 ||
        newIndex >= list.items.length
    ) {

        return;

    }


    const [movedItem] =
        list.items.splice(
            currentIndex,
            1
        );


    list.items.splice(
        newIndex,
        0,
        movedItem
    );


    // Rebuild order

    list.items.forEach(
        (item, index) => {

            item.order = index;

        }
    );


    list.updatedAt =
        Date.now();


    saveLists(lists);

}


// ========================================
// GET ITEMS IN CUSTOM ORDER
// ========================================

export function getOrderedItems(
    listId
) {

    const lists = loadLists();


    const list = lists.find(
        list => list.id === listId
    );


    if (!list) {

        return [];

    }


    return [...list.items].sort(
        (a, b) => {

            const orderA =
                typeof a.order === "number"
                    ? a.order
                    : 0;


            const orderB =
                typeof b.order === "number"
                    ? b.order
                    : 0;


            return orderA - orderB;

        }
    );

}