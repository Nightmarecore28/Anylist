import {
    getLists,
    deleteList
} from "./lists.js";

import {
    renderHome
} from "./script.js";


// =====================================================
// ELEMENTS
// =====================================================

const commandInput =
    document.getElementById("homeCommandInput");

const runCommandBtn =
    document.getElementById("homeRunCommandBtn");

const commandOutput =
    document.getElementById("homeCommandOutput");


// =====================================================
// RUN HOME COMMAND
// =====================================================

function runHomeCommand() {

    const command =
        commandInput.value.trim();

    if (!command) {
        return;
    }


    // =================================================
    // DELETE ONE LIST
    //
    // del(list-MyList)
    // =================================================

    const singleMatch =
        command.match(
            /^del\s*\(\s*list-(.*?)\s*\)$/i
        );


    if (singleMatch) {

        const listName =
            singleMatch[1].trim();

        if (!listName) {

            showMessage(
                "Please enter a list name."
            );

            return;
        }


        const lists =
            getLists();


        const list =
            lists.find(
                item =>
                    item.name.toLowerCase() ===
                    listName.toLowerCase()
            );


        if (!list) {

            showMessage(
                `List "${listName}" was not found.`
            );

            return;
        }


        const confirmed =
            confirm(
                `Delete "${list.name}"?\n\n` +
                "This will permanently delete the list and all its items."
            );


        if (!confirmed) {

            showMessage(
                "Delete cancelled."
            );

            return;
        }


        deleteList(list.id);

        commandInput.value = "";

        renderHome();

        showMessage(
            `List "${list.name}" deleted successfully.`
        );

        return;
    }


    // =================================================
    // DELETE MULTIPLE LISTS BY NUMBERS
    //
    // del(lists-12,32,22,123)
    //
    // The numbers refer to list positions
    // in the current list storage.
    // =================================================

    const multipleMatch =
        command.match(
            /^del\s*\(\s*lists-([0-9,\s]+)\s*\)$/i
        );


    if (multipleMatch) {

        const numbers =
            multipleMatch[1]
                .split(",")
                .map(number =>
                    Number(number.trim())
                )
                .filter(number =>
                    Number.isInteger(number) &&
                    number > 0
                );


        if (numbers.length === 0) {

            showMessage(
                "No valid list numbers were entered."
            );

            return;
        }


        const lists =
            getLists();


        const uniqueNumbers =
            [...new Set(numbers)];


        const selectedLists =
            uniqueNumbers
                .map(number =>
                    lists[number - 1]
                )
                .filter(Boolean);


        if (selectedLists.length === 0) {

            showMessage(
                "No matching lists were found."
            );

            return;
        }


        const names =
            selectedLists
                .map(list => list.name)
                .join(", ");


        const confirmed =
            confirm(
                `Delete these lists?\n\n${names}\n\n` +
                "All items inside them will also be deleted."
            );


        if (!confirmed) {

            showMessage(
                "Delete cancelled."
            );

            return;
        }


        selectedLists.forEach(list => {

            deleteList(list.id);

        });


        commandInput.value = "";

        renderHome();


        showMessage(
            `${selectedLists.length} list(s) deleted successfully.`
        );

        return;
    }


    // =================================================
    // INVALID COMMAND
    // =================================================

    showMessage(
        "Invalid command. Use: del(list-Name) or del(lists-1,2,3)"
    );
}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message) {

    commandOutput.textContent =
        message;

    commandOutput.classList.add("show");

    clearTimeout(
        showMessage.timer
    );

    showMessage.timer =
        setTimeout(() => {

            commandOutput.classList.remove("show");

        }, 4000);
}


// =====================================================
// BUTTON
// =====================================================

if (runCommandBtn) {

    runCommandBtn.addEventListener(
        "click",
        runHomeCommand
    );
}


// =====================================================
// ENTER
// =====================================================

if (commandInput) {

    commandInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                runHomeCommand();
            }
        }
    );
}