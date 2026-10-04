import { renderListPage } from "./ui.js";
import { formatDate, getProgress } from "./utils.js";


const MULTI_LIST_STORAGE_KEY = "listManagerMultiLists";
const MULTI_LIST_RAINBOW_BACKGROUND =
    "linear-gradient(135deg, " +
    "#ff0000 0%, " +
    "#ff8a00 16%, " +
    "#ffe600 32%, " +
    "#22c55e 48%, " +
    "#06b6d4 64%, " +
    "#3b82f6 80%, " +
    "#a855f7 100%)";
const homeCommandInput = document.getElementById("homeCommandInput");
const homeCommandOutput = document.getElementById("homeCommandOutput");
const homePage = document.getElementById("homePage");
const listPage = document.getElementById("listPage");
const listsContainer = document.getElementById("listsContainer");
const itemInput = document.getElementById("itemInput");
const addItemButton = document.getElementById("addItemBtn");
const itemsContainer = document.getElementById("itemsContainer");
const settingsModal = document.getElementById("settingsModal");

let multiLists = loadMultiLists();
let currentPath = [];
let makeListCheckbox = null;


function loadMultiLists() {

    try {

        const saved = localStorage.getItem(MULTI_LIST_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed)
            ? parsed
                .map(normalizeMultiList)
                .filter(Boolean)
            : [];

    } catch (error) {

        console.error("Could not load multi-lists:", error);
        return [];

    }

}


function normalizeMultiList(list) {

    if (!list || typeof list !== "object" || Array.isArray(list)) {
        return null;
    }

    const createdAt = Number.isFinite(list.createdAt)
        ? list.createdAt
        : Date.now();

    list.id = typeof list.id === "string" && list.id
        ? list.id
        : createId();
    list.name = typeof list.name === "string" && list.name.trim()
        ? list.name.trim()
        : "Untitled Multi-list";
    list.createdAt = createdAt;
    list.updatedAt = Number.isFinite(list.updatedAt)
        ? list.updatedAt
        : createdAt;

    const savedSettings =
        list.settings && typeof list.settings === "object"
            ? list.settings
            : {};

    list.settings = {
        background: savedSettings.background || "#ffffff",
        rainbow: savedSettings.rainbow === true,
        itemColor: savedSettings.itemColor || "#ffffff"
    };

    list.items = (Array.isArray(list.items) ? list.items : [])
        .map((item, index) => {

            if (!item || typeof item !== "object") {
                return null;
            }

            const text = typeof item.text === "string"
                ? item.text
                : typeof item.name === "string"
                    ? item.name
                    : "";

            if (!text.trim()) {
                return null;
            }

            const itemCreatedAt = Number.isFinite(item.createdAt)
                ? item.createdAt
                : createdAt;

            return {
                ...item,
                id: typeof item.id === "string" && item.id
                    ? item.id
                    : createId(),
                text,
                completed: item.completed === true,
                createdAt: itemCreatedAt,
                updatedAt: Number.isFinite(item.updatedAt)
                    ? item.updatedAt
                    : itemCreatedAt,
                order: Number.isFinite(item.order)
                    ? item.order
                    : index
            };

        })
        .filter(Boolean);

    list.lists = (Array.isArray(list.lists) ? list.lists : [])
        .map(normalizeMultiList)
        .filter(Boolean);

    return list;

}


function saveMultiLists() {

    try {

        localStorage.setItem(
            MULTI_LIST_STORAGE_KEY,
            JSON.stringify(multiLists)
        );

    } catch (error) {

        console.error("Could not save multi-lists:", error);
        showHomeMessage("Could not save this multi-list.");

    }

}


function createId() {

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);

}


function makeMultiList(name) {

    const now = Date.now();

    return {
        id: createId(),
        name,
        createdAt: now,
        updatedAt: now,
        settings: {
            background: "#ffffff",
            rainbow: false,
            itemColor: "#ffffff"
        },
        items: [],
        lists: []
    };

}


