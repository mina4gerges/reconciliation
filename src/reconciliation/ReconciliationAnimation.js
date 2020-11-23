import React from "react";

import {
    AFTER_ACTION_REMOVE,
    afterAction,
    ATTR_DOSE,
    ATTR_NAME,
    ATTR_SUBITEM,
    attributes,
    displayName,
    getIdentical,
    getRelated,
    getRelatedSet,
    getShadowed,
    getShadows,
    getSimilar,
    groupBy,
    hidden,
    identical,
    items,
    list1,
    list2,
    multigroup,
    RECORDED_NAME,
    shadowsToItems,
    similar,
    unique1,
    unique2,
    viewDataModel,
} from './ReconciliationModel';

let LIST_1_INDEX = 1;
let LIST_2_INDEX = 3;
let LIST_2_UNIQUE_INDEX = 4;
let LIST_1_UNIQUE_INDEX = 0;
let LIST_IDENTICAL_INDEX = 2;

let NUM_ROWS = {};
let NUM_COLUMNS = 5;
let STATE_UNIQUE = 2;
let STATE_SIMILAR = 3;
let STATE_COMPACT = 4;
let STATE_SEPARATE = 0;
let STATE_IDENTICAL = 1;
let BASE_ANIMATION_DURATION = 800;
let PANEL_DELAY = BASE_ANIMATION_DURATION * 2;
let ANIMATION_SPEED_0 = "__ANIMATION_SPEED_0__";
let ANIMATION_SPEED_3 = "__ANIMATION_SPEED_3__";
let CUSTOM_EASE_IN = "cubic-bezier(0.4, 0.2, 0.1, 0.9)";
let ANIMATION_SPEED_COEFFICIENTS = [0, 1.5, 1.25, 1, 0.75, 0.5];

// config - animation
let AUTO_ANIMATE_ON = "__AUTO_ANIMATE_ON__";
// let AUTO_ANIMATE_OFF = "__AUTO_ANIMATE_OFF__";
let AUTO_ANIMATE_END = "__AUTO_ANIMATE_END__";

let animationSpeed = 0;
let animationDuration = 0;
let animationDelay = 0;
export let toggleOnDelay = 0;
export let toggleOffDelay = 0;

let autoAnimate = AUTO_ANIMATE_ON;

// whether the mousedown is because of touch
let touchEvent = false;
// last item that was touched (not clicked)

let viewData = {};

/*
 * viewData:
 * Information about what to display. Populated in model.viewData and
 * in calculatePositions. Consists of:
 *
 *      // for each group, the ids (including shadows) in that group
 *      groups: {
 *          <group1name>: [id, id, ...],
 *          <group2name>: [id, id, ...],
 *          <group3name>: [id, id, ...],
 *          ...
 *      },
 *
 *      // keys to the groups array (in the order they should be accessed)
 *      groupRank: [<group1name>, <group2name>, ...],
 *
 *      groupLengths: {
 *          <group1>: {
 *              // within this group, id -> identical items
 *              // Note: is (one-way, i.e. if id1 identical to id2, only
 *              //  one entry: {id1: [id1, id2]} present)
 *              identicalMarker: {
 *                  <id1>: [<id1>, <identicalIds...>],
 *                  ...
 *              },
 *
 *              // within this group, for each state, the height of each row
 *              // e.g. [1,2,1] means first set takes 1 row, next (maybe a
 *              //  similar set) takes 2, last takes 1.
 *              //  populated in calculatePositions, used for row coloring
 *              rowSetLen: {
 *                  <STATE>: [<set1length>, <set2length>, ...],
 *                  ...
 *              },
 *
 *              // for each state, what row this group starts on
 *              // populated in calculatePositions
 *              startRow: {
 *                  <STATE>: <start row for STATE>,
 *                  ...
 *              },
 *
 *              // within this group, the ids (including shadows) that are
 *              // unique1 at the end. Used to help figure out the size of
 *              // the background block coloring in STATE_COMPACT as well as
 *              // for column actions
 *              unique1: [id, id, ...],
 *
 *              // same as above, but for unique2
 *              unique2: [id, id, ...]
 *          },  // end of <group1>
 *          ...
 *      } // end of groupLengths
 *
 *      // function that retrieves all ids as a single list (in rank order)
 *      getAll()
 */

let hoverSet = {};

// diagnoses that are being hovered (due to mouseover an item)

let state = STATE_SEPARATE;

/*
 * Stores item locations for different states - used during animateItem
 * e.g. positions[id][state] -> {
 *     'row': <row of "id" in "STATE">,
 *     'col': <column of "id" in "STATE">}
 */
let positions = {};

let linkAction = {};

