// =====================================================
// ANYLIST ITEM DATES
// =====================================================
//
// This script ONLY manages dates for items.
//
// RULE:
// - Future date  → LOCKED
// - Today        → LOCKED
// - Past date    → CAN CHANGE / CLEAR
//
// Dates are stored separately from items.js.
// =====================================================


// =====================================================
// STORAGE
// =====================================================

const ITEM_DATES_KEY =
    "anylist_item_dates_v1";


// =====================================================
// LOAD DATE DATA
// =====================================================

function loadItemDates() {

    try {

        const saved =
            localStorage.getItem(
                ITEM_DATES_KEY
            );

        if (!saved) {
            return {};
        }

        const data =
            JSON.parse(saved);

        if (
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {

            return {};

        }

        return data;

    } catch (error) {

        console.error(
            "Could not load item dates:",
            error
        );

        return {};

    }

}


// =====================================================
// SAVE DATE DATA
// =====================================================

function saveItemDates(data) {

    try {

        localStorage.setItem(
            ITEM_DATES_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Could not save item dates:",
            error
        );

    }

}


// =====================================================
// CREATE UNIQUE ITEM KEY
// =====================================================

function makeItemKey(
    listId,
    itemId
) {

    return `${listId}::${itemId}`;

}


// =====================================================
// GET TODAY STRING
// =====================================================

function getTodayString() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


// =====================================================
// CHECK DATE PASSED
// =====================================================

export function isDatePassed(
    date
) {

    if (!date) {
        return false;
    }

    return date < getTodayString();

}


// =====================================================
// CHECK DATE IS TODAY
// =====================================================

export function isDateToday(
    date
) {

    if (!date) {
        return false;
    }

    return date === getTodayString();

}


// =====================================================
// CHECK DATE IS LOCKED
// =====================================================
//
// Future date = locked
// Today       = locked
// Past date   = unlocked
//

export function isDateLocked(
    date
) {

    if (!date) {
        return false;
    }

    return !isDatePassed(date);

}


// =====================================================
// SET DATE
// =====================================================
//
// IMPORTANT:
//
// If an existing date has NOT passed,
// it cannot be changed.
//
// If the existing date HAS passed,
// it can be changed or cleared.
//

export function setItemDate(
    listId,
    itemId,
    date
) {

    if (!listId || !itemId) {

        return false;

    }


    const dates =
        loadItemDates();

    const key =
        makeItemKey(
            listId,
            itemId
        );


    const existingDate =
        dates[key] || null;


    // =================================================
    // EXISTING DATE IS LOCKED
    // =================================================

    if (
        existingDate &&
        isDateLocked(existingDate)
    ) {

        console.warn(
            "Item date is locked until the due date passes."
        );

        return false;

    }


    // =================================================
    // CLEAR DATE
    // =================================================

    if (!date) {

        delete dates[key];

        saveItemDates(dates);

        return true;

    }


    // =================================================
    // VALIDATE DATE
    // =================================================

    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {

        console.error(
            "Invalid item date:",
            date
        );

        return false;

    }


    // =================================================
    // SAVE DATE
    // =================================================

    dates[key] =
        date;

    saveItemDates(dates);

    return true;

}


// =====================================================
// GET DATE
// =====================================================

export function getItemDate(
    listId,
    itemId
) {

    if (!listId || !itemId) {

        return null;

    }


    const dates =
        loadItemDates();

    const key =
        makeItemKey(
            listId,
            itemId
        );


    return dates[key] || null;

}


// =====================================================
// CLEAR DATE
// =====================================================
//
// Can ONLY clear after the date has passed.
//

export function clearItemDate(
    listId,
    itemId
) {

    if (!listId || !itemId) {

        return false;

    }


    const existingDate =
        getItemDate(
            listId,
            itemId
        );


    if (!existingDate) {

        return true;

    }


    // ================================================
    // DATE STILL LOCKED
    // ================================================

    if (
        isDateLocked(existingDate)
    ) {

        console.warn(
            "Cannot clear an item date before it passes."
        );

        return false;

    }


    return setItemDate(
        listId,
        itemId,
        null
    );

}


// =====================================================
// GET ALL ITEM DATES
// =====================================================

export function getAllItemDates() {

    return loadItemDates();

}


// =====================================================
// GET DATES FOR ONE LIST
// =====================================================

export function getListItemDates(
    listId
) {

    if (!listId) {

        return {};

    }


    const dates =
        loadItemDates();

    const result =
        {};

    const prefix =
        `${listId}::`;


    Object.keys(dates).forEach(
        key => {

            if (
                key.startsWith(prefix)
            ) {

                const itemId =
                    key.substring(
                        prefix.length
                    );

                result[itemId] =
                    dates[key];

            }

        }
    );


    return result;

}


// =====================================================
// FORMAT DATE
// =====================================================
//
// 2026-08-20
// ↓
// 20 Aug 2026
//

export function formatItemDate(
    date
) {

    if (!date) {

        return "";

    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    const dateObject =
        new Date(
            year,
            month - 1,
            day
        );


    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// GET DATE STATUS
// =====================================================
//
// Returns:
//
// "none"
// "today"
// "upcoming"
// "overdue"
//

export function getItemDateStatus(
    date
) {

    if (!date) {

        return "none";

    }


    if (
        isDatePassed(date)
    ) {

        return "overdue";

    }


    if (
        isDateToday(date)
    ) {

        return "today";

    }


    return "upcoming";

}


// =====================================================
// GET DATE INFORMATION
// =====================================================
//
// Useful for notification system later.
//

export function getItemDateInfo(
    listId,
    itemId
) {

    const date =
        getItemDate(
            listId,
            itemId
        );


    if (!date) {

        return {

            date: null,

            status: "none",

            locked: false,

            passed: false,

            today: false

        };

    }


    return {

        date: date,

        status:
            getItemDateStatus(
                date
            ),

        locked:
            isDateLocked(
                date
            ),

        passed:
            isDatePassed(
                date
            ),

        today:
            isDateToday(
                date
            )

    };

}


// =====================================================
// COMPATIBILITY HELPERS
// =====================================================
//
// These work with an item object.
//
// They DO NOT store the date separately.
// They are only helpers for rendering.
//

export function hasItemDate(
    item
) {

    if (!item) {

        return false;

    }


    return Boolean(
        item.dueDate
    );

}


// =====================================================
// ITEM DATE PASSED
// =====================================================

export function isItemDatePassed(
    item
) {

    if (
        !item ||
        !item.dueDate
    ) {

        return false;

    }


    return isDatePassed(
        item.dueDate
    );

}


// =====================================================
// ITEM DATE TODAY
// =====================================================

export function isItemDateToday(
    item
) {

    if (
        !item ||
        !item.dueDate
    ) {

        return false;

    }


    return isDateToday(
        item.dueDate
    );

}


// =====================================================
// ITEM DATE LOCKED
// =====================================================

export function isItemDateLocked(
    item
) {

    if (
        !item ||
        !item.dueDate
    ) {

        return false;

    }


    return isDateLocked(
        item.dueDate
    );

}