function findMultiList(id, lists = multiLists) {

    for (const list of lists) {

        if (list.id === id) {
            return list;
        }

        const nested = findMultiList(id, list.lists || []);

        if (nested) {
            return nested;
        }

    }

    return null;

}


function currentMultiList() {

    return currentPath.length
        ? findMultiList(currentPath[currentPath.length - 1])
        : null;

}


function applyMultiListCardBackground(card, list) {

    if (list.settings?.rainbow === true) {
        card.style.background = MULTI_LIST_RAINBOW_BACKGROUND;
    } else {
        card.style.background = list.settings?.background || "#ffffff";
    }

}


function showHomeMessage(message) {

    if (!homeCommandOutput) {
        return;
    }

    homeCommandOutput.textContent = message;
    homeCommandOutput.classList.add("show");

    clearTimeout(showHomeMessage.timer);
    showHomeMessage.timer = setTimeout(() => {
        homeCommandOutput.classList.remove("show");
    }, 4000);

}


function renderMultiListCards() {

    if (!listsContainer) {
        return;
    }

    const rootIds = new Set(multiLists.map(list => list.id));

    listsContainer.querySelectorAll("[data-multi-list-id]").forEach(card => {
        if (!rootIds.has(card.dataset.multiListId)) {
            card.remove();
        }
    });

    for (const multiList of multiLists) {

        if (!Array.isArray(multiList.items)) {
            multiList.items = [];
        }

        if (!Array.isArray(multiList.lists)) {
            multiList.lists = [];
        }

        if (!multiList.settings) {
            multiList.settings = {};
        }

        let card = Array.from(
            listsContainer.querySelectorAll("[data-multi-list-id]")
        ).find(candidate => candidate.dataset.multiListId === multiList.id);

        if (!card) {

            card = document.createElement("article");
            card.className = "list-card";
            card.dataset.multiListId = multiList.id;

            const heading = document.createElement("h2");
            const completion = document.createElement("p");
            completion.dataset.multiCompletion = "true";

            const childListCount = document.createElement("p");
            childListCount.dataset.multiCount = "true";

            const created = document.createElement("p");
            created.dataset.multiCreated = "true";

            const updated = document.createElement("p");
            updated.dataset.multiUpdated = "true";

            const progress = document.createElement("div");
            progress.className = "card-progress";

            const progressFill = document.createElement("div");
            progressFill.className = "card-progress-fill";
            progressFill.dataset.multiProgress = "true";
            progress.append(progressFill);

            const openButton = document.createElement("button");
            openButton.className = "open-list-btn";
            openButton.type = "button";
            openButton.dataset.openMultiList = multiList.id;
            openButton.textContent = "Open multi-list";

            card.append(
                heading,
                completion,
                childListCount,
                created,
                updated,
                progress,
                openButton
            );
            listsContainer.append(card);

        }

        const heading = card.querySelector("h2");
        const total = multiList.items.length;
        const completed = multiList.items.filter(item => item.completed).length;
        const completion = card.querySelector("[data-multi-completion]");
        const childListCount = card.querySelector("[data-multi-count]");
        const created = card.querySelector("[data-multi-created]");
        const updated = card.querySelector("[data-multi-updated]");
        const progressFill = card.querySelector("[data-multi-progress]");

        if (heading) {
            heading.textContent = multiList.name;
        }

        if (completion) {
            completion.textContent = `${completed} / ${total} items completed`;
        }

        if (childListCount) {
            childListCount.textContent = `${multiList.lists.length} nested lists`;
        }

        if (created) {
            created.textContent = `Created: ${formatDate(multiList.createdAt || Date.now())}`;
        }

        if (updated) {
            updated.textContent = `Last changed: ${formatDate(multiList.updatedAt || multiList.createdAt || Date.now())}`;
        }

        if (progressFill) {
            progressFill.style.width = `${getProgress(multiList)}%`;
        }

        applyMultiListCardBackground(card, multiList);

        card.setAttribute("aria-label", `Multi-list: ${multiList.name}`);

    }

}


