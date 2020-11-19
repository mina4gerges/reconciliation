// TODO consider refactor elsewhere
// constants for events
import { attributes, items, list1, list2 } from "./model";
import { getStorageItem, setStorageItem } from "./utils";

export const EVENT_ANIMATION_SPEED_CHANGE = "CHANGED_ANIMATION_SPEED";
export const EVENT_CLICKED = "CLICKED"; // user clicked on something
export const EVENT_DATASET_CHANGE = "CHANGED_DATASET";
// export const EVENT_DEMO_RESUME = "RESUMED_DEMO";
export const EVENT_DEMO_START = "STARTED_DEMO";
export const EVENT_LIST_ACCEPTED = "ACCEPTED_LIST";
export const EVENT_LIST_REJECTED = "REJECTED_LIST";
export const EVENT_LIST_UNDECIDED = "UNDECIDED_LIST";
export const DATA_DEMO_END_STATE = "DEMO_END_STATE"; // state of dataset + what was accepted - Note: assumes that demo
// end does not include undecided items
export const EVENT_SIGNED_OFF = "SIGNED_OFF"; // user finished demo
export const EVENT_STATE_CHANGE = "CHANGED_STATE";
export const EVENT_SCROLLED = "SCROLLED"; // user scrolled in some direction
// export const EVENT_VERSION_CHANGE = "CHANGED_VERSION";
export const EVENT_MODIFY_PANEL_START = "MODIFY_PANEL_START";
// export const EVENT_MODIFY_PANEL_END = "MODIFY_PANEL_END";
export const EVENT_COLUMN_ACTION = "COLUMN_ACTION";

export function loggerInit() {
    if (getStorageItem(LOG) === null) {
        setStorageItem(LOG, "");
    }

    if (getStorageItem(ENTRY_NUMBER) === null) {
        setStorageItem(ENTRY_NUMBER, 0);
    }
}

export function log(eventType, entry) {
    if (getStorageItem(LOG) === null) {
        setStorageItem(LOG, "");
    }

    // setStorageItem(LOG, getStorageItem(LOG) + '[' + entryID() + ']' + "\t" + dateString(new Date()) + "\t" +
    // eventType + "\t" + entry + "\n");
    setStorageItem(LOG, `${getStorageItem(LOG)} [${entryID()}] \t ${dateString(new Date())} \t ${eventType} \t ${entry} \n}`);
}

export function dump() {
    console.log("-- START LOG DUMP --------------------------------" +
        "\n" + getStorageItem(LOG) +
        "-- END LOG DUMP ----------------------------------" +
        "\n");
}

export function dateString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let ms = date.getUTCMilliseconds();

    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    ms = ms < 10 ? "00" + ms : (ms < 100 ? "0" + ms : ms);

    return year + "-" + month + "-" + day + " " +
        date.toLocaleTimeString() + ":" + ms;
}

/* Given a item's id, return a human-readable string of the item:
 * 	e.g. "temazepam 15 mg PO qHS"
 */
function simpleItemString(id) {
    let item = items[id];

    let str = item.getNames().recorded;

    for (let attributeName in item.attributes) {
        if (attributes[attributeName].display) {
            str += " " + item.attributes[attributeName].toString();
        }
    }
    return str;
}

/* Given a item's id, return a human-readable string of the item,
 *  with information about the source list and whether it is modified
 * 	e.g. "(Hospital) * temazepam 15 mg PO qHS"
 */
export function itemString(id) {
    let item = items[id];
    let list = item.listID === list1.id ? list1.name :
        list2.name;

    let star = "";
    if (item.isModified)
        star = " * "

    return "(" + list + ") " + star + simpleItemString(id);
}

// hidden ////////////////////////////////////////////////////////////////
let LOG = "__LOG__";
let ENTRY_NUMBER = "__ENTRY_NUMBER__";

/* increment and return a log entry number (unique for each log entry) */
export function entryID() {
    let entryNumber = getStorageItem(ENTRY_NUMBER);
    setStorageItem(ENTRY_NUMBER, ++entryNumber);

    return entryNumber;
}

// expose interface //////////////////////////////////////////////////
