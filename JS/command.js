// =====================================================
// IMPORTS
// =====================================================

import {
    addItem,
    deleteItem
} from "./items.js";

import {
    getList
} from "./lists.js";

import {
    getCurrentListId,
    refreshCurrentList
} from "./script.js";


// =====================================================
// ELEMENTS
// =====================================================

const commandInput =
    document.getElementById(
        "listCommandInput"
    );

const runCommandBtn =
    document.getElementById(
        "listRunCommandBtn"
    );

const commandOutput =
    document.getElementById(
        "listCommandOutput"
    );


// =====================================================
// MAIN COMMAND FUNCTION
// =====================================================

function runListCommand() {

    const command =
        commandInput.value.trim();


    if (!command) {
        return;
    }


    // =================================================
    // COMMAND 1
    //
    // items(Apple,Milk,Bread)
    //
    // Adds multiple custom items
    // =================================================

    const itemsMatch =
        command.match(
            /^items\s*\((.*?)\)$/i
        );


    if (itemsMatch) {

        runItemsCommand(
            itemsMatch[1]
        );

        return;
    }


    // =================================================
    // COMMAND 2
    //
    // itemlist(ch1-ch10)
    //
    // Creates:
    //
    // ch-1
    // ch-2
    // ch-3
    // ...
    // ch-10
    // =================================================

    const itemListMatch =
        command.match(
            /^itemlist\s*\(\s*([a-zA-Z0-9 _-]*?)(\d+)\s*-\s*([a-zA-Z0-9 _-]*?)(\d+)\s*\)$/i
        );


    if (itemListMatch) {

        runItemListCommand(
            itemListMatch
        );

        return;
    }


    // =================================================
    // COMMAND 3
    //
    // itemlistdel(ch1-ch10)
    //
    // Deletes:
    //
    // ch-1
    // ch-2
    // ...
    // ch-10
    // =================================================

    const deleteMatch =
        command.match(
            /^itemlistdel\s*\(\s*([a-zA-Z0-9 _-]*?)(\d+)\s*-\s*([a-zA-Z0-9 _-]*?)(\d+)\s*\)$/i
        );


    if (deleteMatch) {

        runDeleteItemListCommand(
            deleteMatch
        );

        return;
    }


    // =================================================
    // INVALID COMMAND
    // =================================================

    showMessage(
        "Invalid command. Try: items(Apple,Milk,Bread), itemlist(ch1-ch10), or itemlistdel(ch1-ch10)"
    );

}


// =====================================================
// COMMAND 1
// ITEMS()
// =====================================================

function runItemsCommand(
    rawItems
) {

    const listId =
        getCurrentListId();


    if (!listId) {

        showMessage(
            "No list is currently open."
        );

        return;
    }


    rawItems =
        rawItems.trim();


    if (!rawItems) {

        showMessage(
            "Please enter at least one item."
        );

        return;
    }


    const itemNames =
        rawItems
            .split(",")
            .map(
                item => item.trim()
            )
            .filter(Boolean);


    if (
        itemNames.length === 0
    ) {

        showMessage(
            "No valid items found."
        );

        return;
    }


    if (
        itemNames.length > 1000
    ) {

        showMessage(
            "You can create a maximum of 1000 items at once."
        );

        return;
    }


    // =============================================
    // ADD ITEMS
    // =============================================

    itemNames.forEach(
        name => {

            addItem(
                listId,
                name
            );

        }
    );


    // =============================================
    // CLEAR
    // =============================================

    commandInput.value = "";


    // =============================================
    // REFRESH
    // =============================================

    refreshCurrentList();


    // =============================================
    // MESSAGE
    // =============================================

    showMessage(
        `${itemNames.length} item(s) added successfully.`
    );

}


// =====================================================
// COMMAND 2
// ITEMLIST()
// =====================================================

