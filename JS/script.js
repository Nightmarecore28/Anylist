// =====================================================
// IMPORTS
// =====================================================

import {
    createList,
    getList,
    getLists,
    deleteList
} from "./lists.js";


import {
    addItem,
    toggleItem,
    deleteItem
} from "./items.js";


import {
    updateListSettings
} from "./settings.js";


import {
    renderLists,
    renderListPage
} from "./ui.js";


import {
    getAppSettings,
    saveAppSettings,
    resetAppSettings
} from "./appSettings.js";


import {
    getItemDate,
    formatItemDate
} from "./itemDates.js";



// =====================================================
// ELEMENTS
// =====================================================

const homePage =
    document.getElementById(
        "homePage"
    );


const listPage =
    document.getElementById(
        "listPage"
    );


const listsContainer =
    document.getElementById(
        "listsContainer"
    );


const createModal =
    document.getElementById(
        "createModal"
    );


const settingsModal =
    document.getElementById(
        "settingsModal"
    );


const appSettingsModal =
    document.getElementById(
        "appSettingsModal"
    );



// =====================================================
// NOTIFICATION ELEMENTS
// =====================================================

const notificationsBtn =
    document.getElementById(
        "notificationsBtn"
    );


const notificationsModal =
    document.getElementById(
        "notificationsModal"
    );


const closeNotificationsBtn =
    document.getElementById(
        "closeNotificationsBtn"
    );


const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );


const notificationList =
    document.getElementById(
        "notificationList"
    );


const notificationOverdueCount =
    document.getElementById(
        "notificationOverdueCount"
    );


const notificationTodayCount =
    document.getElementById(
        "notificationTodayCount"
    );


const notificationSoonCount =
    document.getElementById(
        "notificationSoonCount"
    );



// =====================================================
// CURRENT LIST
// =====================================================

let currentListId =
    null;



// =====================================================
// RAINBOW
// =====================================================

const RAINBOW_GRADIENT = `
linear-gradient(
    120deg,
    #ff0000 0%,
    #ff7300 14%,
    #ffd000 28%,
    #22c55e 42%,
    #06b6d4 56%,
    #2563eb 70%,
    #172554 80%,
    #4c1d95 90%,
    #7e22ce 100%
)
`;



// =====================================================
// APP BACKGROUND
// =====================================================

function applyAppBackground() {

    const settings =
        getAppSettings();


    document.body.style.animation =
        "none";


    if (settings.rainbow) {

        document.body.style.background =
            RAINBOW_GRADIENT;


        document.body.style.backgroundSize =
            "500% 500%";


        document.body.style.backgroundAttachment =
            "fixed";


        document.body.style.backgroundPosition =
            "0% 50%";


        document.body.style.backgroundRepeat =
            "no-repeat";


        document.body.style.animation =
            "anyListRainbow 18s ease infinite";


        return;

    }


    document.body.style.backgroundColor =
        settings.backgroundColor;


    if (settings.backgroundImage) {

        document.body.style.backgroundImage =
            `url("${settings.backgroundImage}")`;


        document.body.style.backgroundSize =
            "cover";


        document.body.style.backgroundPosition =
            "center";


        document.body.style.backgroundRepeat =
            "no-repeat";


        document.body.style.backgroundAttachment =
            "fixed";

    }

    else {

        document.body.style.backgroundImage =
            "none";

    }

}



// =====================================================
// LIST BACKGROUND
// =====================================================

function applyListAppearance(
    list
) {

    if (!list) {

        return;

    }


    if (!list.settings) {

        list.settings = {};

    }


    const background =
        list.settings.background ||
        "#ffffff";


    listPage.style.animation =
        "none";


    if (
        list.settings.rainbow ===
        true
    ) {

        listPage.style.background =
            RAINBOW_GRADIENT;


        listPage.style.backgroundSize =
            "500% 500%";


        listPage.style.backgroundPosition =
            "0% 50%";


        listPage.style.animation =
            "anyListRainbow 18s ease infinite";

    }

    else {

        listPage.style.background =
            background;

    }

}



// =====================================================
// HOME
// =====================================================

function showHome() {

    homePage.classList.remove(
        "hidden"
    );


    listPage.classList.add(
        "hidden"
    );


    currentListId =
        null;


    window.anyListCurrentListId =
        null;


    applyAppBackground();


    renderHome();


    updateNotifications();

}



// =====================================================
// RENDER HOME
// =====================================================