export const initAnimation = (dontRedraw, animate) => {
    autoAnimate = animate;

    // fetch data to display
    viewData = viewDataModel(true, true);

    // prepare interface
    prepareDOM();
    // prepare backdrop and interface (e.g. create items)
    prepareTransitions();
    // calculate item position information and animation delay time
    resetLinkActionFlags();

    // set up auto animation
    if (autoAnimate === AUTO_ANIMATE_ON)
        setTimeout(() => {
            changeState(STATE_COMPACT);

        }, PANEL_DELAY);
    else if (autoAnimate === AUTO_ANIMATE_END)
        setTimeout(() => {
            setAnimationSpeed(ANIMATION_SPEED_0);
            changeState(STATE_COMPACT, true);
        }, 0);

    redraw(true, true, false, true);
}

const prepareDOM = () => {
    const elementsShadow = document.getElementsByClassName('shadow');
    const elementsConditional = document.getElementsByClassName('conditional');

    for (let i = 0; i < elementsShadow.length; i++) {
        let elementShadow = elementsShadow[i];
        elementShadow.style.display = "none";
    }

    for (let j = 0; j < elementsConditional.length; j++) {
        let elementConditional = elementsConditional[j];
        elementConditional.style.display = "none";
    }
}

// prepare information necessary for state transitions
const prepareTransitions = () => {
    // prepare positions data structure
    calculatePositions();

    // prepare animation speed
    setAnimationSpeed(ANIMATION_SPEED_3);
}

export const populateBackdrop = () => {

    let tr = [];

    let actions = {
        keep: "accepted",
        reject: "rejected",
        clear: "undecided"
    };

    for (let i = 0; i < NUM_COLUMNS; i++) {
        let ul = [];
        let name;

        // column name
        switch (i) {
            case LIST_1_UNIQUE_INDEX:
                name = <div className='name'>{`${list1.name} unique`}</div>;
                break;
            case LIST_1_INDEX:
                name = <div className='name'>{list1.name}<span className="conditional"> similar</span></div>;
                break;
            case LIST_IDENTICAL_INDEX:
                name = <div className='name'>Identical</div>;
                break;
            case LIST_2_INDEX:
                name = <div className='name'>{list2.name}<span className="conditional"> similar</span></div>;
                break;
            case LIST_2_UNIQUE_INDEX:
                name = <div className='name'>{`${list2.name} unique`}</div>;
                break;
            default:
                break
        }

        for (let action in actions) {

            ul.push(
                <li id={`${action}-${i}`}>
                    <a href='#fake' className={action} data-dst={actions[action]} data-index={i}
                       onClick={processColumn}>
                        {action === "clear" ? action : `${action} rest`}
                    </a>
                </li>
            );
        }

        let action = <div className='action'>
            <ul>{ul}</ul>
        </div>

        tr.push(
            <th>
                <div className='col-header'>{name}{action}</div>
            </th>
        )
    }

    return <thead id='bg-thead' className='bg-accent'>
    <tr>{tr}</tr>
    </thead>;

}

export const populateItems = newItems => {

    let displayItems = [];

    // populate all items and shadows
    Object.keys(newItems).forEach(id => {

        let item = newItems[id];
        let differences = [];
        let itemClassNames = [];

        itemClassNames.push('name');

        if (id in similar) {
            differences = similar[id].differences;

            if (differences.indexOf(ATTR_NAME) !== -1)
                itemClassNames.push('difference');
        }

        let detail = []

        Object.keys(item.attributes).forEach(attribute => {

            if (attributes[attribute].display) {
                let detailClassNames = [];

                if (id in similar)
                    if (differences.indexOf(attribute) !== -1)
                        detailClassNames.push('difference');

                detail.push(
                    <span className={detailClassNames.join(" ")}>
                        {item.attributes[attribute].toString()}
                </span>
                )
            }
        })

        displayItems.push(
            <div id={id} className={`item undecided ${item.isShadow ? 'shadow' : ''}`} onMouseOut={mouseoutHandler}
                 onMouseOver={mouseoverHandler(id)} onMouseDown={mousedownHandler(id)}>
                <div className='header'>
                    <span className={itemClassNames.join(" ")}>{
                        item.name}
                    </span>
                </div>
                <div className='detail'>
                    {detail}
                </div>
            </div>
        );
    })

    return displayItems;
}