function runItemListCommand(
    match
) {

    const listId =
        getCurrentListId();


    if (!listId) {

        showMessage(
            "No list is currently open."
        );

        return;
    }


    // =============================================
    // GET PREFIX + NUMBERS
    // =============================================

    const firstPrefix =
        match[1].trim();


    const start =
        Number(
            match[2]
        );


    const secondPrefix =
        match[3].trim();


    const end =
        Number(
            match[4]
        );


    // =============================================
    // PREFIX CHECK
    // =============================================

    if (
        firstPrefix !==
        secondPrefix
    ) {

        showMessage(
            "The starting and ending names must use the same prefix."
        );

        return;
    }


    // =============================================
    // NUMBER CHECK
    // =============================================

    if (
        !Number.isInteger(start) ||
        !Number.isInteger(end)
    ) {

        showMessage(
            "Invalid numbers."
        );

        return;
    }


    // =============================================
    // RANGE CHECK
    // =============================================

    if (
        start > end
    ) {

        showMessage(
            "Starting number cannot be greater than ending number."
        );

        return;
    }


    // =============================================
    // MAXIMUM
    // =============================================

    const amount =
        end - start + 1;


    if (
        amount > 1000
    ) {

        showMessage(
            "You can create a maximum of 1000 items at once."
        );

        return;
    }


    // =============================================
    // CREATE ITEMS
    // =============================================

    for (
        let number = start;
        number <= end;
        number++
    ) {

        const itemName =
            `${firstPrefix}-${number}`;


        addItem(
            listId,
            itemName
        );

    }


    // =============================================
    // CLEAR COMMAND
    // =============================================

    commandInput.value = "";


    // =============================================
    // REFRESH LIST
    // =============================================

    refreshCurrentList();


    // =============================================
    // MESSAGE
    // =============================================

    showMessage(
        `${amount} item(s) added successfully.`
    );

}


// =====================================================
// COMMAND 3
// ITEMLISTDEL()
// =====================================================

function runDeleteItemListCommand(
    match
) {

    const listId =
        getCurrentListId();


    if (!listId) {

        showMessage(
            "No list is currently open."
        );

        return;
    }


    // =============================================
    // GET PREFIX + NUMBERS
    // =============================================

    const firstPrefix =
        match[1].trim();


    const start =
        Number(
            match[2]
        );


    const secondPrefix =
        match[3].trim();


    const end =
        Number(
            match[4]
        );


    // =============================================
    // PREFIX CHECK
    // =============================================

    if (
        firstPrefix !==
        secondPrefix
    ) {

        showMessage(
            "The starting and ending names must use the same prefix."
        );

        return;
    }


    // =============================================
    // NUMBER CHECK
    // =============================================

    if (
        !Number.isInteger(start) ||
        !Number.isInteger(end)
    ) {

        showMessage(
            "Invalid numbers."
        );

        return;
    }


    // =============================================
    // RANGE CHECK
    // =============================================

    if (
        start > end
    ) {

        showMessage(
            "Starting number cannot be greater than ending number."
        );

        return;
    }


    // =============================================
    // MAXIMUM
    // =============================================

    const amount =
        end - start + 1;


    if (
        amount > 1000
    ) {

        showMessage(
            "You can delete a maximum of 1000 items at once."
        );

        return;
    }


    // =============================================
    // GET CURRENT LIST
    // =============================================

    const list =
        getList(
            listId
        );


    if (!list) {

        showMessage(
            "Current list could not be found."
        );

        return;
    }


    // =============================================
    // DELETE MATCHING ITEMS
    // =============================================

    let deletedCount = 0;


    for (
        let number = start;
        number <= end;
        number++
    ) {

        const itemName =
            `${firstPrefix}-${number}`;


        /*
            Find the item by its text.
        */

        const item =
            list.items.find(
                currentItem =>
                    currentItem.text ===
                    itemName
            );


        /*
            If the item exists,
            delete it.
        */

        if (item) {

            deleteItem(
                listId,
                item.id
            );

            deletedCount++;

        }

    }


    // =============================================
    // CLEAR COMMAND
    // =============================================

    commandInput.value = "";


    // =============================================
    // REFRESH
    // =============================================

    refreshCurrentList();


    // =============================================
    // MESSAGE
    // =============================================

    if (
        deletedCount === 0
    ) {

        showMessage(
            "No matching items were found."
        );

    } else {

        showMessage(
            `${deletedCount} item(s) deleted successfully.`
        );

    }

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    message
) {

    if (!commandOutput) {
        return;
    }


    commandOutput.textContent =
        message;


    commandOutput.classList.add(
        "show"
    );


    clearTimeout(
        showMessage.timer
    );


    showMessage.timer =
        setTimeout(
            () => {

                commandOutput.classList.remove(
                    "show"
                );

            },
            4000
        );

}


// =====================================================
// RUN BUTTON
// =====================================================

if (
    runCommandBtn
) {

    runCommandBtn.addEventListener(
        "click",
        runListCommand
    );

}


// =====================================================
// ENTER KEY
// =====================================================

if (
    commandInput
) {

    commandInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                runListCommand();

            }

        }
    );

}