function syncCreateControl() {

    if (!itemInput || !addItemButton) {
        return;
    }

    const enabled = currentPath.length > 0;
    addItemButton.textContent = enabled ? "Create New" : "Add Item";
    itemInput.placeholder = enabled
        ? "Enter an item or list name..."
        : "Add a new item...";

    if (enabled && !makeListCheckbox) {

        const addBox = itemInput.closest(".add-item-box");
        const label = document.createElement("label");

        label.className = "multi-list-make-list-option";
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "8px";
        label.style.marginTop = "10px";
        label.style.whiteSpace = "nowrap";
        label.style.fontSize = "0.95rem";

        makeListCheckbox = document.createElement("input");
        makeListCheckbox.type = "checkbox";
        makeListCheckbox.id = "multiListMakeList";

        const text = document.createElement("span");
        text.textContent = "Make it a list";

        label.append(makeListCheckbox, text);
        addBox.append(label);

    }

    if (!enabled && makeListCheckbox) {
        makeListCheckbox.closest("label").remove();
        makeListCheckbox = null;
    }

}


function openMultiList(id) {

    const list = findMultiList(id);

    if (!list) {
        return;
    }

    currentPath = [list.id];
    showMultiListPage();

}


function showMultiListPage() {

    const list = currentMultiList();

    if (!list) {
        closeMultiListPage();
        return;
    }

    if (homePage) {
        homePage.classList.add("hidden");
    }

    if (listPage) {
        listPage.classList.remove("hidden");
    }

    if (!Array.isArray(list.items)) {
        list.items = [];
    }

    if (!Array.isArray(list.lists)) {
        list.lists = [];
    }

    if (!list.settings) {
        list.settings = {};
    }

    renderListPage(list);
    applyMultiListAppearance(list);
    syncCreateControl();
    renderNestedLists(list);

    const backButton = document.getElementById("backBtn");
    if (backButton) {
        backButton.textContent = currentPath.length > 1
            ? "← Back to parent"
            : "← Back";
    }

    const commandInput = document.getElementById("listCommandInput");
    if (commandInput) {
        commandInput.placeholder = "items(Apple,Milk,Bread)";
    }

}