/*
 * Compute positions of items at each state based on contents of viewData
 * Update viewData.groupLengths[groupKey].startRow
 * Update NUM_ROWS
 *
 * Preconditions:
 *      viewData has been appropriately populated (with groups)
 *
 * Postconditions:
 *      positions data structure populated such that positions[id][state]
 *          returns {'row': rowIndex, 'col': colIndex} for item "id" in
 *      viewData.groupLengths[groupKey].startRow populated so that
 *          viewData.groupLengths[groupKey].startRow[STATE] returns the row
 *          group "groupKey" starts on in state "STATE"
 *      viewData.groupLengths[groupKey].rowSetLen[STATE] populated so that
 *          it contains a list of lengths of sets (e.g. [1,1,2,1] means
 *          the 3rd set consumes 2 rows)
 *      NUM_ROWS data structure populated with number of rows needed in
 *          TwinList for each state
 *
 * Algorithm summary:
 *  viewData contains information about for each group (if none is default
 *  group) what ids to display
 *  for each id within a group, need to figure out row positions for
 *  the following states:
 *  (Note: col is just computed based on source list and whether identical)
 *
 *  STATE_SEPARATE:
 *    keep track of next row to put something for each source list
 *
 *  STATE_SIMILAR:
 *    consider each item in a "set" with relevant items (e.g. identical and
 *    similar) align this "set" on a set of rows
 *
 *  STATE_COMPACT:
 *    keep track of next row for the unique and identical columns, group
 *    similar sets at the bottom
 *
 *  NUM_ROWS is calculated at the end (maximum row reached in each state)
 *  This becomes an offset for the next group (next group starts where this
 *  one ended)
 *
 *  Note: currently, items only move into their similar position, then
 *   compact position. This makes it so group labels are invalid for identical
 *   and unique states (e.g. during unique state, the height of a previous
 *   group might change, which would require shifting later groups down).
 *   But, this invalidity is ok because it maintains that only relevant items
 *   animate during a state (e.g. in state unique: "unique move to sides",
 *   NOT "unique move to sides and stuff moves down")
 * // TODO identical items that are similar to something else, probably just putting identical items in col 2 and not updating row if already there
 */
