// =====================================================
// CADE LIST / HOME COMMAND SYSTEM
// =====================================================

import {
    createMultipleLists
} from "./lists.js";

import {
    renderHome
} from "./script.js";


// =====================================================
// ELEMENTS
// =====================================================

const commandInput =
    document.getElementById(
        "homeCommandInput"
    );

const runCommandBtn =
    document.getElementById(
        "homeRunCommandBtn"
    );

const commandOutput =
    document.getElementById(
        "homeCommandOutput"
    );


// =====================================================
// RUN HOME COMMAND
// =====================================================

function runCommand() {

    const command =
        commandInput.value.trim();


    if (!command) {
        return;
    }


    // =================================================
    // LIST COMMAND
    //
    // list(ch1-ch10)
    //
    // Creates:
    //
    // ch-1
    // ch-2
    // ch-3
    // ...
    // ch-10
    // =================================================

    const match =
        command.match(
            /^list\s*\(\s*([a-zA-Z0-9 _-]*?)(\d+)\s*-\s*([a-zA-Z0-9 _-]*?)(\d+)\s*\)$/i
        );


    if (!match) {

        showMessage(
            "Invalid command. Try: list(ch1-ch10)"
        );

        return;
    }


    // =================================================
    // PREFIX
    // =================================================

    const firstPrefix =
        match[1].trim();


    const start =
        Number(match[2]);


    const secondPrefix =
        match[3].trim();


    const end =
        Number(match[4]);


    // =================================================
    // PREFIX CHECK
    // =================================================

    if (
        firstPrefix !==
        secondPrefix
    ) {

        showMessage(
            "The starting and ending names must use the same prefix."
        );

        return;
    }


    // =================================================
    // NUMBER CHECK
    // =================================================

    if (
        !Number.isInteger(start) ||
        !Number.isInteger(end)
    ) {

        showMessage(
            "Invalid numbers."
        );

        return;
    }


    // =================================================
    // RANGE CHECK
    // =================================================

    if (start > end) {

        showMessage(
            "Starting number cannot be greater than ending number."
        );

        return;
    }


    // =================================================
    // MAXIMUM
    // =================================================

    const amount =
        end - start + 1;


    if (amount > 1000) {

        showMessage(
            "You can create a maximum of 1000 lists at once."
        );

        return;
    }


    // =================================================
    // CREATE NAMES
    // =================================================

    const names = [];


    for (
        let number = start;
        number <= end;
        number++
    ) {

        names.push(
            `${firstPrefix}-${number}`
        );

    }


    // =================================================
    // CREATE LISTS
    // =================================================

    const created =
        createMultipleLists(
            names
        );


    // =================================================
    // REFRESH HOME
    // =================================================

    renderHome();


    // =================================================
    // CLEAR COMMAND
    // =================================================

    commandInput.value = "";


    // =================================================
    // MESSAGE
    // =================================================

    showMessage(
        `${created.length} list(s) created successfully.`
    );

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message) {

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

if (runCommandBtn) {

    runCommandBtn.addEventListener(
        "click",
        runCommand
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

                runCommand();

            }

        }
    );

}


// =====================================================
// COMMAND HELP TOGGLE
// =====================================================

const commandHelpToggle =
    document.getElementById(
        "commandHelpToggle"
    );


const commandHelpPanel =
    document.getElementById(
        "commandHelpPanel"
    );


if (
    commandHelpToggle &&
    commandHelpPanel
) {

    commandHelpToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                !commandHelpPanel.classList.contains(
                    "hidden"
                );


            if (isOpen) {

                // CLOSE

                commandHelpPanel.classList.add(
                    "hidden"
                );

                commandHelpToggle.classList.remove(
                    "open"
                );

                commandHelpToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            } else {

                // OPEN

                commandHelpPanel.classList.remove(
                    "hidden"
                );

                commandHelpToggle.classList.add(
                    "open"
                );

                commandHelpToggle.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        }
    );

}