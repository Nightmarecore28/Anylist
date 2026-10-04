// ========================================
// IMPORTS
// ========================================

import {
    getLists
} from "./lists.js";

import {
    saveListOrder
} from "./lists.js";

import {
    saveItemOrder
} from "./items.js";

import {
    formatDate,
    getProgress
} from "./utils.js";

import {
    getItemDate,
    formatItemDate,
    getItemDateStatus,
    setItemDate,
    clearItemDate,
    isDateLocked,
    isDatePassed
} from "./itemDates.js";


// ========================================
// RAINBOW BACKGROUND
// ========================================

const RAINBOW_BACKGROUND =
    "linear-gradient(135deg, " +
    "#ff0000 0%, " +
    "#ff8a00 16%, " +
    "#ffe600 32%, " +
    "#22c55e 48%, " +
    "#06b6d4 64%, " +
    "#3b82f6 80%, " +
    "#a855f7 100%)";


// ========================================
// RENDER ALL LISTS
// ========================================

export function renderLists(
    container,
    search = "",
    sort = "newest"
) {

    let lists = getLists();


    // ====================================
    // MAKE OLD LISTS COMPATIBLE
    // ====================================

    lists.forEach((list, index) => {

        if (!list.settings) {

            list.settings = {};

        }


        if (!list.settings.background) {

            list.settings.background =
                "#ffffff";

        }


        if (
            typeof list.settings.rainbow !==
            "boolean"
        ) {

            list.settings.rainbow =
                false;

        }


        if (!list.settings.itemColor) {

            list.settings.itemColor =
                "#ffffff";

        }


        // Old lists may not have order

        if (
            typeof list.order !==
            "number"
        ) {

            list.order = index;

        }


        // Make sure items exist

        if (!Array.isArray(list.items)) {

            list.items = [];

        }


        // Give old items an order

        list.items.forEach(
            (item, itemIndex) => {

                if (
                    typeof item.order !==
                    "number"
                ) {

                    item.order =
                        itemIndex;

                }

            }
        );

    });


    // ====================================
    // SEARCH
    // ====================================

    const searchText =
        search
            .toLowerCase()
            .trim();


    if (searchText) {

        lists =
            lists.filter(
                list =>
                    list.name
                        .toLowerCase()
                        .includes(searchText)
            );

    }


    // ====================================
    // SORT
    // ====================================

    if (sort === "newest") {

        lists.sort(
            (a, b) =>
                b.createdAt -
                a.createdAt
        );

    }


    else if (sort === "oldest") {

        lists.sort(
            (a, b) =>
                a.createdAt -
                b.createdAt
        );

    }


    else if (sort === "changed") {

        lists.sort(
            (a, b) =>
                b.updatedAt -
                a.updatedAt
        );

    }


    else if (sort === "az") {

        lists.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    else if (sort === "za") {

        lists.sort(
            (a, b) =>
                b.name.localeCompare(
                    a.name
                )
        );

    }


    // ====================================
    // CUSTOM ORDER
    // ====================================

    else if (
        sort === "custom" ||
        sort === "manual"
    ) {

        lists.sort(
            (a, b) =>
                a.order -
                b.order
        );

    }


    // ====================================
    // CLEAR CONTAINER
    // ====================================

    container.innerHTML = "";


    // ====================================
    // NO LISTS
    // ====================================

    if (lists.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    No lists found
                </h2>

                <p>
                    Create a new list
                    to get started.
                </p>

            </div>

        `;

        return;

    }


    // ====================================
    // CREATE CARDS
    // ====================================

    lists.forEach(
        list => {

            const completed =
                list.items.filter(
                    item =>
                        item.completed
                ).length;


            const total =
                list.items.length;


            const progress =
                getProgress(list);


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "list-card";


            // =================================
            // DRAG DATA
            // =================================

            card.draggable = true;

            card.dataset.id =
                list.id;


            card.setAttribute(
                "aria-label",
                `List: ${list.name}`
            );


            // =================================
            // CARD BACKGROUND
            // =================================

            if (
                list.settings.rainbow
            ) {

                card.style.background =
                    RAINBOW_BACKGROUND;

            }

            else {

                card.style.background =
                    list.settings.background ||
                    "#ffffff";

            }


            // =================================
            // CARD HTML
            // =================================

            card.innerHTML = `

                <div class="list-drag-handle"
                     title="Drag to arrange">

                    ⋮⋮

                </div>


                <h2>
                    ${escapeHTML(
                list.name
            )}
                </h2>


                <p>

                    ${completed}
                    /
                    ${total}

                    items completed

                </p>


                <p>

                    Created:
                    ${formatDate(
                list.createdAt
            )}

                </p>


                <p>

                    Last changed:
                    ${formatDate(
                list.updatedAt
            )}

                </p>


                <div
                    class="card-progress"
                >

                    <div
                        class="card-progress-fill"
                        style="
                            width:
                            ${progress}%
                        "
                    ></div>

                </div>


                <button
                    class="open-list-btn"
                    data-id="${list.id}"
                >

                    Open List

                </button>

            `;


            // =================================
            // DRAG START
            // =================================

            card.addEventListener(
                "dragstart",
                event => {

                    event.dataTransfer.effectAllowed =
                        "move";


                    event.dataTransfer.setData(
                        "text/plain",
                        list.id
                    );


                    card.classList.add(
                        "dragging"
                    );

                }
            );


            // =================================
            // DRAG END
            // =================================

            card.addEventListener(
                "dragend",
                () => {

                    card.classList.remove(
                        "dragging"
                    );

                    removeDragOverClasses(
                        container
                    );

                }
            );


            // =================================
            // DRAG OVER
            // =================================

            card.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();


                    card.classList.add(
                        "drag-over"
                    );

                }
            );


            // =================================
            // DRAG LEAVE
            // =================================

            card.addEventListener(
                "dragleave",
                () => {

                    card.classList.remove(
                        "drag-over"
                    );

                }
            );


            // =================================
            // DROP
            // =================================

            card.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    card.classList.remove(
                        "drag-over"
                    );


                    const draggedId =
                        event.dataTransfer.getData(
                            "text/plain"
                        );


                    if (
                        !draggedId ||
                        draggedId === list.id
                    ) {

                        return;

                    }


                    const currentCards =
                        Array.from(
                            container.querySelectorAll(
                                ".list-card"
                            )
                        );


                    const draggedCard =
                        currentCards.find(
                            item =>
                                item.dataset.id ===
                                draggedId
                        );


                    if (!draggedCard) {

                        return;

                    }


                    const targetCard =
                        card;


                    const rect =
                        targetCard.getBoundingClientRect();


                    const middle =
                        rect.top +
                        rect.height / 2;


                    if (
                        event.clientY <
                        middle
                    ) {

                        container.insertBefore(
                            draggedCard,
                            targetCard
                        );

                    }

                    else {

                        container.insertBefore(
                            draggedCard,
                            targetCard.nextSibling
                        );

                    }


                    // Save new order

                    saveDisplayedListOrder(
                        container
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


// ========================================
// SAVE DISPLAYED LIST ORDER
// ========================================

function saveDisplayedListOrder(
    container
) {

    const cards =
        Array.from(
            container.querySelectorAll(
                ".list-card"
            )
        );


    const ids =
        cards.map(
            card =>
                card.dataset.id
        );


    saveListOrder(ids);

}


// ========================================
// REMOVE DRAG CLASSES
// ========================================

function removeDragOverClasses(
    container
) {

    container
        .querySelectorAll(
            ".drag-over"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "drag-over"
                );

            }
        );

}


// ========================================
// RENDER OPEN LIST
// ========================================

export function renderListPage(
    list
) {

    if (!list) {

        return;

    }


    // ====================================
    // DEFAULT SETTINGS
    // ====================================

    if (!list.settings) {

        list.settings = {};

    }


    const itemColor =
        list.settings.itemColor ||
        "#ffffff";


    // ====================================
    // LIST TITLE
    // ====================================

    document.getElementById(
        "listTitle"
    ).textContent =
        list.name;


    // ====================================
    // LAST CHANGED
    // ====================================

    document.getElementById(
        "lastChanged"
    ).textContent =
        `Last changed: ${formatDate(
            list.updatedAt
        )}`;


    // ====================================
    // DATES
    // ====================================

    document.getElementById(
        "createdDate"
    ).textContent =
        formatDate(
            list.createdAt
        );


    document.getElementById(
        "updatedDate"
    ).textContent =
        formatDate(
            list.updatedAt
        );


    // ====================================
    // STATISTICS
    // ====================================

    const total =
        list.items.length;


    const completed =
        list.items.filter(
            item =>
                item.completed
        ).length;


    const remaining =
        total -
        completed;


    const progress =
        getProgress(list);


    document.getElementById(
        "totalItems"
    ).textContent =
        total;


    document.getElementById(
        "completedItems"
    ).textContent =
        completed;


    document.getElementById(
        "remainingItems"
    ).textContent =
        remaining;


    document.getElementById(
        "progressPercent"
    ).textContent =
        `${progress}%`;


    document.getElementById(
        "progressFill"
    ).style.width =
        `${progress}%`;


    // ====================================
    // RENDER ITEMS
    // ====================================

    renderItems(
        list,
        itemColor
    );

}


// ========================================
// RENDER ITEMS
// ========================================

export function renderItems(
    list,
    itemColor = "#ffffff"
) {

    const container =
        document.getElementById(
            "itemsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    // ====================================
    // MAKE OLD ITEMS COMPATIBLE
    // ====================================

    if (!Array.isArray(list.items)) {

        list.items = [];

    }


    list.items.forEach(
        (item, index) => {

            if (
                typeof item.order !==
                "number"
            ) {

                item.order =
                    index;

            }

        }
    );


    // ====================================
    // SORT ITEMS BY CUSTOM ORDER
    // ====================================

    const orderedItems =
        [...list.items].sort(
            (a, b) =>
                a.order -
                b.order
        );


    // ====================================
    // NO ITEMS
    // ====================================

    if (
        orderedItems.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-items">

                <p>
                    No items yet.
                </p>

                <p>
                    Add your first item above.
                </p>

            </div>

        `;

        return;

    }


    // ====================================
    // CREATE ITEMS
    // ====================================

    orderedItems.forEach(
        item => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "item";


            // =================================
            // DRAGGING
            // =================================

            element.draggable =
                true;


            element.dataset.id =
                item.id;


            // =================================
            // COMPLETED
            // =================================

            if (item.completed) {

                element.classList.add(
                    "completed"
                );

            }


            // =================================
            // ITEM BACKGROUND
            // =================================

            element.style.background =
                itemColor;


            // =================================
            // ITEM DATE
            // =================================

            const itemDate =
                getItemDate(
                    list.id,
                    item.id
                );


            const itemDateStatus =
                getItemDateStatus(
                    itemDate
                );


            const formattedDate =
                formatItemDate(
                    itemDate
                );


            // =================================
            // DATE LOCK
            // =================================

            const dateLocked =
                itemDate &&
                isDateLocked(
                    itemDate
                );


            const datePassed =
                itemDate &&
                isDatePassed(
                    itemDate
                );


            // =================================
            // DATE DISPLAY
            // =================================

            let dateHTML = "";


            if (itemDate) {

                dateHTML = `

                    <span
                        class="item-date-display
                        ${dateLocked ? "date-locked" : ""}
                        ${datePassed ? "date-passed" : ""}"
                        title="${
                            dateLocked
                                ? "This date has passed and is locked"
                                : "Due date"
                        }"
                    >

                        <span class="item-date-icon">
                            📅
                        </span>

                        <span class="item-date-text">
                            ${escapeHTML(
                                formattedDate
                            )}
                        </span>

                        ${
                            dateLocked
                                ? `
                                    <span
                                        class="item-date-lock"
                                        title="Date locked"
                                    >
                                        🔒
                                    </span>
                                `
                                : ""
                        }

                    </span>

                `;

            }

            else {

                dateHTML = `

                    <span
                        class="item-date-display item-no-date"
                        title="No due date"
                    >

                        <span class="item-date-icon">
                            📅
                        </span>

                    </span>

                `;

            }


            // =================================
            // ITEM HTML
            // =================================

            element.innerHTML = `

                <span
                    class="item-drag-handle"
                    title="Drag to arrange"
                >
                    ⋮⋮
                </span>


                <input
                    type="checkbox"
                    class="item-checkbox"
                    data-id="${item.id}"
                    ${item.completed ? "checked" : ""}
                >


                <span
                    class="item-text"
                    data-id="${item.id}"
                    title="Double-click to rename"
                >
                    ${escapeHTML(item.text)}
                </span>


                <div class="item-date-area">

                    ${dateHTML}

                    <button
                        type="button"
                        class="item-date-btn"
                        data-id="${item.id}"
                        title="${
                            itemDate
                                ? "Change due date"
                                : "Set due date"
                        }"
                    >
                        📅
                    </button>

                </div>


                <button
                    class="delete-item"
                    data-id="${item.id}"
                    title="Delete item"
                >
                    ×
                </button>

            `;


            // =================================
            // LOCK CLASS
            // =================================

            if (dateLocked) {

                element.classList.add(
                    "date-locked-item"
                );

            }


            // =================================
            // DRAG START
            // =================================

            element.addEventListener(
                "dragstart",
                event => {

                    event.dataTransfer.effectAllowed =
                        "move";


                    event.dataTransfer.setData(
                        "text/plain",
                        item.id
                    );


                    element.classList.add(
                        "dragging"
                    );

                }
            );


            // =================================
            // DRAG END
            // =================================

            element.addEventListener(
                "dragend",
                () => {

                    element.classList.remove(
                        "dragging"
                    );


                    removeDragOverClasses(
                        container
                    );

                }
            );


            // =================================
            // DRAG OVER
            // =================================

            element.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();


                    element.classList.add(
                        "drag-over"
                    );

                }
            );


            // =================================
            // DRAG LEAVE
            // =================================

            element.addEventListener(
                "dragleave",
                () => {

                    element.classList.remove(
                        "drag-over"
                    );

                }
            );


            // =================================
            // DROP
            // =================================

            element.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    element.classList.remove(
                        "drag-over"
                    );


                    const draggedId =
                        event.dataTransfer.getData(
                            "text/plain"
                        );


                    if (
                        !draggedId ||
                        draggedId === item.id
                    ) {

                        return;

                    }


                    const elements =
                        Array.from(
                            container.querySelectorAll(
                                ".item"
                            )
                        );


                    const draggedElement =
                        elements.find(
                            el =>
                                el.dataset.id ===
                                draggedId
                        );


                    if (!draggedElement) {

                        return;

                    }


                    const rect =
                        element.getBoundingClientRect();


                    const middle =
                        rect.top +
                        rect.height / 2;


                    if (
                        event.clientY <
                        middle
                    ) {

                        container.insertBefore(
                            draggedElement,
                            element
                        );

                    }

                    else {

                        container.insertBefore(
                            draggedElement,
                            element.nextSibling
                        );

                    }


                    // Save item order

                    saveDisplayedItemOrder(
                        list.id,
                        container
                    );

                }
            );


            // =================================
            // DOUBLE CLICK TO RENAME
            // =================================

            const textElement =
                element.querySelector(
                    ".item-text"
                );


            textElement.addEventListener(
                "dblclick",
                () => {

                    startItemRename(
                        list.id,
                        item,
                        textElement
                    );

                }
            );


            // =================================
            // ITEM DATE BUTTON
            // =================================

            const dateButton =
                element.querySelector(
                    ".item-date-btn"
                );


            if (dateButton) {

                dateButton.addEventListener(
                    "click",
                    () => {

                        const currentDate =
                            getItemDate(
                                list.id,
                                item.id
                            );


                        // =================================
                        // CREATE DATE INPUT
                        // =================================

                        const dateInput =
                            document.createElement(
                                "input"
                            );


                        dateInput.type =
                            "date";


                        dateInput.className =
                            "item-date-picker";


                        // Existing date

                        if (currentDate) {

                            dateInput.value =
                                currentDate;

                        }


                        // =================================
                        // POSITION
                        // =================================

                        dateInput.style.position =
                            "fixed";


                        dateInput.style.zIndex =
                            "99999";


                        dateInput.style.opacity =
                            "0.01";


                        const rect =
                            dateButton.getBoundingClientRect();


                        dateInput.style.left =
                            `${rect.left}px`;


                        dateInput.style.top =
                            `${rect.top}px`;


                        dateInput.style.width =
                            `${rect.width}px`;


                        dateInput.style.height =
                            `${rect.height}px`;


                        document.body.appendChild(
                            dateInput
                        );


                        // =================================
                        // OPEN DATE PICKER
                        // =================================

                        dateInput.focus();


                        if (
                            typeof dateInput.showPicker ===
                            "function"
                        ) {

                            try {

                                dateInput.showPicker();

                            }

                            catch (error) {

                                // Browser may already
                                // have opened picker.

                            }

                        }


                        // =================================
                        // DATE CHANGED
                        // =================================

                        dateInput.addEventListener(
                            "change",
                            () => {

                                if (!dateInput.value) {

                                    return;

                                }


                                setItemDate(
                                    list.id,
                                    item.id,
                                    dateInput.value
                                );


                                renderItems(
                                    list,
                                    itemColor
                                );

                            }
                        );


                        // =================================
                        // CLEANUP
                        // =================================

                        function cleanup() {

                            if (
                                dateInput.parentNode
                            ) {

                                dateInput.remove();

                            }

                        }


                        dateInput.addEventListener(
                            "blur",
                            () => {

                                setTimeout(
                                    cleanup,
                                    150
                                );

                            }
                        );

                    }
                );

            }


            // =================================
            // APPEND ITEM
            // =================================

            container.appendChild(
                element
            );

        }
    );

}