export function renderHome() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    renderLists(

        listsContainer,

        searchInput
            ? searchInput.value
            : "",

        sortSelect
            ? sortSelect.value
            : "newest"

    );

}



// =====================================================
// OPEN LIST
// =====================================================

function openList(
    id
) {

    const list =
        getList(id);


    if (!list) {

        return;

    }


    currentListId =
        id;


    window.anyListCurrentListId =
        id;


    homePage.classList.add(
        "hidden"
    );


    listPage.classList.remove(
        "hidden"
    );


    applyListAppearance(
        list
    );


    renderListPage(
        list
    );


    document.dispatchEvent(
        new CustomEvent(
            "anylist:list-opened",
            {
                detail: {
                    listId:
                        id
                }
            }
        )
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



// =====================================================
// CREATE LIST BUTTON
// =====================================================

document.getElementById(
    "createListBtn"
).addEventListener(
    "click",
    () => {

        createModal.classList.remove(
            "hidden"
        );


        const input =
            document.getElementById(
                "newListName"
            );


        input.value =
            "";


        input.focus();

    }
);



// =====================================================
// CANCEL CREATE
// =====================================================

document.getElementById(
    "cancelCreateBtn"
).addEventListener(
    "click",
    () => {

        createModal.classList.add(
            "hidden"
        );

    }
);



// =====================================================
// CREATE LIST
// =====================================================

document.getElementById(
    "confirmCreateBtn"
).addEventListener(
    "click",
    () => {

        const input =
            document.getElementById(
                "newListName"
            );


        const name =
            input.value.trim();


        if (!name) {

            alert(
                "Please enter a list name."
            );


            input.focus();


            return;

        }


        createList(
            name
        );


        createModal.classList.add(
            "hidden"
        );


        renderHome();


        updateNotifications();

    }
);



// =====================================================
// CREATE WITH ENTER
// =====================================================

document.getElementById(
    "newListName"
).addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            document.getElementById(
                "confirmCreateBtn"
            ).click();

        }


        if (
            event.key ===
            "Escape"
        ) {

            createModal.classList.add(
                "hidden"
            );

        }

    }
);



// =====================================================
// OPEN LIST FROM HOME
// =====================================================

listsContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".open-list-btn"
            );


        if (!button) {

            return;

        }


        openList(
            button.dataset.id
        );

    }
);



// =====================================================
// SEARCH
// =====================================================

document.getElementById(
    "searchInput"
).addEventListener(
    "input",
    renderHome
);



// =====================================================
// SORT
// =====================================================

document.getElementById(
    "sortSelect"
).addEventListener(
    "change",
    renderHome
);



// =====================================================
// BACK
// =====================================================

document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    showHome
);



// =====================================================
// ADD ITEM
// =====================================================

function addCurrentItem() {

    const input =
        document.getElementById(
            "itemInput"
        );


    const text =
        input.value.trim();


    if (!text) {

        input.focus();

        return;

    }


    if (!currentListId) {

        return;

    }


    addItem(
        currentListId,
        text
    );


    input.value =
        "";


    refreshCurrentList();


    updateNotifications();


    input.focus();

}



// =====================================================
// ADD ITEM BUTTON
// =====================================================

document.getElementById(
    "addItemBtn"
).addEventListener(
    "click",
    addCurrentItem
);



// =====================================================
// ADD ITEM ENTER
// =====================================================

document.getElementById(
    "itemInput"
).addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            addCurrentItem();

        }

    }
);



// =====================================================
// ITEM ACTIONS
// =====================================================

document.getElementById(
    "itemsContainer"
).addEventListener(
    "click",
    event => {

        const checkbox =
            event.target.closest(
                ".item-checkbox"
            );


        const deleteButton =
            event.target.closest(
                ".delete-item"
            );


        if (checkbox) {

            toggleItem(
                currentListId,
                checkbox.dataset.id
            );


            refreshCurrentList();


            updateNotifications();


            return;

        }


        if (deleteButton) {

            deleteItem(
                currentListId,
                deleteButton.dataset.id
            );


            refreshCurrentList();


            updateNotifications();

        }

    }
);



// =====================================================
// LIST SETTINGS OPEN
// =====================================================

document.getElementById(
    "listSettingsBtn"
).addEventListener(
    "click",
    () => {

        const list =
            getList(
                currentListId
            );


        if (!list) {

            return;

        }


        if (!list.settings) {

            list.settings = {};

        }


        document.getElementById(
            "settingsListName"
        ).value =
            list.name ||
            "";


        document.getElementById(
            "backgroundColor"
        ).value =
            list.settings.background ||
            "#ffffff";


        document.getElementById(
            "rainbowBackground"
        ).checked =
            list.settings.rainbow ===
            true;


        document.getElementById(
            "itemColor"
        ).value =
            list.settings.itemColor ||
            "#ffffff";


        settingsModal.classList.remove(
            "hidden"
        );

    }
);