const calculatePositions = () => {

    // populate NUM_ROWS
    NUM_ROWS = {};
    NUM_ROWS[STATE_SEPARATE] = 0;
    NUM_ROWS[STATE_IDENTICAL] = 0;
    NUM_ROWS[STATE_UNIQUE] = 0;
    NUM_ROWS[STATE_SIMILAR] = 0;
    NUM_ROWS[STATE_COMPACT] = 0;

    // num rows for before starting current group (used to calculate length
    // of a group)
    let numRowsPrev = {};

    // clear rows
    positions = {};

    // for each group, in rank order:
    Object.keys(viewData.groupRank).forEach(groupKeyIndex => {

        let groupKey = viewData.groupRank[groupKeyIndex];

        // get the list of visible ids
        let group = viewData.groups[groupKey];

        // save current maxes
        numRowsPrev[STATE_SEPARATE] = NUM_ROWS[STATE_SEPARATE];
        numRowsPrev[STATE_IDENTICAL] = NUM_ROWS[STATE_IDENTICAL];
        numRowsPrev[STATE_UNIQUE] = NUM_ROWS[STATE_UNIQUE];
        numRowsPrev[STATE_SIMILAR] = NUM_ROWS[STATE_SIMILAR];
        numRowsPrev[STATE_COMPACT] = NUM_ROWS[STATE_COMPACT];

        // various variables to keep track of what has been calculated so far
        // as we calculate positions for this group
        let separateNextRow = {
            "-1": NUM_ROWS[STATE_SEPARATE],
            "1": NUM_ROWS[STATE_SEPARATE]
        };

        let similarNextRow = {
            "-1": NUM_ROWS[STATE_SIMILAR],
            "1": NUM_ROWS[STATE_SIMILAR]
        };

        // start position for similar group in compact state
        let similarStart = (NUM_ROWS[STATE_COMPACT] + Math.max(viewData.groupLengths[groupKey].unique1.length, viewData.groupLengths[groupKey].unique2.length, Object.keys(viewData.groupLengths[groupKey].identicalMarker).length));

        let compactNextRow = {
            "unique": {
                "-1": NUM_ROWS[STATE_COMPACT],
                "1": NUM_ROWS[STATE_COMPACT]
            },
            "similar": {
                "-1": similarStart,
                "1": similarStart
            },
            "identical": NUM_ROWS[STATE_COMPACT]
        }

        // save starting row for this group (using jQuery extend to make deep copy of NUM_ROWS)
        viewData.groupLengths[groupKey].startRow = Object.assign({}, NUM_ROWS);

        // initialize structure for row set lengths for this group
        viewData.groupLengths[groupKey].rowSetLen = {};
        viewData.groupLengths[groupKey].rowSetLen[STATE_SIMILAR] = [];
        viewData.groupLengths[groupKey].rowSetLen[STATE_COMPACT] = [];

        // hash of ids already processed, used to skip ids that are
        //  processed out of order
        let processed = {};

        // for each item in this group:
        for (let i = 0; i < group.length; i++) {
            // get the id and non-shadow (true) id
            let id = group[i];

            // either get existing positions data (may have been partially
            // calculated from out of order processing) or initialize
            positions[id] = positions[id] || {};

            // which side is this item on (if non-identical) - e.g. left or right side
            let side = items[id].listID === list1.id ? -1 : 1;

            // for every item, set the row and column in the separate state
            positions[id][STATE_SEPARATE] = {
                'row': separateNextRow[side.toString()]++, // set equal to value before increment
                'col': LIST_IDENTICAL_INDEX + side,         // Note: assumed identical column in center
            }

            // determine whether identical or similar
            let identicalSet = getIdentical(id, true);
            let similarSet = getSimilar(id, true);

            // make value false-y if empty, otherwise include id
            identicalSet = identicalSet.length === 0 ? undefined : [id].concat(identicalSet);
            similarSet = similarSet.length === 0 ? undefined : [id].concat(similarSet);

            if (identicalSet) {

                // if not already processed out of order, calculate the
                //  positions for the other states
                if (!processed[id]) {

                    // calculate similar and compact states' row,col for
                    //  each identical item

                    for (let j in identicalSet) {
                        let identicalItemId = identicalSet[j];

                        // skip processing of things not in same group
                        // Note: possible because shadows should be in
                        //  separate groups
                        if (group.indexOf(identicalItemId) >= 0) {

                            // (already exists if identicalItemId == id)
                            positions[identicalItemId] = positions[identicalItemId] || {};

                            // reference to "identical item position data" (abbrev.)
                            let iIPD = positions[identicalItemId];

                            // in similar (pre compact) state - will all be
                            //  at the same row, in identical column and
                            //  will stay in that position until compact state
                            iIPD[STATE_IDENTICAL] = {
                                'row': similarNextRow["-1"],
                                'col': LIST_IDENTICAL_INDEX
                            };

                            iIPD[STATE_UNIQUE] = iIPD[STATE_IDENTICAL];

                            iIPD[STATE_SIMILAR] = iIPD[STATE_UNIQUE];

                            // in compact state - will be in the next
                            //  identical row available
                            iIPD[STATE_COMPACT] = {
                                'row': compactNextRow.identical,
                                'col': LIST_IDENTICAL_INDEX
                            };

                            // mark item as already processed
                            processed[identicalItemId] = true;
                        }
                    }

                    // every identical item uses up one entire row in similar state
                    similarNextRow["-1"]++;
                    similarNextRow["1"]++;

                    // every identical item uses up one identical row in compact state
                    compactNextRow.identical++;

                    // identical set consumed 1 row in similar state
                    viewData.groupLengths[groupKey].rowSetLen[STATE_SIMILAR].push(1);
                }

            } else if (similarSet) {

                // calculate this item's identical state and unique state positions
                // (same as its position in separate)
                positions[id][STATE_IDENTICAL] = {
                    'row': positions[id][STATE_SEPARATE].row,
                    'col': positions[id][STATE_SEPARATE].col
                };

                positions[id][STATE_UNIQUE] = {
                    'row': positions[id][STATE_SEPARATE].row,
                    'col': positions[id][STATE_SEPARATE].col
                };

                if (!processed[id]) {

                    // sort so processed in same order currently in viewData group
                    similarSet = similarSet.sort((a, b) => {
                        return group.indexOf(a) - group.indexOf(b);
                    });

                    // calculate similar and compact states' row + col for
                    // each similar item (including this item)

                    // save to figure out afterwards how many rows consumed
                    let lenBeforeSet = similarNextRow["-1"];

                    for (let j in similarSet) {
                        let similarItemId = similarSet[j];

                        if (group.indexOf(similarItemId) >= 0) {

                            positions[similarItemId] = positions[similarItemId] || {};

                            // reference to "similar item position data" (abbrev.)
                            let sIPD = positions[similarItemId];
                            let simSide = items[similarItemId].listID === list1.id ? -1 : 1;

                            sIPD[STATE_SIMILAR] = {
                                'row': similarNextRow[simSide.toString()]++,
                                'col': LIST_IDENTICAL_INDEX + simSide
                            };

                            // in compact state - will be in the next identical row available
                            sIPD[STATE_COMPACT] = {
                                'row': compactNextRow.similar[simSide.toString()]++,
                                'col': LIST_IDENTICAL_INDEX + simSide
                            };

                            processed[similarItemId] = true;
                        } // else don't process yet - not in same group
                    }

                    // re-align next similar positions (for similar and compact state)
                    let newSimilarStart = Math.max(similarNextRow["-1"], similarNextRow["1"]);
                    similarNextRow["-1"] = newSimilarStart;
                    similarNextRow["1"] = newSimilarStart;

                    let newCompactStart = Math.max(compactNextRow.similar["-1"], compactNextRow.similar["1"]);
                    compactNextRow.similar["-1"] = newCompactStart;
                    compactNextRow.similar["1"] = newCompactStart;

                    // figure out how many rows consumed
                    viewData.groupLengths[groupKey].rowSetLen[STATE_SIMILAR].push(newSimilarStart - lenBeforeSet);
                    viewData.groupLengths[groupKey].rowSetLen[STATE_COMPACT].push(newSimilarStart - lenBeforeSet);
                }
            } else {

                // unique

                // identical state is same as separate state
                positions[id][STATE_IDENTICAL] = positions[id][STATE_IDENTICAL] || {};

                positions[id][STATE_IDENTICAL] = positions[id][STATE_SEPARATE];

                positions[id][STATE_SIMILAR] = {
                    'row': similarNextRow[side]++,
                    'col': LIST_IDENTICAL_INDEX + (2 * side)
                };
                similarNextRow[(-1 * side).toString()]++;
                // align similar next rows

                positions[id][STATE_UNIQUE] = positions[id][STATE_SIMILAR];

                positions[id][STATE_COMPACT] = {
                    'row': compactNextRow.unique[side.toString()]++,
                    'col': LIST_IDENTICAL_INDEX + (2 * side)
                };

                // uniques consume 1 row
                viewData.groupLengths[groupKey].rowSetLen[STATE_SIMILAR].push(1);
            }

            // update maximum num rows
            NUM_ROWS[STATE_SEPARATE] = Math.max(NUM_ROWS[STATE_SEPARATE], positions[id][STATE_SEPARATE]['row'] + 1);
            NUM_ROWS[STATE_IDENTICAL] = Math.max(NUM_ROWS[STATE_IDENTICAL], positions[id][STATE_IDENTICAL]['row'] + 1);
            NUM_ROWS[STATE_UNIQUE] = Math.max(NUM_ROWS[STATE_UNIQUE], positions[id][STATE_UNIQUE]['row'] + 1);
            NUM_ROWS[STATE_SIMILAR] = Math.max(NUM_ROWS[STATE_SIMILAR], positions[id][STATE_SIMILAR]['row'] + 1);
            NUM_ROWS[STATE_COMPACT] = Math.max(NUM_ROWS[STATE_COMPACT], positions[id][STATE_COMPACT]['row'] + 1);
        } // end of for each item in group
    }) // end of for each group
}// end of calculatePositions