// ========================================
// SAVE DISPLAYED ITEM ORDER
// ========================================

function saveDisplayedItemOrder(
    listId,
    container
) {

    const elements =
        Array.from(
            container.querySelectorAll(
                ".item"
            )
        );


    const ids =
        elements.map(
            element =>
                element.dataset.id
        );


    saveItemOrder(
        listId,
        ids
    );

}


// ========================================
// RENAME ITEM
// ========================================

function startItemRename(
    listId,
    item,
    textElement
) {

    const oldText =
        item.text;


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.className =
        "item-rename-input";


    input.value =
        oldText;


    textElement.replaceWith(
        input
    );


    input.focus();


    input.select();


    let finished =
        false;


    function finishRename(
        save
    ) {

        if (finished) {

            return;

        }


        finished = true;


        const newText =
            input.value.trim();


        if (
            save &&
            newText &&
            newText !== oldText
        ) {

            // Dispatch custom event.

            document.dispatchEvent(
                new CustomEvent(
                    "anylist:item-rename",
                    {
                        detail: {

                            listId:
                                listId,

                            itemId:
                                item.id,

                            text:
                                newText

                        }
                    }
                )
            );

        }


        const newSpan =
            document.createElement(
                "span"
            );


        newSpan.className =
            "item-text";


        newSpan.dataset.id =
            item.id;


        newSpan.title =
            "Double-click to rename";


        newSpan.textContent =
            save &&
                newText
                ? newText
                : oldText;


        input.replaceWith(
            newSpan
        );


        newSpan.addEventListener(
            "dblclick",
            () => {

                startItemRename(
                    listId,
                    item,
                    newSpan
                );

            }
        );

    }


    // =================================
    // RENAME ENTER / ESCAPE
    // =================================

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                finishRename(
                    true
                );

            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                finishRename(
                    false
                );

            }

        }
    );


    // =================================
    // RENAME BLUR
    // =================================

    input.addEventListener(
        "blur",
        () => {

            finishRename(
                true
            );

        }
    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}