// =====================================================
// CLOSE LIST SETTINGS
// =====================================================

document.getElementById(
    "closeSettingsBtn"
).addEventListener(
    "click",
    () => {

        settingsModal.classList.add(
            "hidden"
        );

    }
);



// =====================================================
// SAVE LIST SETTINGS
// =====================================================

document.getElementById(
    "saveSettingsBtn"
).addEventListener(
    "click",
    () => {

        const name =
            document.getElementById(
                "settingsListName"
            ).value.trim();


        const background =
            document.getElementById(
                "backgroundColor"
            ).value;


        const rainbow =
            document.getElementById(
                "rainbowBackground"
            ).checked;


        const itemColor =
            document.getElementById(
                "itemColor"
            ).value;


        if (!name) {

            alert(
                "List name cannot be empty."
            );


            return;

        }


        updateListSettings(

            currentListId,

            name,

            background,

            rainbow,

            itemColor

        );


        settingsModal.classList.add(
            "hidden"
        );


        refreshCurrentList();


        updateNotifications();

    }
);



// =====================================================
// DELETE CURRENT LIST
// =====================================================

document.getElementById(
    "deleteListBtn"
).addEventListener(
    "click",
    () => {

        const list =
            getList(
                currentListId
            );


        if (!list) {

            return;

        }


        const confirmed =
            confirm(
                `Delete "${list.name}"?\n\n` +
                "This will permanently delete " +
                "the list and all items."
            );


        if (!confirmed) {

            return;

        }


        deleteList(
            currentListId
        );


        settingsModal.classList.add(
            "hidden"
        );


        showHome();


        updateNotifications();

    }
);



// =====================================================
// APP SETTINGS OPEN
// =====================================================

document.getElementById(
    "appSettingsBtn"
).addEventListener(
    "click",
    () => {

        const settings =
            getAppSettings();


        document.getElementById(
            "appBackgroundColor"
        ).value =
            settings.backgroundColor;


        document.getElementById(
            "appRainbowBackground"
        ).checked =
            settings.rainbow;


        document.getElementById(
            "appBackgroundImage"
        ).value =
            "";


        appSettingsModal.classList.remove(
            "hidden"
        );

    }
);



// =====================================================
// CLOSE APP SETTINGS
// =====================================================

document.getElementById(
    "closeAppSettingsBtn"
).addEventListener(
    "click",
    () => {

        appSettingsModal.classList.add(
            "hidden"
        );

    }
);



// =====================================================
// SAVE APP SETTINGS
// =====================================================

document.getElementById(
    "saveAppSettingsBtn"
).addEventListener(
    "click",
    () => {

        const color =
            document.getElementById(
                "appBackgroundColor"
            ).value;


        const rainbow =
            document.getElementById(
                "appRainbowBackground"
            ).checked;


        const file =
            document.getElementById(
                "appBackgroundImage"
            ).files[0];


        const current =
            getAppSettings();


        if (file) {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    saveAppSettings({

                        backgroundColor:
                            color,

                        backgroundImage:
                            reader.result,

                        rainbow:
                            rainbow

                    });


                    applyAppBackground();


                    appSettingsModal.classList.add(
                        "hidden"
                    );

                };


            reader.readAsDataURL(
                file
            );

        }

        else {

            saveAppSettings({

                backgroundColor:
                    color,

                backgroundImage:
                    current.backgroundImage,

                rainbow:
                    rainbow

            });


            applyAppBackground();


            appSettingsModal.classList.add(
                "hidden"
            );

        }

    }
);



// =====================================================
// RESET APP BACKGROUND
// =====================================================

document.getElementById(
    "resetAppBackgroundBtn"
).addEventListener(
    "click",
    () => {

        resetAppSettings();


        applyAppBackground();


        appSettingsModal.classList.add(
            "hidden"
        );

    }
);



// =====================================================
// NOTIFICATIONS
// =====================================================



// -----------------------------------------------------
// GET TODAY AS YYYY-MM-DD
// -----------------------------------------------------

function getTodayString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}



// -----------------------------------------------------
// ADD DAYS TO DATE
// -----------------------------------------------------