/*
 * sort - whether to apply sort
 * filter - whether to apply filter
 * immediate - whether to move all items into final positon or use changeState
 * jumpToPosition - whether to jump to position or animate transition
 */
export const redraw = (sort, filter, immediate, jumpToPosition) => {

    viewData = viewDataModel(sort, filter);

    calculatePositions();

    changeState(state, jumpToPosition);
}

export const changeState = (toState, jumpToPosition) => {

    if (state === toState)
        transition(state, state, jumpToPosition);
    else {
        if (animationSpeed === ANIMATION_SPEED_0)
            // no animation, jump to destination state
            transition(toState, toState, jumpToPosition);
        else {
            let offset = (state < toState) ? 1 : -1;
            let i = state;

            while (i !== toState) {
                transition(state, i + offset, jumpToPosition);
                i += offset;
            }
        }

        state = toState;
    }
}

/*
 * Handle transition between states
 * queue all transitions with timed delays
 *
 * in each transition:
 *      update row coloring
 *      animate item position
 */
const transition = (from, to, jumpToPosition) => {
    let delay = 0;

    if (from < to)
        delay = transitionDelay(state, to - 1);
    else if (from > to)
        delay = transitionDelay(state, to + 1);

    setTimeout(() => {

        adjustAnimationControls(to);
        adjustColumnHeaders(from, to);
        adjustDifferenceHighlights(to);

        if (to > from)
            if (to === STATE_IDENTICAL)
                animateIdentical(to, jumpToPosition);
            else if (to === STATE_UNIQUE)
                animateUnique(to, jumpToPosition);
            else
                animateDefault(to, jumpToPosition);

        else
            animateDefault(to, jumpToPosition);

    }, delay);
}

const animateIdentical = (toState, jumpToPosition) => {
    let i = 0;
    let checked = {}, animated = {};

    Object.keys(identical).forEach(id => {

        if (checked[id] === undefined) {
            let set = identical[id];

            for (let j = 0; j < set.length; j++) {
                let checkID = set[j];

                if (items[checkID].isShadowed)
                    set = set.concat(getShadows(checkID));

            }
            checked[id] = true;

            for (let j = 0; j < set.length; j++) {
                checked[set[j]] = true;
            }
            animateSet(set, toState, (i > 0) ? (i * animationDuration) + (i * animationDelay) : 0, animated, jumpToPosition);
            i++;
        }
    })
}

const animateUnique = (toState, jumpToPosition) => {
    let tempUnique1 = unique1, tempUnique2 = unique2;

    for (let i = 0; i < unique1.length; i++) {
        let id = unique1[i];
        let item = items[id];

        if (item.isShadowed)
            tempUnique1 = tempUnique1.concat(getShadows(id));
    }

    for (let i = 0; i < unique2.length; i++) {
        let id = unique2[i];
        let item = items[id];

        if (item.isShadowed)
            tempUnique2 = tempUnique2.concat(getShadows(id));
    }

    // animate left first, then right
    animateSet(tempUnique1, toState, 0, jumpToPosition)
    animateSet(tempUnique2, toState, animationDuration + animationDelay, jumpToPosition);
}

const animateDefault = (toState, jumpToPosition) => {
    let duration;

    if (jumpToPosition)
        duration = 0;

    let items = document.getElementsByClassName('item');

    for (let i = 0; i < items.length; i++) {
        animateItem(items[i].id, toState, duration);
    }

}

const animateSet = (set, toState, delay, animated, jumpToPosition) => {

    let duration;

    if (jumpToPosition)
        duration = 0;

    setTimeout(() => {
        for (let i = 0; i < set.length; i++) {
            let id = set[i];

            if (animated) {
                if (animated[id] === undefined) {
                    animated[id] = true;
                    animateItem(id, toState, duration);
                }
            } else {
                animateItem(id, toState, duration);
            }
        }
    }, delay);
}

