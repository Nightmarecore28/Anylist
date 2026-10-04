import { loadLists, saveLists } from "./storage.js";
import { createId } from "./utils.js";


// ========================================
// GET ALL LISTS
// ========================================

export function getLists() {

    return loadLists();

}


// ========================================
// CREATE LIST
// ========================================

export function createList(name) {

    const lists = loadLists();

    const now = Date.now();

    const newList = {

        id: createId(),

        name: name,

        createdAt: now,

        updatedAt: now,

        // Used when the user manually
        // arranges lists.
        order: lists.length,

        settings: {

            background: "#ffffff",

            rainbow: false,

            itemColor: "#ffffff"

        },

        items: []

    };


    lists.push(newList);

    saveLists(lists);

    return newList;

}


// ========================================
// CREATE MULTIPLE LISTS
// ========================================

export function createMultipleLists(names) {

    if (!Array.isArray(names)) {

        return [];

    }


    const createdLists = [];

    const lists = loadLists();

    let nextOrder = lists.length;


    names.forEach(name => {

        const cleanName =
            String(name).trim();


        if (!cleanName) {

            return;

        }


        const now = Date.now();


        const newList = {

            id: createId(),

            name: cleanName,

            createdAt: now,

            updatedAt: now,

            order: nextOrder++,

            settings: {

                background: "#ffffff",

                rainbow: false,

                itemColor: "#ffffff"

            },

            items: []

        };


        lists.push(newList);

        createdLists.push(newList);

    });


    if (createdLists.length > 0) {

        saveLists(lists);

    }


    return createdLists;

}


// ========================================
// GET ONE LIST
// ========================================

export function getList(id) {

    const lists = loadLists();


    return lists.find(
        list => list.id === id
    );

}


// ========================================
// UPDATE LIST
// ========================================

export function updateList(id, changes) {

    const lists = loadLists();


    const list = lists.find(
        list => list.id === id
    );


    if (!list) {

        return null;

    }


    Object.assign(
        list,
        changes
    );


    list.updatedAt =
        Date.now();


    saveLists(lists);


    return list;

}


// ========================================
// RENAME LIST
// ========================================

export function renameList(id, newName) {

    const cleanName =
        String(newName).trim();


    if (!cleanName) {

        return null;

    }


    return updateList(
        id,
        {
            name: cleanName
        }
    );

}


// ========================================
// DELETE LIST
// ========================================

export function deleteList(id) {

    let lists = loadLists();


    lists = lists.filter(
        list => list.id !== id
    );


    // Rebuild order after deletion.

    lists.forEach(
        (list, index) => {

            list.order = index;

        }
    );


    saveLists(lists);

}


// ========================================
// SAVE CUSTOM LIST ORDER
// ========================================

export function saveListOrder(ids) {

    if (!Array.isArray(ids)) {

        return;

    }


    const lists = loadLists();


    ids.forEach(
        (id, index) => {

            const list =
                lists.find(
                    item => item.id === id
                );


            if (list) {

                list.order = index;

            }

        }
    );


    saveLists(lists);

}


// ========================================
// MOVE LIST
// ========================================

export function moveList(id, newIndex) {

    const lists = loadLists();


    const currentIndex =
        lists.findIndex(
            list => list.id === id
        );


    if (currentIndex === -1) {

        return;

    }


    if (
        newIndex < 0 ||
        newIndex >= lists.length
    ) {

        return;

    }


    const [movedList] =
        lists.splice(
            currentIndex,
            1
        );


    lists.splice(
        newIndex,
        0,
        movedList
    );


    lists.forEach(
        (list, index) => {

            list.order = index;

        }
    );


    saveLists(lists);

}


// ========================================
// UPDATE LAST CHANGED TIME
// ========================================

export function touchList(id) {

    updateList(
        id,
        {}
    );

}