// ========================================
// NOTIFICATIONS
// AnyList
// ========================================

import { getLists } from "./lists.js";

import {
    getItemDate,
    formatItemDate,
    getItemDateStatus
} from "./itemDates.js";


// ========================================
// SETTINGS
// ========================================

const NOTIFICATION_DAYS_AHEAD = 7;


// ========================================
// GET NOTIFICATION DATA
// ========================================

function getNotifications() {

    const lists = getLists();

    const overdue = [];
    const dueToday = [];
    const dueSoon = [];


    lists.forEach(list => {

        if (!Array.isArray(list.items)) {
            return;
        }


        list.items.forEach(item => {

            // Completed items are ignored
            if (item.completed) {
                return;
            }


            const itemDate =
                getItemDate(
                    list.id,
                    item.id
                );


            if (!itemDate) {
                return;
            }


            const status =
                getItemDateStatus(
                    itemDate
                );


            const notificationItem = {

                listId: list.id,

                listName: list.name,

                itemId: item.id,

                itemText: item.text,

                date: itemDate,

                formattedDate:
                    formatItemDate(
                        itemDate
                    )

            };


            // =================================
            // OVERDUE
            // =================================

            if (status === "overdue") {

                overdue.push(
                    notificationItem
                );

                return;

            }


            // =================================
            // DUE TODAY
            // =================================

            if (
                status === "today" ||
                status === "due-today"
            ) {

                dueToday.push(
                    notificationItem
                );

                return;

            }


            // =================================
            // DUE SOON
            // =================================

            if (
                status === "soon" ||
                status === "due-soon"
            ) {

                dueSoon.push(
                    notificationItem
                );

                return;

            }

        });

    });


    return {

        overdue,
        dueToday,
        dueSoon

    };

}


// ========================================
// UPDATE NOTIFICATION BUTTON
// ========================================

export function updateNotificationButton() {

    const data =
        getNotifications();


    const total =
        data.overdue.length +
        data.dueToday.length +
        data.dueSoon.length;


    // Try common notification button IDs

    const button =
        document.getElementById(
            "notificationsBtn"
        ) ||
        document.getElementById(
            "notificationBtn"
        );


    if (!button) {
        return;
    }


    // =====================================
    // FIND / CREATE BADGE
    // =====================================

    let badge =
        button.querySelector(
            ".notification-count"
        );


    if (!badge) {

        badge =
            document.createElement(
                "span"
            );

        badge.className =
            "notification-count";

        button.appendChild(
            badge
        );

    }


    badge.textContent =
        total;


    // Hide badge when there are no notifications

    if (total === 0) {

        badge.style.display =
            "none";

    }

    else {

        badge.style.display =
            "inline-flex";

    }

}


// ========================================
// CREATE NOTIFICATION PANEL
// ========================================

function createNotificationPanel() {

    let panel =
        document.getElementById(
            "notificationsPanel"
        );


    if (panel) {
        return panel;
    }


    panel =
        document.createElement(
            "div"
        );


    panel.id =
        "notificationsPanel";


    panel.className =
        "notifications-panel hidden";


    panel.innerHTML = `

        <div class="notifications-header">

            <div>

                <span class="notifications-eyebrow">
                    NOTIFICATIONS
                </span>

                <h2>
                    Your Tasks
                </h2>

                <p>
                    See what is due, overdue, or coming up.
                </p>

            </div>


            <button
                id="closeNotificationsBtn"
                class="close-notifications-btn"
                type="button"
                title="Close notifications"
            >
                ×
            </button>

        </div>


        <div
            id="notificationStats"
            class="notification-stats"
        >
        </div>


        <div
            id="notificationContent"
            class="notification-content"
        >
        </div>

    `;


    document.body.appendChild(
        panel
    );


    // =====================================
    // CLOSE BUTTON
    // =====================================

    const closeButton =
        document.getElementById(
            "closeNotificationsBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeNotificationPanel();

            }
        );

    }


    return panel;

}


// ========================================
// RENDER NOTIFICATIONS
// ========================================

export function renderNotifications() {

    const panel =
        createNotificationPanel();


    const stats =
        document.getElementById(
            "notificationStats"
        );


    const content =
        document.getElementById(
            "notificationContent"
        );


    if (!stats || !content) {
        return;
    }


    const data =
        getNotifications();


    // =====================================
    // COUNTS
    // =====================================

    stats.innerHTML = `

        <div class="notification-stat overdue-stat">

            <span>
                Overdue
            </span>

            <strong>
                ${data.overdue.length}
            </strong>

        </div>


        <div class="notification-stat today-stat">

            <span>
                Due Today
            </span>

            <strong>
                ${data.dueToday.length}
            </strong>

        </div>


        <div class="notification-stat soon-stat">

            <span>
                Due Soon
            </span>

            <strong>
                ${data.dueSoon.length}
            </strong>

        </div>

    `;


    // =====================================
    // CLEAR OLD CONTENT
    // =====================================

    content.innerHTML = "";


    const total =
        data.overdue.length +
        data.dueToday.length +
        data.dueSoon.length;


    // =====================================
    // NOTHING DUE
    // =====================================

    if (total === 0) {

        content.innerHTML = `

            <div class="notifications-empty">

                <div class="notifications-empty-icon">
                    ✓
                </div>

                <h3>
                    You're all caught up!
                </h3>

                <p>
                    There are no overdue or upcoming tasks.
                </p>

            </div>

        `;

        updateNotificationButton();

        return;

    }


    // =====================================
    // OVERDUE SECTION
    // =====================================

    if (data.overdue.length > 0) {

        content.appendChild(
            createNotificationSection(
                "overdue",
                "🔴",
                "Overdue",
                data.overdue
            )
        );

    }


    // =====================================
    // TODAY SECTION
    // =====================================

    if (data.dueToday.length > 0) {

        content.appendChild(
            createNotificationSection(
                "today",
                "🟠",
                "Due Today",
                data.dueToday
            )
        );

    }


    // =====================================
    // SOON SECTION
    // =====================================

    if (data.dueSoon.length > 0) {

        content.appendChild(
            createNotificationSection(
                "soon",
                "🟡",
                "Due Soon",
                data.dueSoon
            )
        );

    }


    updateNotificationButton();

}