const animateItem = (id, toState, duration) => {
    // skip items that did not have positions calculated in viewData
    if (!positions[id] || !positions[id][toState])
        return;

    let animatedItem = document.getElementById(id);

    let position = (toState !== undefined) ? offsetToPosition(positions[id][toState]) : offsetToPosition(positions[id]);

    animatedItem.animate({
        left: `${position.x}px`,
        top: `${position.y}px`,
    }, {
        fill: 'forwards',
        easing: CUSTOM_EASE_IN,
        duration: (duration === undefined) ? animationDuration : duration,
    });

    let trueId = items[id].isShadow ? parseInt(shadowsToItems[id]) : id;

    // for simplicity, hide identical shadows that are from the right column

    let item = items[id];

    // handle identical overlap
    if (trueId in identical) {
        if (state < STATE_IDENTICAL) {
            if (id in hidden) {
                delete hidden[id];
            }
        } else {
            if (item.isShadow) {
                if (item.listID === list2.id) {
                    // only hide shadows if in right column and has an identical in left column
                    let identicalItems = getIdentical(id, true);
                    for (let i = 0; i < identicalItems.length; i++) {
                        let identicalItem = items[identicalItems[i]];
                        if (item.attributes[groupBy][item.groupByOffset] === identicalItem.attributes[groupBy][identicalItem.groupByOffset]) {
                            hidden[id] = true;
                            break;
                        }
                    }
                } // else don't hide
            } else {
                // for non-shadow, just check if in first position of identical
                if (identical[id].indexOf(parseFloat(id)) !== 0) {
                    hidden[id] = true;
                }
            }
        }
    }
}

const columnWidth = () => {
    return document.querySelectorAll('.backdrop-header tr')[0].clientWidth / 5;
}

const rowHeight = () => {
    return document.querySelectorAll('.backdrop td')[0].clientWidth / 5;
}

// given offset information (which row/column), convert into (x,y) position info for css "top" and "left"
const offsetToPosition = offset => {
    return {
        x: offset.col * columnWidth() + 18,
        y: (offset.row * rowHeight())
    };
}

const transitionDelay = (from, to) => {
    let delay = 0;

    if (from < to) {
        for (let i = from + 1; i <= to; i++) {
            if (i === STATE_IDENTICAL)
                delay += transitionIdenticalDelay();
            else if (i === STATE_UNIQUE)
                delay += 2 * (animationDuration + animationDelay);
            else
                delay += animationDuration + animationDelay;

        }
    } else if (from > to)
        for (let i = from; i >= to + 1; i--) {
            delay += animationDuration + animationDelay;
        }

    return delay;
}

const transitionIdenticalDelay = () => {
    let numSets = 0;
    let checked = {};

    Object.keys(identical).forEach(id => {
        if (checked[id] === undefined) {
            let set = getIdentical(id);
            checked[id] = true;

            for (let j = 0; j < set.length; j++) {
                checked[set[j]] = true;
            }
            numSets++;
        }
    })
    return (numSets * animationDuration) + (numSets * animationDelay);
}

/*
 * Given a speed, update delay times accordingly (and log it)
 * Params:
 *      String speed - defined constant
 * Returns:
 *      none
 */
const setAnimationSpeed = speed => {
    // adjust speed
    animationSpeed = speed;

    if (speed === ANIMATION_SPEED_0) {
        // use neutral (median) animation speed for single transition
        animationDuration = BASE_ANIMATION_DURATION * ANIMATION_SPEED_COEFFICIENTS[
            Math.floor(ANIMATION_SPEED_COEFFICIENTS.length / 2)];
    } else {
        let coefficient = speed.replace(/[^0-5]+/g, "");
        animationDuration = BASE_ANIMATION_DURATION * ANIMATION_SPEED_COEFFICIENTS[coefficient];
    }

    // adjust delays accordingly
    animationDelay = animationDuration * 0.75;
    toggleOnDelay = animationDelay / 4;
    toggleOffDelay = animationDelay * 1.5;

    adjustAnimationControls(state);
}

export const adjustBackdrop = toState => {

    let trs = [];

    for (let i = 0; i < NUM_ROWS[toState]; i++) {
        let tds = [];

        for (let j = 0; j < NUM_COLUMNS; j++) {
            tds.push(<td />)
        }

        trs.push(<tr>{tds}</tr>);
    }

    return trs;
}

const adjustColumnHeaders = (from, to) => {

    toggleHeader(LIST_1_UNIQUE_INDEX, to >= STATE_UNIQUE);
    toggleHeader(LIST_IDENTICAL_INDEX, to >= STATE_IDENTICAL);

    // match item animation: list 1 unique, then list 2 unique
    setTimeout(() => {
        toggleHeader(LIST_2_UNIQUE_INDEX, to >= STATE_UNIQUE);
    }, from >= to ? 0 : animationDuration + animationDelay);

}

/*
 * Given a state, adjust animation controls appropriately
 * "state" is one of the defined constants above
 */