function addDays(
    dateString,
    days
) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    date.setDate(
        date.getDate() + days
    );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}



// -----------------------------------------------------
// ESCAPE HTML
// -----------------------------------------------------

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



// -----------------------------------------------------
// GET NOTIFICATION DATA
// -----------------------------------------------------

function getNotificationData() {

    const lists =
        getLists();


    const today =
        getTodayString();


    const soonDate =
        addDays(
            today,
            7
        );


    const data = {

        overdue: [],

        today: [],

        soon: []

    };


    lists.forEach(
        list => {

            if (
                !Array.isArray(
                    list.items
                )
            ) {

                return;

            }


            list.items.forEach(
                item => {

                    // =================================
                    // COMPLETED ITEMS ARE COMPLETELY
                    // IGNORED BY NOTIFICATIONS
                    // =================================

                    if (
                        item.completed
                    ) {

                        return;

                    }


                    const itemDate =
                        getItemDate(
                            list.id,
                            item.id
                        );


                    // =================================
                    // NO DATE
                    // =================================

                    if (!itemDate) {

                        return;

                    }


                    const notificationItem = {

                        listId:
                            list.id,

                        listName:
                            list.name,

                        itemId:
                            item.id,

                        itemText:
                            item.text,

                        date:
                            itemDate

                    };


                    // =================================
                    // OVERDUE
                    // =================================

                    if (
                        itemDate <
                        today
                    ) {

                        data.overdue.push(
                            notificationItem
                        );

                        return;

                    }


                    // =================================
                    // DUE TODAY
                    // =================================

                    if (
                        itemDate ===
                        today
                    ) {

                        data.today.push(
                            notificationItem
                        );

                        return;

                    }


                    // =================================
                    // DUE SOON
                    // =================================

                    if (
                        itemDate <=
                        soonDate
                    ) {

                        data.soon.push(
                            notificationItem
                        );

                    }

                }
            );

        }
    );


    return data;

}



// -----------------------------------------------------
// CREATE NOTIFICATION ITEM HTML
// -----------------------------------------------------

function createNotificationItem(
    item,
    type
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "notification-item";


    element.dataset.listId =
        item.listId;


    let statusTitle =
        "";


    if (
        type ===
        "overdue"
    ) {

        statusTitle =
            "Overdue";

    }

    else if (
        type ===
        "today"
    ) {

        statusTitle =
            "Due Today";

    }

    else {

        statusTitle =
            "Due Soon";

    }


    let formattedDate =
        "";


    if (item.date) {

        try {

            formattedDate =
                formatItemDate(
                    item.date
                );

        }

        catch {

            formattedDate =
                item.date;

        }

    }


    element.innerHTML = `

        <div class="notification-item-status">

            ${
                type === "overdue"
                    ? "🔴"
                    : type === "today"
                        ? "🟠"
                        : "🟡"
            }

            <strong>
                ${statusTitle}
            </strong>

        </div>


        <div class="notification-item-name">

            ${escapeHTML(
                item.itemText
            )}

        </div>


        <div class="notification-item-list">

            📋

            ${escapeHTML(
                item.listName
            )}

        </div>


        ${
            formattedDate
                ? `

                    <div class="notification-item-date">

                        📅

                        ${escapeHTML(
                            formattedDate
                        )}

                    </div>

                `
                : ""
        }

    `;


    element.addEventListener(
        "click",
        () => {

            notificationsModal.classList.add(
                "hidden"
            );


            openList(
                item.listId
            );

        }
    );


    return element;

}



// -----------------------------------------------------
// ADD NOTIFICATION SECTION
// -----------------------------------------------------

function addNotificationSection(
    title,
    items,
    type
) {

    if (
        !items ||
        items.length === 0
    ) {

        return;

    }


    const section =
        document.createElement(
            "section"
        );


    section.className =
        "notification-section";


    const heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        title;


    section.appendChild(
        heading
    );


    items.forEach(
        item => {

            section.appendChild(

                createNotificationItem(
                    item,
                    type
                )

            );

        }
    );


    notificationList.appendChild(
        section
    );

}



// -----------------------------------------------------
// UPDATE NOTIFICATIONS
// -----------------------------------------------------