function applyMultiListAppearance(list) {

    if (!listPage) {
        return;
    }

    listPage.style.animation = "none";

    if (list.settings?.rainbow === true) {
        listPage.style.background = `
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
        listPage.style.backgroundSize = "500% 500%";
        listPage.style.backgroundPosition = "0% 50%";
        listPage.style.animation = "anyListRainbow 18s ease infinite";
        return;
    }

    listPage.style.background = list.settings?.background || "#ffffff";
    listPage.style.backgroundSize = "";
    listPage.style.backgroundPosition = "";

}


function closeMultiListPage() {

    currentPath = [];

    if (listPage) {
        listPage.classList.add("hidden");
        listPage.style.animation = "none";
        listPage.style.background = "";
        listPage.style.backgroundSize = "";
        listPage.style.backgroundPosition = "";
    }

    if (homePage) {
        homePage.classList.remove("hidden");
    }

    syncCreateControl();

    const backButton = document.getElementById("backBtn");
    if (backButton) {
        backButton.textContent = "← Back";
    }

}


function renderNestedLists(list) {

    if (!itemsContainer) {
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "multi-list-nested-items";
    wrapper.style.display = "grid";
    wrapper.style.gap = "12px";
    wrapper.style.marginBottom = "16px";

    (list.lists || []).forEach(child => {

        const card = document.createElement("article");
        card.className = "list-card";
        applyMultiListCardBackground(card, child);

        const title = document.createElement("h2");
        title.textContent = child.name;

        const summary = document.createElement("p");
        summary.textContent = `${(child.items || []).length} items · ${(child.lists || []).length} lists`;

        const open = document.createElement("button");
        open.className = "open-list-btn";
        open.type = "button";
        open.dataset.openChildMultiList = child.id;
        open.textContent = "Open multi-list";

        card.append(title, summary, open);
        wrapper.append(card);

    });

    if (wrapper.childElementCount) {
        itemsContainer.prepend(wrapper);
    }

}


function touchCurrentList() {

    if (currentPath.length) {
        const now = Date.now();

        currentPath.forEach(id => {
            const list = findMultiList(id);

            if (list) {
                list.updatedAt = now;
            }
        });

        saveMultiLists();
        renderMultiListCards();
    }

}


function createCurrentEntry() {

    const list = currentMultiList();
    const name = itemInput ? itemInput.value.trim() : "";

    if (!list || !name) {
        itemInput?.focus();
        return;
    }

    if (makeListCheckbox?.checked) {
        list.lists.push(makeMultiList(name));
    } else {
        const now = Date.now();
        list.items.push({
            id: createId(),
            text: name,
            completed: false,
            createdAt: now,
            updatedAt: now,
            order: list.items.length
        });
    }

    if (itemInput) {
        itemInput.value = "";
    }

    if (makeListCheckbox) {
        makeListCheckbox.checked = false;
    }

    touchCurrentList();
    showMultiListPage();
    itemInput?.focus();

}


function openListSettings() {

    const list = currentMultiList();

    if (!list) {
        return;
    }

    document.getElementById("settingsListName").value = list.name || "";
    document.getElementById("backgroundColor").value = list.settings?.background || "#ffffff";
    document.getElementById("rainbowBackground").checked = list.settings?.rainbow === true;
    document.getElementById("itemColor").value = list.settings?.itemColor || "#ffffff";
    settingsModal.classList.remove("hidden");

}


function saveListSettings() {

    const list = currentMultiList();
    const name = document.getElementById("settingsListName").value.trim();

    if (!list) {
        return;
    }

    if (!name) {
        alert("List name cannot be empty.");
        return;
    }

    list.name = name;
    list.settings = {
        background: document.getElementById("backgroundColor").value,
        rainbow: document.getElementById("rainbowBackground").checked,
        itemColor: document.getElementById("itemColor").value
    };

    settingsModal.classList.add("hidden");
    touchCurrentList();
    showMultiListPage();

}


function deleteCurrentMultiList() {

    const listId = currentPath[currentPath.length - 1];

    if (!listId || !confirm("Delete this multi-list and its nested lists?")) {
        return;
    }

    if (currentPath.length === 1) {
        multiLists = multiLists.filter(list => list.id !== listId);
        closeMultiListPage();
    } else {
        const parent = findMultiList(currentPath[currentPath.length - 2]);
        parent.lists = parent.lists.filter(list => list.id !== listId);
        currentPath.pop();
        touchCurrentList();
        showMultiListPage();
    }

    saveMultiLists();
    renderMultiListCards();
    settingsModal.classList.add("hidden");

}


function changeCurrentItem(itemId, action) {

    const list = currentMultiList();
    const index = list?.items.findIndex(item => item.id === itemId) ?? -1;

    if (!list || index < 0) {
        return;
    }

    if (action === "toggle") {
        list.items[index].completed = !list.items[index].completed;
        list.items[index].updatedAt = Date.now();
    } else if (action === "delete") {
        list.items.splice(index, 1);
        list.items.forEach((item, itemIndex) => {
            item.order = itemIndex;
        });
    }

    touchCurrentList();
    showMultiListPage();

}


function renameCurrentItem(itemId, element) {

    const list = currentMultiList();
    const item = list?.items.find(candidate => candidate.id === itemId);

    if (!item) {
        return;
    }

    const name = prompt("Rename item:", item.text);

    if (name === null || !name.trim()) {
        return;
    }

    item.text = name.trim();
    item.updatedAt = Date.now();
    touchCurrentList();
    showMultiListPage();

}


function executeMultiListCommand() {

    const list = currentMultiList();
    const input = document.getElementById("listCommandInput");
    const output = document.getElementById("listCommandOutput");

    if (!list || !input) {
        return false;
    }

    const command = input.value.trim();

    const itemsMatch = command.match(/^items\s*\((.*?)\)$/i);
    if (itemsMatch) {
        const names = itemsMatch[1].split(",").map(name => name.trim()).filter(Boolean);

        if (!names.length) {
            finishMultiListCommand(input, output, "Please enter at least one item.", false);
            return true;
        }

        if (names.length > 1000) {
            finishMultiListCommand(input, output, "You can create a maximum of 1000 items at once.", false);
            return true;
        }

        names.forEach(name => addMultiItem(list, name));
        finishMultiListCommand(input, output, `${names.length} item(s) added.`);
        return true;
    }

    const createMatch = command.match(/^itemlist\s*\(\s*([a-zA-Z0-9 _-]*?)(\d+)\s*-\s*([a-zA-Z0-9 _-]*?)(\d+)\s*\)$/i);
    if (createMatch) {
        const prefix = createMatch[1].trim();
        const secondPrefix = createMatch[3].trim();
        const start = Number(createMatch[2]);
        const end = Number(createMatch[4]);

        if (prefix !== secondPrefix || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || end - start > 999) {
            finishMultiListCommand(input, output, "Use matching prefixes and a range of at most 1000 items.", false);
            return true;
        }

        for (let number = start; number <= end; number++) {
            addMultiItem(list, `${prefix}-${number}`);
        }

        finishMultiListCommand(input, output, `${end - start + 1} item(s) added.`);
        return true;
    }

    const deleteMatch = command.match(/^itemlistdel\s*\(\s*([a-zA-Z0-9 _-]*?)(\d+)\s*-\s*([a-zA-Z0-9 _-]*?)(\d+)\s*\)$/i);
    if (deleteMatch) {
        const prefix = deleteMatch[1].trim();
        const secondPrefix = deleteMatch[3].trim();
        const start = Number(deleteMatch[2]);
        const end = Number(deleteMatch[4]);

        if (prefix !== secondPrefix || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || end - start > 999) {
            finishMultiListCommand(input, output, "Use matching prefixes and a range of at most 1000 items.", false);
            return true;
        }

        const names = new Set();
        for (let number = start; number <= end; number++) {
            names.add(`${prefix}-${number}`);
        }

        const oldLength = list.items.length;
        list.items = list.items.filter(item => !names.has(item.text));
        list.items.forEach((item, index) => {
            item.order = index;
        });

        finishMultiListCommand(input, output, `${oldLength - list.items.length} item(s) deleted.`);
        return true;
    }

    if (/^mul\s*\(\s*name\s*:/i.test(command)) {
        const nestedMatch = command.match(/^mul\s*\(\s*name\s*:\s*(.*?)\s*\)\s*list$/i);

        if (nestedMatch && nestedMatch[1].trim()) {
            list.lists.push(makeMultiList(nestedMatch[1].trim()));
            finishMultiListCommand(input, output, "Multi-list created.");
        } else {
            finishMultiListCommand(input, output, "Use mul(name:Child)list.", false);
        }

        return true;
    }

    if (output) {
        output.textContent = "Invalid command. Use items(...), itemlist(...), itemlistdel(...), or mul(name:Child)list.";
        output.classList.add("show");
    }

    return true;

}


function addMultiItem(list, text) {

    const now = Date.now();
    list.items.push({
        id: createId(),
        text,
        completed: false,
        createdAt: now,
        updatedAt: now,
        order: list.items.length
    });

}


function finishMultiListCommand(input, output, message, shouldSave = true) {

    if (shouldSave) {
        touchCurrentList();
        showMultiListPage();
        input.value = "";
    }

    if (output) {
        output.textContent = message;
        output.classList.add("show");
    }

}


function runMainMultiListCommand() {

    if (!homeCommandInput) {
        return false;
    }

    const match = homeCommandInput.value.trim().match(
        /^mul\s*\(\s*name\s*:\s*(.*?)\s*\)\s*list$/i
    );

    if (!match) {
        return false;
    }

    const name = match[1].trim();

    if (!name) {
        showHomeMessage("Enter a name: mul(name:XYZ)list");
        return true;
    }

    multiLists.push(makeMultiList(name));
    saveMultiLists();
    renderMultiListCards();
    homeCommandInput.value = "";
    showHomeMessage(`Multi-list “${name}” created.`);

    return true;

}


document.addEventListener("click", event => {

    const target = event.target;

    if (!target.closest) {
        return;
    }

    const multiListButton = target.closest("[data-open-multi-list]");
    if (multiListButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openMultiList(multiListButton.dataset.openMultiList);
        return;
    }

    const mainRunButton = target.closest("#homeRunCommandBtn");
    if (mainRunButton && runMainMultiListCommand()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }

    if (!currentPath.length) {
        return;
    }

    const childListButton = target.closest("[data-open-child-multi-list]");
    if (childListButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        currentPath.push(childListButton.dataset.openChildMultiList);
        showMultiListPage();
        return;
    }

    if (target.closest("#backBtn")) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (currentPath.length > 1) {
            currentPath.pop();
            showMultiListPage();
        } else {
            closeMultiListPage();
        }

        return;
    }

    if (target.closest("#addItemBtn")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        createCurrentEntry();
        return;
    }

    if (target.closest("#listSettingsBtn")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openListSettings();
        return;
    }

    if (target.closest("#saveSettingsBtn")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        saveListSettings();
        return;
    }

    if (target.closest("#deleteListBtn")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        deleteCurrentMultiList();
        return;
    }

    const checkbox = target.closest(".item-checkbox");
    if (checkbox) {
        event.preventDefault();
        event.stopImmediatePropagation();
        changeCurrentItem(checkbox.dataset.id, "toggle");
        return;
    }

    const deleteButton = target.closest(".delete-item");
    if (deleteButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        changeCurrentItem(deleteButton.dataset.id, "delete");
        return;
    }

    const commandRunButton = target.closest("#listRunCommandBtn");
    if (commandRunButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        executeMultiListCommand();
    }

}, true);


document.addEventListener("keydown", event => {

    if (event.key === "Enter" && event.target === homeCommandInput && runMainMultiListCommand()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }

    if (!currentPath.length) {
        return;
    }

    if (event.key === "Enter" && event.target === itemInput) {
        event.preventDefault();
        event.stopImmediatePropagation();
        createCurrentEntry();
        return;
    }

    if (event.key === "Enter" && event.target?.id === "listCommandInput") {
        event.preventDefault();
        event.stopImmediatePropagation();
        executeMultiListCommand();
    }

}, true);


document.addEventListener("dblclick", event => {

    if (!currentPath.length || !event.target.closest) {
        return;
    }

    const itemText = event.target.closest(".item-text");

    if (itemText) {
        event.preventDefault();
        event.stopImmediatePropagation();
        renameCurrentItem(itemText.dataset.id, itemText);
    }

}, true);


document.addEventListener("drop", event => {

    if (!currentPath.length || !itemsContainer || !event.target.closest) {
        return;
    }

    const targetItem = event.target.closest(".item");
    const draggedId = event.dataTransfer?.getData("text/plain");

    if (!targetItem || !draggedId || draggedId === targetItem.dataset.id) {
        return;
    }

    const list = currentMultiList();
    const draggedIndex = list?.items.findIndex(item => item.id === draggedId) ?? -1;
    const targetIndex = list?.items.findIndex(item => item.id === targetItem.dataset.id) ?? -1;

    if (!list || draggedIndex < 0 || targetIndex < 0) {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const [draggedItem] = list.items.splice(draggedIndex, 1);
    const adjustedTargetIndex = list.items.findIndex(item => item.id === targetItem.dataset.id);
    const rect = targetItem.getBoundingClientRect();
    const insertAfter = event.clientY >= rect.top + rect.height / 2;

    list.items.splice(
        adjustedTargetIndex + (insertAfter ? 1 : 0),
        0,
        draggedItem
    );

    list.items.forEach((item, index) => {
        item.order = index;
    });

    touchCurrentList();
    showMultiListPage();

}, true);


if (listsContainer) {

    const observer = new MutationObserver(renderMultiListCards);
    observer.observe(listsContainer, { childList: true });
    renderMultiListCards();

}