const adjustAnimationControls = state => {
    let elements;

    elements = document.getElementsByClassName('separate');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active', 'inactive')
    }
    elements = document.getElementsByClassName('identical');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active', 'inactive')
    }
    elements = document.getElementsByClassName('unique');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active', 'inactive')
    }
    elements = document.getElementsByClassName('similar');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active', 'inactive')
    }
    elements = document.getElementsByClassName('compact');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active', 'inactive')
    }

    // let active = {};
    let inactive = {};

    if (groupBy) {
        inactive[STATE_IDENTICAL] = true;
        inactive[STATE_UNIQUE] = true;
        delete inactive[STATE_SIMILAR];
    } else {
        delete inactive[STATE_IDENTICAL];
        delete inactive[STATE_UNIQUE];
        delete inactive[STATE_SIMILAR];
    }

    for (let stateIndex in inactive) {
        elements = document.getElementsByClassName(stateIndexToName(parseInt(stateIndex)));

        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.add('inactive')
        }
    }

    elements = document.getElementsByClassName(stateIndexToName(state));

    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('inactive')
        elements[i].classList.add('active')
    }

}

// given a state, adjust difference highlights on items
const adjustDifferenceHighlights = toState => {
    let elements;

    if (toState < STATE_SIMILAR) {
        elements = document.getElementsByClassName('difference');

        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("highlight")
        }
    } else {
        if (displayName !== RECORDED_NAME) {
            elements = document.querySelectorAll('.name.difference');
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.remove('highlight')
            }

            elements = document.querySelectorAll('.undecided .difference:not(.name)');
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add('highlight')
            }
        } else {
            elements = document.querySelectorAll('.undecided .difference');

            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add("highlight")
            }
        }
    }
}

const toggleHeader = (index, show) => {

    let header = document.querySelector(`.backdrop th:nth-child(${index + 1}) .col-header`)

    if (show)
        header.style.display = 'block';
    else
        header.style.display = 'none'
}

const stateIndexToName = index => {

    switch (index) {
        case STATE_SEPARATE:
            return "separate";
        case STATE_IDENTICAL:
            return "identical";
        case STATE_UNIQUE:
            return "unique";
        case STATE_SIMILAR:
            return "similar";
        case STATE_COMPACT:
            return "compact";
        default:
            return undefined;
    }
}

const mousedownHandler = id => e => {
    if (!touchEvent) {

        let clickType = '';

        if (e.button === 0)
            clickType = "left";
        else if (e.button === 2)
            clickType = "right";

        itemChange(id, clickType);
    }
}

/*
 * used by mousedown + swipe/tap to handle the user's decision for an item
 * itemId - id of item decided on
 * String clickType - type of click (indicates which direction to cycle)
 *      {"left", "right"}
 */
const itemChange = (itemId, clickType) => {

    let dst;

    const itemClicked = document.getElementById(itemId);

    // left click
    if (clickType === "left") {
        if (itemClicked.classList.contains('undecided'))
            dst = "accepted";
        else if (itemClicked.classList.contains("accepted"))
            dst = "rejected";
        else if (itemClicked.classList.contains("rejected"))
            dst = "undecided";
    }

    // right click
    else if (clickType === "right") {
        if (itemClicked.classList.contains("undecided"))
            dst = "rejected";
        else if (itemClicked.classList.contains("accepted"))
            dst = "undecided";
        else if (itemClicked.classList.contains("rejected"))
            dst = "accepted";
    }

    if (dst) {
        processItem(itemId, dst, false);

        if (afterAction === AFTER_ACTION_REMOVE)
            redraw(true, true);
    }
}

const mouseoverHandler = id => e => {

    e.preventDefault();

    let item = items[id];

    // hover appropriate item(s)
    let toHover = getRelatedSet(id, multigroup);

    for (let i = 0; i < toHover.length; i++) {
        let hoverID = toHover[i];
        hoverSet[hoverID] = true;
        hoverItem(hoverID, true);
    }

    for (let attributeName in attributes) {
        if (attributeName in item.attributes) {
            let values = item.attributes[attributeName];
            let valuesString = "";

            if (values.length > 1) {
                values = item.attributes[attributeName];

                for (let i = 0; i < values.length; i++) {

                    if (attributeName === ATTR_SUBITEM) {
                        let subItem = values[i];
                        let dose = subItem
                            .attributes[ATTR_DOSE];

                        valuesString += subItem.name + (dose ? " " + subItem.attributes[ATTR_DOSE] : "");
                    } else
                        valuesString += values[i];

                    valuesString += ", ";
                }
                valuesString = valuesString.slice(0, -2);
            } else
                valuesString = values.toString();

        }
    }

}

const mouseoutHandler = e => {

    e.preventDefault();

    for (let id in hoverSet) {
        hoverItem(id, false);
    }

    hoverSet = {};
}