function updateNotifications() {

    if (
        !notificationList
    ) {

        return;

    }


    const data =
        getNotificationData();


    const overdueCount =
        data.overdue.length;


    const todayCount =
        data.today.length;


    const soonCount =
        data.soon.length;


    const activeCount =
        overdueCount +
        todayCount +
        soonCount;


    // ===============================================
    // COUNTERS
    // ===============================================

    if (
        notificationOverdueCount
    ) {

        notificationOverdueCount.textContent =
            overdueCount;

    }


    if (
        notificationTodayCount
    ) {

        notificationTodayCount.textContent =
            todayCount;

    }


    if (
        notificationSoonCount
    ) {

        notificationSoonCount.textContent =
            soonCount;

    }


    // ===============================================
    // BADGE
    // ===============================================

    if (
        notificationBadge
    ) {

        notificationBadge.textContent =
            activeCount;


        if (
            activeCount ===
            0
        ) {

            notificationBadge.style.display =
                "none";

        }

        else {

            notificationBadge.style.display =
                "inline-flex";

        }

    }


    // ===============================================
    // CLEAR OLD CONTENT
    // ===============================================

    notificationList.innerHTML =
        "";


    // ===============================================
    // NOTHING DUE
    // ===============================================

    if (
        activeCount ===
        0
    ) {

        notificationList.innerHTML = `

            <div class="notification-empty">

                <div>
                    🎉
                </div>

                <strong>
                    All clear!
                </strong>

                <p>
                    You don't have any overdue
                    or upcoming tasks.
                </p>

            </div>

        `;


        return;

    }


    // ===============================================
    // OVERDUE
    // ===============================================

    addNotificationSection(
        "🔴 Overdue",
        data.overdue,
        "overdue"
    );


    // ===============================================
    // DUE TODAY
    // ===============================================

    addNotificationSection(
        "🟠 Due Today",
        data.today,
        "today"
    );


    // ===============================================
    // DUE SOON
    // ===============================================

    addNotificationSection(
        "🟡 Due Soon",
        data.soon,
        "soon"
    );

}



// =====================================================
// OPEN NOTIFICATIONS
// =====================================================

if (
    notificationsBtn &&
    notificationsModal
) {

    notificationsBtn.addEventListener(
        "click",
        () => {

            updateNotifications();


            notificationsModal.classList.remove(
                "hidden"
            );

        }
    );

}



// =====================================================
// CLOSE NOTIFICATIONS
// =====================================================

if (
    closeNotificationsBtn &&
    notificationsModal
) {

    closeNotificationsBtn.addEventListener(
        "click",
        () => {

            notificationsModal.classList.add(
                "hidden"
            );

        }
    );

}



// =====================================================
// NOTIFICATIONS OUTSIDE CLICK
// =====================================================

if (
    notificationsModal
) {

    notificationsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                notificationsModal
            ) {

                notificationsModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}



// =====================================================
// CREATE MODAL OUTSIDE CLICK
// =====================================================

createModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            createModal
        ) {

            createModal.classList.add(
                "hidden"
            );

        }

    }
);



// =====================================================
// SETTINGS MODAL OUTSIDE CLICK
// =====================================================

settingsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            settingsModal
        ) {

            settingsModal.classList.add(
                "hidden"
            );

        }

    }
);



// =====================================================
// APP SETTINGS MODAL OUTSIDE CLICK
// =====================================================

appSettingsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            appSettingsModal
        ) {

            appSettingsModal.classList.add(
                "hidden"
            );

        }

    }
);



// =====================================================
// ESCAPE
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        createModal.classList.add(
            "hidden"
        );


        settingsModal.classList.add(
            "hidden"
        );


        appSettingsModal.classList.add(
            "hidden"
        );


        if (
            notificationsModal
        ) {

            notificationsModal.classList.add(
                "hidden"
            );

        }

    }
);



// =====================================================
// REFRESH CURRENT LIST
// =====================================================

export function refreshCurrentList() {

    if (!currentListId) {

        return;

    }


    const list =
        getList(
            currentListId
        );


    if (!list) {

        showHome();


        return;

    }


    applyListAppearance(
        list
    );


    renderListPage(
        list
    );

}


// =====================================================
// CURRENT LIST ID
// =====================================================

export function getCurrentListId() {

    return currentListId;

}



// =====================================================
// LIST COMMAND REQUEST
// =====================================================

document.addEventListener(
    "anylist:refresh-current-list",
    () => {

        refreshCurrentList();


        updateNotifications();

    }
);



// =====================================================
// ITEM RENAME REFRESH
// =====================================================

document.addEventListener(
    "anylist:item-rename",
    () => {

        refreshCurrentList();


        updateNotifications();

    }
);



// =====================================================
// START
// =====================================================

applyAppBackground();


renderHome();


updateNotifications();