// ========================================
// CREATE NOTIFICATION SECTION
// ========================================

function createNotificationSection(
    className,
    icon,
    title,
    items
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        `notification-section ${className}`;


    section.innerHTML = `

        <div class="notification-section-header">

            <h3>
                ${icon}
                ${title}
            </h3>

            <span>
                ${items.length}
            </span>

        </div>

    `;


    const list =
        document.createElement(
            "div"
        );


    list.className =
        "notification-list";


    items.forEach(
        notification => {

            const card =
                createNotificationItem(
                    notification
                );


            list.appendChild(
                card
            );

        }
    );


    section.appendChild(
        list
    );


    return section;

}


// ========================================
// CREATE SINGLE NOTIFICATION
// ========================================

function createNotificationItem(
    notification
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "notification-item";


    item.innerHTML = `

        <div class="notification-item-icon">
            📋
        </div>


        <div class="notification-item-info">

            <strong class="notification-item-name">
                ${escapeHTML(
                    notification.itemText
                )}
            </strong>


            <span class="notification-list-name">
                ${escapeHTML(
                    notification.listName
                )}
            </span>


            <span class="notification-date">
                📅
                ${escapeHTML(
                    notification.formattedDate
                )}
            </span>

        </div>

    `;


    // =====================================
    // CLICK TO OPEN LIST
    // =====================================

    item.addEventListener(
        "click",
        () => {

            openNotificationList(
                notification.listId
            );

        }
    );


    return item;

}


// ========================================
// OPEN LIST FROM NOTIFICATION
// ========================================

function openNotificationList(
    listId
) {

    // Close notification panel

    closeNotificationPanel();


    // =====================================
    // TRY EXISTING OPEN-LIST EVENT
    // =====================================

    const event =
        new CustomEvent(
            "anylist:open-list",
            {
                detail: {
                    listId: listId
                }
            }
        );


    document.dispatchEvent(
        event
    );


    // =====================================
    // FALLBACK
    // =====================================

    const openButton =
        document.querySelector(
            `.open-list-btn[data-id="${listId}"]`
        );


    if (openButton) {

        openButton.click();

    }

}


// ========================================
// OPEN NOTIFICATION PANEL
// ========================================

export function openNotificationPanel() {

    const panel =
        createNotificationPanel();


    renderNotifications();


    panel.classList.remove(
        "hidden"
    );


    // Also support CSS display

    panel.style.display =
        "block";

}


// ========================================
// CLOSE NOTIFICATION PANEL
// ========================================

export function closeNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationsPanel"
        );


    if (!panel) {
        return;
    }


    panel.classList.add(
        "hidden"
    );


    panel.style.display =
        "none";

}


// ========================================
// TOGGLE NOTIFICATION PANEL
// ========================================

export function toggleNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationsPanel"
        );


    if (
        panel &&
        !panel.classList.contains(
            "hidden"
        ) &&
        panel.style.display !== "none"
    ) {

        closeNotificationPanel();

    }

    else {

        openNotificationPanel();

    }

}


// ========================================
// CONNECT NOTIFICATION BUTTON
// ========================================

function setupNotificationButton() {

    const button =
        document.getElementById(
            "notificationsBtn"
        ) ||
        document.getElementById(
            "notificationBtn"
        );


    if (!button) {

        console.warn(
            "AnyList: Notification button not found."
        );

        return;

    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleNotificationPanel();

        }
    );


    // =====================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =====================================

    document.addEventListener(
        "click",
        event => {

            const panel =
                document.getElementById(
                    "notificationsPanel"
                );


            if (!panel) {
                return;
            }


            if (
                panel.classList.contains(
                    "hidden"
                )
            ) {

                return;

            }


            if (
                panel.contains(
                    event.target
                )
            ) {

                return;

            }


            if (
                button.contains(
                    event.target
                )
            ) {

                return;

            }


            closeNotificationPanel();

        }
    );

}


// ========================================
// REFRESH
// ========================================

export function refreshNotifications() {

    updateNotificationButton();


    const panel =
        document.getElementById(
            "notificationsPanel"
        );


    if (
        panel &&
        !panel.classList.contains(
            "hidden"
        )
    ) {

        renderNotifications();

    }

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


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNotificationButton();

        createNotificationPanel();

        updateNotificationButton();

    }
);


// ========================================
// AUTO UPDATE
// ========================================

window.addEventListener(
    "storage",
    () => {

        refreshNotifications();

    }
);


document.addEventListener(
    "anylist:changed",
    () => {

        refreshNotifications();

    }
);