// given an id and whether this is on mouseover, hover the item
const hoverItem = (id, mouseover) => {

    let item = items[id];
    let hoverItem = document.getElementById(id);

    if (mouseover) {
        hoverItem.classList.add("item-hover");

        if (item.isShadow)
            hoverItem.style.opacity = '0.6';
        else
            hoverItem.style.opacity = '1';

        if (hoverItem.classList.contains("undecided"))
            hoverItem.classList.add("undecided-hover");

    } else {
        hoverItem.classList.remove("item-hover");

        if (hoverItem.classList.contains("undecided"))
            hoverItem.classList.remove("undecided-hover");
    }
}

export const resetDecisions = () => {
    resetLinkActionFlags();

    state = STATE_SEPARATE;
}

const resetLinkActionFlags = () => {
    linkAction = {};

    for (let id in items) {
        linkAction[id] = true;
    }
}

const processItem = (id, dst, noLink) => {

    const itemClicked = document.getElementById(id);

    if (!itemClicked.classList.contains(dst))

        if (noLink)
            actOnItem(id, dst);
        else
            actOnSet(items[id].isShadow ? getShadowed(id) : id, dst);

}

const getItemsInColumn = (state, columnIndex) => {

    if (state === STATE_SEPARATE) {

        // in separate, return list1 or list2
        if (columnIndex === LIST_1_INDEX)
            return list1.source;
        else if (columnIndex === LIST_2_INDEX)
            return list2.source;

    } else if (state === STATE_IDENTICAL) {

        // in identical, return list1 or list2 with identical filtered out
        //  or return things in identical that are not hidden

        if (columnIndex === LIST_1_INDEX)
            return list1.source.filter(id => {
                return !(id in identical);
            })
        else if (columnIndex === LIST_IDENTICAL_INDEX)
            return Object.keys(identical).filter(id => {
                return !(hidden[id]);
            })
        else if (columnIndex === LIST_2_INDEX)
            return list2.source.filter(id => {
                return !(id in identical)
            })

    } else {

        // by state unique and up, all items in final columns
        // return data in columns filtering things out as needed

        if (columnIndex === LIST_1_UNIQUE_INDEX)
            return unique1;
        else if (columnIndex === LIST_1_INDEX)
            return list1.source.filter(id => {
                return !(id in identical) && unique1.indexOf(id) < 0;
            })
        else if (columnIndex === LIST_IDENTICAL_INDEX)
            return Object.keys(identical).filter(id => {
                return !(hidden[id]);
            })
        else if (columnIndex === LIST_2_INDEX)
            return list2.source.filter(id => {
                return !(id in identical) && unique2.indexOf(id) < 0;
            })
        else if (columnIndex === LIST_2_UNIQUE_INDEX)
            return unique2;
    }
}

// called to handle column actions (like "keep", "reject", "clear")
const processColumn = event => {

    event.preventDefault();

    let data = event.data ?? event.target.dataset;
    let index = parseInt(data.index);

    let col = getItemsInColumn(state, index)

    for (let j = 0; j < col.length; j++) {

        let id = col[j];
        // only act on items in this particular column and only act on undecided ones
        const item = document.getElementById(`${id}`);

        if (data.dst === 'undecided' || item.classList.contains('undecided'))
            processItem(id, data.dst, index !== LIST_IDENTICAL_INDEX);

    }

    if (col.length > 0 && afterAction === AFTER_ACTION_REMOVE)
        redraw(true, true);
}

const actOnSet = (id, dst) => {

    let identical = getIdentical(id);
    let similar = getSimilar(id);

    // always link actions on identical sets
    for (let i = 0; i < identical.length; i++) {
        actOnItem(identical[i], dst === "accepted" ? "rejected" : dst);
    }

    // only link actions on similar sets for the first click
    if (linkAction[id] && similar.length > 0) {
        for (let i = 0; i < similar.length; i++) {
            actOnItem(similar[i], dst === "undecided" ? "undecided" : "rejected");
        }

        if (dst === "rejected") {
            let related = getRelated(id);
            let next = related[0];

            if (next in identical) {
                // ensure that next is always visible
                next = identical[next][0];
            }
            actOnItem(next, "accepted");
        }
    }
    actOnItem(id, dst);
}

const actOnItem = (id, dst) => {
    // act on item
    decide(id, dst);

    // act on shadows
    let shadows = getShadows(id);

    for (let i = 0; i < shadows.length; i++) {
        decide(shadows[i], dst);
    }
}

const decide = (id, dst) => {

    let item = document.getElementById(id);
    let differences = item.getElementsByClassName('difference');
    let checkID = items[id].isShadow ? getShadowed(id) : id;

    item.classList.remove('accepted', 'rejected', 'undecided', 'undecided-hover')

    if (dst === "undecided") {
        if (id in hoverSet)
            item.classList.add("undecided-hover");

        if (state >= STATE_SIMILAR)
            for (let i = 0; i < differences.length; i++) {
                differences[i].classList.add("highlight");
            }

    } else
        for (let i = 0; i < differences.length; i++) {
            differences[i].classList.remove("highlight");
        }

    item.classList.add(dst);

    linkAction[id] = checkID in identical;
}
