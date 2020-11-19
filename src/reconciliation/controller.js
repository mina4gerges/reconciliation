import $ from 'jquery';

import {
    AFTER_ACTION_GRAYOUT,
    AFTER_ACTION_REMOVE,
    afterAction,
    ATTR_DOSE,
    ATTR_FREQUENCY,
    ATTR_NAME,
    ATTR_ROUTE,
    ATTR_SUBITEM,
    attributes,
    DEFAULT_GROUP,
    diagnosisSet,
    displayName,
    drugClassSet,
    getGroupBy,
    getIdentical,
    getRelated,
    getRelatedSet,
    getShadowed,
    getShadows,
    getShadowSet,
    getSimilar,
    groupBy,
    hidden,
    identical,
    items,
    list1,
    list2,
    multigroup,
    RECORDED_NAME,
    setFilterOn,
    setGroupBy,
    shadowsToItems,
    similar,
    unique1,
    unique2,
    viewDataModel,
} from './model';

let LIST_1_INDEX = 1;
let LIST_2_INDEX = 3;
let LIST_2_UNIQUE_INDEX = 4;
let LIST_1_UNIQUE_INDEX = 0;
let LIST_IDENTICAL_INDEX = 2;
/*
 * Keeps track of, for each state, how many rows are needed
 * Used to generate striped backdrop
 *  (necessary for item animation since top/left based on generated row heights)
 * populated in calculatePositions
 */
let NUM_ROWS = {};
let NUM_COLUMNS = 5;
let NUM_STATES = 5;
let STATE_UNIQUE = 2;
let STATE_SIMILAR = 3;
let STATE_COMPACT = 4;
let STATE_SEPARATE = 0;
let STATE_IDENTICAL = 1;
let BASE_ANIMATION_DURATION = 800;
let PANEL_DELAY = BASE_ANIMATION_DURATION * 2;
let ANIMATION_SPEED_0 = "__ANIMATION_SPEED_0__";
let ANIMATION_SPEED_1 = "__ANIMATION_SPEED_1__";
let ANIMATION_SPEED_2 = "__ANIMATION_SPEED_2__";
let ANIMATION_SPEED_3 = "__ANIMATION_SPEED_3__";
let ANIMATION_SPEED_4 = "__ANIMATION_SPEED_4__";
let ANIMATION_SPEED_5 = "__ANIMATION_SPEED_5__";
let CUSTOM_EASE_IN = "cubic-bezier(0.4, 0.2, 0.1, 0.9)";
let ANIMATION_SPEED_COEFFICIENTS = [0, 1.5, 1.25, 1, 0.75, 0.5];
// config - version
let VERSION_FULL = "__VERSION_FULL__";
let VERSION_BASELINE = "__VERSION_BASELINE__";
let VERSION_LINK_ONLY = "__VERSION_LINK_ONLY__";
let VERSION_THREE_COLUMN = "__VERSION_THREE_COLUMN__";
let VERSION_3COL_CLASSES = "__VERSION_3COL_CLASSES__";

// config - animation
let AUTO_ANIMATE_ON = "__AUTO_ANIMATE_ON__";
// let AUTO_ANIMATE_OFF = "__AUTO_ANIMATE_OFF__";
let AUTO_ANIMATE_END = "__AUTO_ANIMATE_END__";

let WHITE = "#fafafa";
let NEUTRAL_GRAY = "#f0f0f0";
let CONTRAST_GRAY = "#d9d6d0";

// animation speed ///////////////////////////////////////////////////
let animationSpeed = 0;
let animationDuration = 0;
let animationDelay = 0;
export let toggleOnDelay = 0;
export let toggleOffDelay = 0;
export let versionDefault = VERSION_FULL;
export let autoAnimateDefault = AUTO_ANIMATE_ON;

let version = VERSION_FULL;
let autoAnimate = AUTO_ANIMATE_ON;

// whether the mousedown is because of touch
let touchEvent = false;
// last item that was touched (not clicked)
let $lastTouchedItem;

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
let hoverDiagnosisSet = [];

// let groups = [];

let state = STATE_SEPARATE;

let showPatientTab = false;

/*
 * Stores item locations for different states - used during animateItem
 * e.g. positions[id][state] -> {
 *     'row': <row of "id" in "STATE">,
 *     'col': <column of "id" in "STATE">}
 */
let positions = {};

let linkAction = {};

let displayDetails = true;

// for debugging - whether to print item information on hover
let printHover = false;

export function initController(dontRedraw, interfaceVersion, animate) {
    // TODO might need string translation?
    version = interfaceVersion;
    autoAnimate = animate;

    // log(EVENT_DEMO_START, "dataset:" + getDatasetShortName(dataset) + ",version:" + getVersionShortName(version));

    if (version === VERSION_LINK_ONLY) {
        updateGroupBy("__ATTR_DRUG_CLASS__", true);
    } else {
        updateGroupBy("", true);
    }

    // fetch data to display
    viewData = viewDataModel(true, true);

    // prepare interface
    prepareDOM();
    // prepare backdrop and interface (e.g. create items)
    prepareTransitions();
    // calculate item position information and animation delay time
    prepareHandlers();
    resetLinkActionFlags();

    // put everything in place

    // TODO refactor - initialize number of times "decided" to 0
    // setStorageItem("decided", 0);

    // TODO hack (should be a supported by populate code)
    // show diagnoses column
    if (version === VERSION_THREE_COLUMN || version === VERSION_3COL_CLASSES)
        $(".backdrop th:nth-child(1) .col-header").show();

    // set up auto animation
    if (autoAnimate === AUTO_ANIMATE_ON) {
        setTimeout(function () {
            if (version === VERSION_FULL) {
                changeState(STATE_COMPACT);
            }
        }, PANEL_DELAY);
    } else if (autoAnimate === AUTO_ANIMATE_END) {
        setTimeout(function () {
            if (version === VERSION_FULL) {
                setAnimationSpeed(ANIMATION_SPEED_0);
                changeState(STATE_COMPACT, true);
            }
        }, 0);
    }
    redraw(true, true, false, true);
}

export function toggleItem(tempItem, delay, show) {
    let $item = $(tempItem);

    if (show) {
        if (hidden[$item.attr("id")] === undefined) {
            $item.show();

            if (!displayDetails) {
                $item.children(".detail").fadeOut();
                // $item.height($.browser.mozilla ? "1.75em" : "1.25em");
                $item.height("1.25em");
            }

            setTimeout(function () {
                if ($item.hasClass("shadow"))
                    $item.css("opacity", "0.6");
                else
                    $item.css("opacity", "1");

                // some item was hidden or shown, update review button
                // updateReviewButton();
            }, delay);
        }
    } else {
        setTimeout(function () {
            $item.css("opacity", 0);

            setTimeout(function () {
                $item.hide();
                $item.removeClass("undecided-hover item-hover");
                // TODO this will not appear real-time because identical items are not immediately hidden when
                // merged some item was hidden or shown, update review button
                // updateReviewButton();
            }, delay);
        }, delay);
    }
}

function prepareDOM() {
    populateBackdrop($(".backdrop-header"), $(".backdrop-body"));
    populateItems($(".items"));

    // start shadowing
    $(".shadow").hide();
    $(".conditional").hide();

    // remove jquery mobile loading div...
    // $(".ui-loader").remove();

    // clear
    // $(".backdrop thead").remove();
    // $(".backdrop tbody").remove();
    // $("#reconciliation .item").remove();
    // $("#reconciliation .diagnosis").remove();
    // TODO rename - includes drug class items right now

    // create actual objects

    // TODO refactor? Diagnoses -> Control column?
    // if (version === VERSION_THREE_COLUMN) {
    //     populateThirdAnchorColumn($(".diagnoses"), diagnoses);
    // } else if (version === VERSION_3COL_CLASSES) {
    //     populateThirdAnchorColumn($(".drug_classes"), drugClasses);
    // }
    // TODO: faster / neater to wrap all shadows in a separate div?

    // hide unused column headers; avoid unexpected behavior
    // $(".backdrop th:nth-child(odd) .col-header").hide();

    // TODO might be removed
    // indicate current config
    // $("select[name='dataset']").val(dataset);
    // $("#reconciliation .annotation").text("[ case : " + dataset.toLowerCase().replace(/_/g, " ").replace(/dataset/,
    // "").trim() + " ]"); $("select[name='version']").val(version); $("select[name='autoAnimate']").val(autoAnimate);
    // $("select[name='speed']").val(animationSpeed);

    // initialize the number of drugs to act on
    // updateReviewButton();
}

// prepare information necessary for state transitions
function prepareTransitions() {
    // prepare positions data structure
    calculatePositions();

    // prepare animation speed
    setAnimationSpeed(ANIMATION_SPEED_3);
}

function prepareHandlers() {
    // clear
    $("*").not(".backdrop *").off();

    // item action
    $("#reconciliation .item").mousedown(mousedownHandler).mouseover(mouseoverHandler).mouseout(mouseoutHandler).bind("contextmenu", function () {
        // free right click for item action
        return false;
    });

    // touch-controls
    $("#reconciliation .item").on(
        {
            // left swipe = left click
            "swipeleft": function () {
                // mouse out to disable touch start's hover mimicking
                $(this).mouseout();
                itemChange($(this), this.id, "left");
            },

            // right swipe = right click
            "swiperight": function () {
                $(this).mouseout();
                itemChange($(this), this.id, "right");
            },
        }
    );

    // touch start mimics hover for items
    $("#reconciliation .item").bind("touchstart", function () {
        touchEvent = true;
        $(this).mouseover();
        $lastTouchedItem = $(this);
    });

    // touch start mimics hover for diagnoses / drug class anchors
    $("#reconciliation .diagnosis").bind("touchstart", function () {
        touchEvent = true;
        $(this).mouseover();
        $lastTouchedItem = $(this);
    });

    // if body of page is touched, undo hover of last item
    $("body").bind("touchstart", function () {
        $lastTouchedItem.mouseout();
    });

    // Prevent rubber-banding of the body, but allow for scrolling elements
    $('body').on('touchmove', function (e) {
        let searchTerms = '.scroll, .scroll-y, .scroll-x',
            $target = $(e.target),
            parents = $target.parents(searchTerms);

        if (parents.length || $target.hasClass(searchTerms)) {
            // ignore as we want the scroll to happen
            // (This is where we may need to check if at limit)
        } else {
            e.preventDefault();
        }
    });

    // diagnosis mouseover
    if (version === VERSION_THREE_COLUMN) {
        $("#reconciliation .diagnosis").mouseover(function () {
            // highlight diagnosis and items for this diagnosis

            let id = this.id;
            // let diagnosis = model.diagnoses[id];

            $(this).addClass("third-col-anchor-hover");

            // de-emphasize all items - Note: needs to be changed if allowing multi grouping...
            $(".item").css("opacity", "0.0");

            // hover appropriate item(s) - TODO: does not support with shadows
            let toHover = diagnosisSet[id];
            for (let i = 0; i < toHover.length; i++) {
                let hoverID = toHover[i];
                diagnosisHoverItem(hoverID, true, false);
            }

            hoverScrollTips(id, true);

        }).mouseout(function () {
            let id = this.id;
            // let diagnosis = model.diagnoses[id];

            $(this).removeClass("third-col-anchor-hover");

            // revert de-emphasizing
            $(".item").css("opacity", "1.0");

            // hover appropriate item(s) - TODO: does not support with shadows
            let toHover = diagnosisSet[id];
            for (let i = 0; i < toHover.length; i++) {
                let hoverID = toHover[i];
                diagnosisHoverItem(hoverID, false, false);
            }

            hoverScrollTips(id, false);
        });
    }

    // TODO should refactor...
    // drug class mouseover
    if (version === VERSION_3COL_CLASSES) {
        $("#reconciliation .diagnosis").mouseover(function () {
            // highlight diagnosis and items for this diagnosis

            let id = this.id;
            // let drugClass = model.drugClasses[id];

            $(this).addClass("third-col-anchor-hover");

            // de-emphasize all items - Note: needs to be changed if allowing multi grouping...
            $(".item").css("opacity", "0.0");

            // hover appropriate item(s) - TODO: does not support with shadows
            let toHover = drugClassSet[id];
            for (let i = 0; i < toHover.length; i++) {
                let hoverID = toHover[i];
                diagnosisHoverItem(hoverID, true, false);
            }

            // TODO
            hoverScrollTips(id, true);

        }).mouseout(function () {
            let id = this.id;
            // let drugClass = model.drugClasses[id];

            $(this).removeClass("third-col-anchor-hover");

            // revert de-emphasizing
            $(".item").css("opacity", "1.0");

            // hover appropriate item(s) - TODO: does not support with shadows
            let toHover = drugClassSet[id];
            for (let i = 0; i < toHover.length; i++) {
                let hoverID = toHover[i];
                diagnosisHoverItem(hoverID, false, false);
            }

            hoverScrollTips(id, false);
        });
    }
    // basic controls
    $(".compare").click(function () {
        if (version === VERSION_FULL) {
            // log(EVENT_CLICKED, "compare");
            // TODO use button constants?
        }

        if (!$(this).hasClass("inactive")) {
            changeState(STATE_COMPACT);
            $(".compare").addClass("inactive");
        }
    });

    $(".review").click(function () {

        // log(EVENT_CLICKED, "sign off");

        // save decisions
        let accepted = [];
        let rejected = [];
        let undecided = [];
        let acceptedIds = [];

        acceptedIds.push(state);
        for (let i = 0; i < accepted.length; i++) {
            // accepted.push(itemString(accepted[i]));
            acceptedIds.push(accepted[i]);
        }

        for (let i = 0; i < rejected.length; i++) {
            // rejected.push(itemString(rejected[i]));
        }

        for (let i = 0; i < undecided.length; i++) {
            // undecided.push(itemString(undecided[i]));
        }

        // dump current item decisions (accepted, rejected, undecided)
        // log(EVENT_LIST_ACCEPTED, accepted);
        // log(EVENT_LIST_REJECTED, rejected);
        // log(EVENT_LIST_UNDECIDED, undecided);
        // log(DATA_DEMO_END_STATE, acceptedIds);

        // if still items to review - show popup
        if (calculateNumRemaining() > 0) {
            //TODO make 2s popup
            alert("Still " + calculateNumRemaining() + " drugs to act upon before signing off");
        } else {
            // log(EVENT_SIGNED_OFF, "");
            // return to initial panel
            setTimeout(function () {
                // prepare patient summary
                if (showPatientTab) {
                    saveItemActions();
                    window.open("summary.html");
                }

                window.open('', '_self', '');
                window.close();
            }, PANEL_DELAY / 2);
            // TODO consider delay time
            // TODO consider feedback saying the lists were saved
        }

    });
    // end of $(".review").click

    $(".retry").click(function () {
        // log(EVENT_CLICKED, "reset");
        $(".compare").removeClass("inactive");
        resetDecisions();

        redraw(true, true);
    });

    // options panel
    $(".options").click(function () {
        // log(EVENT_CLICKED, "options");

        toggleOptionsPanel($(this), true);
    });

    // when clicked, cycles the current groupBy layout used
    $(".cycle_groupBy").click(function () {
        // log(EVENT_CLICKED, "cycle_groupBy");
        updateGroupBy($(this).attr("value"));
    });

    // help modal
    $(".help-modal").css("top", $("header").height());

    $(".help").click(function () {
        // log(EVENT_CLICKED, "help");
        $(".help-modal").addClass("show");
    });

    $(".help-close").click(function () {
        // log(EVENT_CLICKED, "help_close");
        $(".help-modal .welcome").remove();
        $(".help-modal").removeClass("show");
    });

    // alert modal
    $("#alert-close").click(function () {
        // log(EVENT_CLICKED, "alert_close");
        $(".alert-modal").removeClass("show");
    });

    // options
    $("select[name='groupBy']").change(function () {
        updateGroupBy($(this).attr("value"));
    });

    $("input[name='multigroup']").click(function () {
        // log(EVENT_CLICKED, "multi group");

        multigroup = this.checked;

        // trigger layout change - redraw(true, true) handled in here too
        $("select[name='groupBy']").change();
    });

    $("input[name='patient_tab']").click(function () {
        // log(EVENT_CLICKED, "patient_tab");
        showPatientTab = this.checked;
    });

    $("select[name='speed']").change(function () {
        setAnimationSpeed($(this).val());
    });

    $("input[name='filterOn']").keyup(function () {
        // filterOn = $(this).val();
        setFilterOn($(this).val())
        redraw(true, true);
    });

    $(".separate").click(function () {
        // log(EVENT_CLICKED, "separate");
        changeState(STATE_SEPARATE);
    });

    $(".identical").click(function () {
        // log(EVENT_CLICKED, "identical");
        if (!$(this).hasClass("inactive")) {
            changeState(STATE_IDENTICAL);
        }
    });

    $(".unique").click(function () {
        // log(EVENT_CLICKED, "unique");
        if (!$(this).hasClass("inactive")) {
            changeState(STATE_UNIQUE);
        }
    });

    $(".similar").click(function () {
        // log(EVENT_CLICKED, "similar");
        changeState(STATE_SIMILAR);
    });

    $(".compact").click(function () {
        // log(EVENT_CLICKED, "compact");
        changeState(STATE_COMPACT);
    });

    $(".gray-out").click(function () {
        // log(EVENT_CLICKED, "gray-out");
        if (!$(this).hasClass("active")) {
            $(".remove").removeClass("active");
            $(this).addClass("active");

            afterAction = AFTER_ACTION_GRAYOUT;
            redraw(true, true);
        }
    });

    $(".remove").click(function () {
        // log(EVENT_CLICKED, "remove");
        if (!$(this).hasClass("active")) {
            $(".gray-out").removeClass("active");
            $(this).addClass("active");

            afterAction = AFTER_ACTION_REMOVE;
            redraw(true, true);
        }
    });

    $("select[name='displayName']").change(function () {
        displayName = $(this).val();

        $("#reconciliation .item").each(function () {
            let id = this.id;

            $("#" + id + " .name").fadeOut("fast").text(items[id].name).fadeIn("fast");
        });
        redraw(true, true);
    });

    $("input[name='displayDetails']").click(function () {
        // log(EVENT_CLICKED, "displayDetails");
        displayDetails = this.checked;
        redraw(true, true);
    });

    // item modification modal dialog
    $(".modify-modal").css("top", $("header").height());

    // $(".add").click(function () {
    //     log(EVENT_CLICKED, "add");
    //     resetModifyPanel("add");
    //     $(".modify-modal").addClass("show");
    // });
    //
    // $(".edit").click(function () {
    //     log(EVENT_CLICKED, "edit");
    //     resetModifyPanel("edit");
    //     $(".modify-modal").addClass("show");
    // });

    // preview
    $("input, textarea").keyup(function () {
        updatePreview($(this));
    });

    // modify panel
    $("#modify .save").click(function () {
        // log(EVENT_CLICKED, "save_modified");
        // saveModifiedItem($("#modify h1").text());
        // $("#modify .response").addClass("show");
        $("#modify .close").click();
    });

    $("#modify .close").click(function () {
        $(".modify-modal").removeClass("show");
    });

    // hidden controls (shortcuts)
    $(window).unbind("keydown")// for some reason, multiple key downs firing, remove previous ones
        .keydown(function (event) {

            if (!$("input[name='filterOn']").is(':focus') &&
                !$("input[name='name']").is(':focus') &&
                !$("input[name='dose']").is(':focus') &&
                !$("input[name='route']").is(':focus') &&
                !$("input[name='frequency']").is(':focus') &&
                !$("textarea[name='instructions']").is(':focus')) {
                switch (event.which) {
                    case 48:
                        // the '0' key
                        setAnimationSpeed(ANIMATION_SPEED_0);
                        break;
                    case 49:
                        // the '1' key
                        setAnimationSpeed(ANIMATION_SPEED_1);
                        break;
                    case 50:
                        // the '2' key
                        setAnimationSpeed(ANIMATION_SPEED_2);
                        break;
                    case 51:
                        // the '3' key
                        setAnimationSpeed(ANIMATION_SPEED_3);
                        break;
                    case 52:
                        // the '4' key
                        setAnimationSpeed(ANIMATION_SPEED_4);
                        break;
                    case 53:
                        // the '5' key
                        setAnimationSpeed(ANIMATION_SPEED_5);
                        break;
                    case 67:
                        // the 'c' key
                        updateGroupBy("__ATTR_DRUG_CLASS__");
                        break;
                    case 76:
                        // the 'l' key
                        // dump();
                        window.open("log_summary.html");
                        break;
                    case 77:
                        // the 'm' key
                        // toggle multi group

                        // toggle controls
                        if ($("#chk_mg").attr("checked")) {
                            $("#chk_mg").attr('checked', false);
                        } else {
                            $("#chk_mg").attr('checked', true);
                        }

                        // update model
                        multigroup = $("#chk_mg").attr("checked");

                        // trigger layout change
                        redraw(true, true);

                        break;
                    case 78:
                        // the 'n' key
                        // group by none
                        updateGroupBy("");
                        break;
                    case 79:
                        // the 'o' key
                        // toggle options panel
                        $(".options").click();
                        break;
                    case 68:
                        // the 'd' key
                        // group by drug class
                        updateGroupBy("__ATTR_DIAGNOSES__");
                        break;
                    case 82:
                        // the 'r' key
                        // group by route
                        updateGroupBy("__ATTR_ROUTE__");
                        break;

                    case 88:
                        // 'x' key - for debugging
                        console.log("state: " + state);
                        console.log(viewData);
                        console.log(positions);
                        console.log(NUM_ROWS);
                        // console.log(model);
                        break;

                    case 89:
                        // the 'y' key - for debugging
                        // toggle printing item + id to console
                        printHover = !printHover;
                        break;
                    default:
                        break;

                }
            }
        });

    // count scrolls
    let lastScrollTop = 0;
    $(".scrolling_content").unbind("scroll").bind('scroll', function () {

        let st = $(this).scrollTop();
        if (st > lastScrollTop) {
            // downScroll code
            // log(EVENT_SCROLLED, "down");
        } else {
            // upScroll code
            // log(EVENT_SCROLLED, "up");
        }
        lastScrollTop = st;
    });

    // resize with window
    $(window).resize(function () {
        setTimeout(function () {
            redraw(true, true, true);
        }, 0);
    });
}

/*
 * Populate the backdrop of the display
 *
 * Postconditions:
 *      Column headers are created (and added to $container_header)
 *      tbody added to $container
 */
function populateBackdrop($container_header, $container) {
    let $thead = $("<thead id='bg-thead'/>");

    $thead.attr("class", "bg-accent");

    let $tr = $("<tr/>");

    for (let i = 0; i < NUM_COLUMNS; i++) {
        let $th = $("<th/>");
        let $header = $("<div></div>");
        let $name = $("<div></div>");

        // column name
        switch (i) {
            case LIST_1_UNIQUE_INDEX:
                if (version === VERSION_THREE_COLUMN)
                    $name.text("Diagnoses");
                else if (version === VERSION_3COL_CLASSES)
                    $name.text("Drug Classes")
                else
                    $name.text(list1.name + " unique");
                break;
            case LIST_1_INDEX:
                // $name.text(list1.name).append("<span class='conditional'> similar" + "</span>");
                $name.text(list1.name).append(`<span class="conditional">${similar}</span>`);
                break;
            case LIST_IDENTICAL_INDEX:
                $name.text("Identical");
                break;
            case LIST_2_INDEX:
                // $name.text(list2.name).append("<span class='conditional'> similar" + "</span>");
                $name.text(list2.name).append(`<span class='conditional'>${similar}</span>`);
                break;
            case LIST_2_UNIQUE_INDEX:
                $name.text(list2.name + " unique");
                break;
            default:
                break
        }
        $name.attr("class", "name");
        $header.attr("class", "col-header");
        $header.append($name);

        // if 2 or 3 col versions, move 1 and 3 closer
        if (version !== VERSION_FULL) {
            if (i === LIST_1_INDEX) {
                $th.css("left", "10%");
                $th.css("position", "relative");
            } else if (i === LIST_2_INDEX) {
                $th.css("right", "10%");
                $th.css("position", "relative");
            }
        }

        // column actions
        let $action = $("<div></div>");
        let $ul = $("<ul/>");

        /*
         * Note: the key names here (e.g "keep", "reject", "clear")
         * become the text for the displayed buttons (for convenience).
         * Furthermore, they receive a class with the same name.
         * So, changes in button text require changes in style.css
         */
        let actions = {
            keep: "accepted",
            reject: "rejected",
            clear: "undecided"
        };

        for (let action in actions) {
            let $li = $("<li/>");
            let $a = $("<a/>");

            $a.attr("class", action);
            if (action === "clear") {
                $a.text(action);
            } else {
                $a.text(action + " rest");
            }
            $a.click({
                index: i,
                dst: actions[action]
            }, processColumn);
            $li.append($a);
            $ul.append($li);
        }
        $action.attr("class", "action");
        $action.append($ul);

        // TODO generalize
        if (!((version === VERSION_THREE_COLUMN || version === VERSION_3COL_CLASSES) && i === 0))
            $header.append($action);

        $th.append($header);
        $tr.append($th);
    }
    $thead.append($tr);
    $container_header.append($thead);
    $container.append("<tbody/>");

}

function populateItems($container) {

    // TODO: populate shadows first for less awkward overlaps

    // populate all items and shadows
    for (let id in items) {

        let item = items[id];
        let differences = [];

        let $item = $("<div></div>");
        $item.attr("id", id);
        $item.attr("class", "item undecided");

        if (item.isShadow) {
            $item.addClass("shadow");
        }

        /*
         * Highlighting a block element name allows for text-overflow,
         * but typically results in unnecessary color due to
         * 100% width. Thus wrap an inline name in a block element to
         * enable text-overflow and more natural name highlighting.
         */
        let $header = $("<div></div>");
        let $name = $("<span/>");

        $header.attr("class", "header");
        $name.attr("class", "name");
        $name.text(item.name);

        if (id in similar) {
            differences = similar[id].differences;

            if (differences.indexOf(ATTR_NAME) !== -1) {
                $name.addClass("difference");
            }
        }
        let $detail = $("<div></div>");
        $detail.attr("class", "detail");

        for (let attribute in item.attributes) {
            if (attributes[attribute].display) {
                let $attribute = $("<span/>");
                $attribute.text(item.attributes[attribute].toString());

                if (id in similar) {
                    if (differences.indexOf(attribute) !== -1) {
                        $attribute.addClass("difference");
                    }
                }
                $detail.append($attribute);
            }
        }
        $header.append($name);
        $item.append($header);
        $item.append($detail);
        $container.append($item);
    }

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
function calculatePositions() {

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
    for (let groupKeyIndex in viewData.groupRank) {
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
        viewData.groupLengths[groupKey].startRow = $.extend(true, {}, NUM_ROWS);

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
            // let trueId = model.items[id].isShadow ? parseInt(model.shadowsToItems[id]) : id;

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
            let identicalSet = getIdentical(id, true, false);
            let similarSet = getSimilar(id, true, false);

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
                    similarSet = similarSet.sort(function (a, b) {
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
    } // end of for each group
}// end of calculatePositions

/*
 * Return the number of remaining drugs to act upon
 * This varies depending on the current state
 * e.g. during Identical, drugs are merged so there seem to be fewer
 */
function calculateNumRemaining() {
    // return the number of page elements that are undecided
    return $(".undecided:not(.preview):not(.shadow):visible").length;
}

// animation /////////////////////////////////////////////////////////
/*
 * sort - whether to apply sort
 * filter - whether to apply filter
 * immediate - whether to move all items into final positon or use changeState
 * jumpToPosition - whether to jump to position or animate transition
 */
function redraw(sort, filter, immediate, jumpToPosition) {
    /*
     * Tweak proportions.
     *
     * Set position relative to the bottom primarily so that content
     * grows / shrinks from top edge, making room for the options
     * panel without occluding anything.
     *
     * Debatable whether the main reconciliation should have to crunch for the
     * options panel: overlapping might make it harder to forget that
     * it's open (and occupying unnecessary space).
     */
    let headerHeight = $(".banner").outerHeight(true);
    let optionsPanelHeight = $(".options").hasClass("active") ? $(".options-panel").outerHeight(true) : 0;
    let contentMarginTop = parseFloat($("#reconciliation > .content").css("margin-top"));
    let contentHeader = $(".backdrop-header").outerHeight(true);    // column headers
    let contentMarginBottom = parseFloat($("#reconciliation > .content").css("margin-bottom"));
    let detailHeight = $("#reconciliation > .detail").outerHeight(true);
    let brandingHeight = $(".branding").outerHeight(true);
    let footerHeight = detailHeight + brandingHeight;
    // let tabHeight = $(".add").outerHeight(true);

    $("#reconciliation > .content").css("bottom", footerHeight);
    $("#reconciliation > .content").height($(window).height() - headerHeight - optionsPanelHeight - footerHeight - contentMarginTop - contentMarginBottom);
    $(".scrolling_content").height($(window).height() - headerHeight - optionsPanelHeight - footerHeight - contentMarginTop - contentMarginBottom - contentHeader);
    //
    // $(".add").css("top", headerHeight + contentMarginTop + topOffset() + optionsPanelHeight + tabHeight * 0.5);
    // $(".edit").css("top", headerHeight + contentMarginTop + topOffset() + optionsPanelHeight + tabHeight * 1.75);

    // TODO: move scroll-tip adjustment?

    adjustScrollTips();

    // if parameter to immediately draw (default undefined -> false)
    //  calculatePositions and animate each at once

    viewData = viewDataModel(sort, filter);
    // TODO check if need to regenerate (or don't preload it in init?)
    calculatePositions();

    if (immediate) {
        $("#reconciliation .item").each(function () {
            animateItem(this.id, state, jumpToPosition ? 0 : animationDelay / 4);
        });
    } else {
        changeState(state, jumpToPosition);
    }
}

function changeState(toState, jumpToPosition) {
    // if state is final one, disable compare
    if (toState === STATE_COMPACT) {
        $(".compare").addClass("inactive");
    }

    if (state === toState || version === VERSION_BASELINE || version === VERSION_LINK_ONLY || version === VERSION_THREE_COLUMN || version === VERSION_3COL_CLASSES) {
        transition(state, state, jumpToPosition);
        // no state change
    } else {
        // let transitionDuration = animationDuration;

        if (animationSpeed === ANIMATION_SPEED_0) {
            // no animation, jump to destination state
            transition(toState, toState, jumpToPosition);
        } else {
            let offset = (state < toState) ? 1 : -1;
            let i = state;

            while (i !== toState) {
                transition(state, i + offset, jumpToPosition);
                i += offset;
            }
            // transitionDuration += transitionDelay(state, toState - offset);
        }
        // log(EVENT_STATE_CHANGE, "start:" + stateIndexToName(state) + ",end:" + stateIndexToName(toState) +
        // ",duration(ms):" + transitionDuration);
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
function transition(from, to, jumpToPosition) {
    let delay = 0;

    if (from < to) {
        delay = transitionDelay(state, to - 1);
    } else if (from > to) {
        delay = transitionDelay(state, to + 1);
    }

    // TODO: track timers to allow queue canceling

    setTimeout(function () {
        adjustAnimationControls(to);
        adjustBackdrop(to);
        adjustCellDimensions();

        // TODO better organization? code should be refactored, since this was when there was only intended to be 1
        // version
        if (version !== VERSION_THREE_COLUMN && version !== VERSION_3COL_CLASSES)// for 3col version, headers don't change'
            adjustColumnHeaders(from, to);

        adjustGroupLabels(from, to);
        adjustDifferenceHighlights(to);

        // clear striping
        $(".backdrop td").css("background", "");

        let $tbody = $(".backdrop tbody");
        let height = $tbody.children().length;

        for (let i = 0; i < height; i++) {
            $tbody.children(":nth-child(" + (i + 1) + ")").css("background", "");
        }

        // WHITE, NEUTRAL_GRAY, CONTRAST_GRAY
        let color = NEUTRAL_GRAY;

        if (groupBy) {

            // color each group a solid color
            let i = 0;
            // nth-child(i) is 1-indexed

            for (let j = 0; j < viewData.groupRank.length; j++) {
                let groupKey = viewData.groupRank[j];
                while (i < viewData.groupLengths[groupKey].startRow[to]) {
                    // color until start of next group
                    $tbody.children(":nth-child(" + (i + 1) + ")").css("background", color);
                    i++;
                }
                color = (color === WHITE) ? NEUTRAL_GRAY : WHITE;
                // alternate colors
            }

            // finish coloring to the end
            while (i < NUM_ROWS[to]) {
                $tbody.children(":nth-child(" + (i + 1) + ")").css("background", color);
                i++;
            }

        } else if (to === STATE_COMPACT) {
            color = CONTRAST_GRAY;
            // if compact state and no grouping, do block coloring for top and similar set coloring below

            // block color top
            let topHeight = (Math.max(viewData.groupLengths[DEFAULT_GROUP].unique1.length, viewData.groupLengths[DEFAULT_GROUP].unique2.length, Object.keys(viewData.groupLengths[DEFAULT_GROUP].identicalMarker).length));
            let i = 0
            for (; i < topHeight; i++) {
                $tbody.children(":nth-child(" + (i + 1) + ")").children(":nth-child(odd)").css("background", NEUTRAL_GRAY);
            }

            // color similar sets below
            let setEnd = topHeight;
            for (let j = 0; j < viewData.groupLengths[DEFAULT_GROUP].rowSetLen[STATE_COMPACT].length; j++) {
                setEnd = setEnd + viewData.groupLengths[DEFAULT_GROUP].rowSetLen[STATE_COMPACT][j];
                while (i < setEnd) {
                    $tbody.children(":nth-child(" + (i + 1) + ")").css("background", color);
                    i++;
                }
                color = (color === WHITE) ? CONTRAST_GRAY : WHITE;
                // alternate colors
            }

        } else if (to === STATE_SIMILAR) {
            // if similar state and no grouping, do similar set coloring
            let i = 0;
            let setEnd = 0;
            for (let j = 0; j < viewData.groupLengths[DEFAULT_GROUP].rowSetLen[STATE_SIMILAR].length; j++) {
                setEnd = setEnd + viewData.groupLengths[DEFAULT_GROUP].rowSetLen[STATE_SIMILAR][j];
                while (i < setEnd) {
                    $tbody.children(":nth-child(" + (i + 1) + ")").css("background", color);
                    i++;
                }
                color = (color === WHITE) ? NEUTRAL_GRAY : WHITE;
                // alternate colors
            }
        } else {
            // if separate, identical, or unique state (with no grouping),
            //  stripe rows for legibility
            $tbody.children(":nth-child(odd)").css("background", WHITE);
            $tbody.children(":nth-child(even)").css("background", NEUTRAL_GRAY);
        }

        // animate items
        //animateDefault(to); // TODO consider - should animate everything for group by (to handle bumping things
        // down?)
        if (to > from) {
            if (to === STATE_IDENTICAL) {
                animateIdentical(to, jumpToPosition);
            } else if (to === STATE_UNIQUE) {
                animateUnique(to, jumpToPosition);
            } else {
                animateDefault(to, jumpToPosition);
            }
        } else {
            animateDefault(to, jumpToPosition);
        }
    }, delay);

}

function animateIdentical(toState, jumpToPosition) {
    let i = 0;
    let checked = {}, animated = {};

    for (let id in identical) {
        if (checked[id] === undefined) {
            let set = identical[id];

            for (let j = 0; j < set.length; j++) {
                let checkID = set[j];

                if (items[checkID].isShadowed) {
                    set = set.concat(getShadows(checkID));
                }
            }
            checked[id] = true;

            for (let j = 0; j < set.length; j++) {
                checked[set[j]] = true;
            }
            animateSet(set, toState, (i > 0) ? (i * animationDuration) + (i * animationDelay) : 0, animated, jumpToPosition);
            i++;
        }
    }
}

function animateUnique(toState, jumpToPosition) {
    let tempUnique1 = unique1, tempUnique2 = unique2;

    for (let i = 0; i < unique1.length; i++) {
        let id = unique1[i];
        let item = items[id];

        if (item.isShadowed) {
            tempUnique1 = tempUnique1.concat(getShadows(id));
        }
    }

    for (let i = 0; i < unique2.length; i++) {
        let id = unique2[i];
        let item = items[id];

        if (item.isShadowed) {
            tempUnique2 = tempUnique2.concat(getShadows(id));
        }
    }

    // animate left first, then right
    animateSet(tempUnique1, toState, 0, jumpToPosition)
    animateSet(tempUnique2, toState, animationDuration + animationDelay, jumpToPosition);
}

function animateDefault(toState, jumpToPosition) {
    let duration = undefined;
    if (jumpToPosition)
        duration = 0;

    $("#reconciliation .item").each(function () {
        animateItem(this.id, toState, duration);
    });
}

function animateSet(set, toState, delay, animated, jumpToPosition) {

    let duration = undefined;
    if (jumpToPosition)
        duration = 0;

    setTimeout(function () {
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

function animateItem(id, toState, duration) {
    // skip items that did not have positions calculated in viewData
    if (!positions[id] || !positions[id][toState])
        return;

    let $item = $("#" + id);

    let position = (toState !== undefined) ? offsetToPosition(positions[id][toState]) : offsetToPosition(positions[id]);

    // TODO: animate() or transition()?

    // $item.transition({
    $item.animate({
        left: position.x,
        top: position.y,
        duration: (duration === undefined) ? animationDuration : duration,
        easing: CUSTOM_EASE_IN
    });

    let trueId = items[id].isShadow ? parseInt(shadowsToItems[id]) : id;

    // for simplicity, hide identical shadows that are from the right column

    let item = items[id];

    // handle identical overlap
    if (trueId in identical) {
        if (state < STATE_IDENTICAL) {
            if (id in hidden) {
                delete hidden[id];
                toggleItem($item, toggleOnDelay, true);
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
                            toggleItem($item, toggleOffDelay, false);
                            break;
                        }
                    }
                } // else don't hide
            } else {
                // for non-shadow, just check if in first position of identical
                if (identical[id].indexOf(parseFloat(id)) !== 0) {
                    hidden[id] = true;
                    toggleItem($item, toggleOffDelay, false);
                }
            }
        }
    }
}

function topOffset() {
    return $(".backdrop-header th").outerHeight(true);
}

function columnWidth() {
    // align according to column headers
    return $(".backdrop-header tr").outerWidth(true) / 5;
}

function rowHeight() {
    // include padding but exclude margin
    return $(".backdrop td").outerHeight();
}

// given offset information (which row/column), convert into (x,y) position info for css "top" and "left"
function offsetToPosition(offset) {
    let twoColOffset = 0;
    // offset for 2 column versions to make lists closer together
    if (version !== VERSION_FULL) {
        twoColOffset = $(".backdrop thead").outerWidth() * 0.1;
        if (offset.col === 3)
            twoColOffset = twoColOffset * -1;
    }

    return {
        // x: offset.col * columnWidth() + twoColOffset,
        x: offset.col * columnWidth() + twoColOffset + 18,
        y: (offset.row * rowHeight())
    };
}

function transitionDelay(from, to) {
    let delay = 0;

    if (from < to) {
        for (let i = from + 1; i <= to; i++) {
            if (i === STATE_IDENTICAL) {
                delay += transitionIdenticalDelay();
            } else if (i === STATE_UNIQUE) {
                delay += 2 * (animationDuration + animationDelay);
            } else {
                delay += animationDuration + animationDelay;
            }
        }
    } else if (from > to) {
        for (let i = from; i >= to + 1; i--) {
            delay += animationDuration + animationDelay;
        }
    }
    return delay;
}

function transitionIdenticalDelay() {
    let numSets = 0;
    let checked = {};

    for (let id in identical) {
        if (checked[id] === undefined) {
            let set = getIdentical(id);
            checked[id] = true;

            for (let j = 0; j < set.length; j++) {
                checked[set[j]] = true;
            }
            numSets++;
        }
    }
    return (numSets * animationDuration) + (numSets * animationDelay);
}

/*
 * Given a speed, update delay times accordingly (and log it)
 * Params:
 *      String speed - defined constant
 * Returns:
 *      none
 */
function setAnimationSpeed(speed) {
    // adjust speed
    animationSpeed = speed;
    $("select[name='speed']").val(speed);

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

    // log(EVENT_ANIMATION_SPEED_CHANGE, animationSpeed);
}

// interface adjustment //////////////////////////////////////////////
function adjustBackdrop(toState) {
    // redraw everything: avoid odd white stripe when end row changes
    $(".backdrop tbody tr").remove();

    for (let i = 0; i < NUM_ROWS[toState]; i++) {
        let $tr = $("<tr/>");

        for (let j = 0; j < NUM_COLUMNS; j++) {
            $tr.append("<td/>");
        }
        $(".backdrop tbody").append($tr);
    }
}

function adjustColumnHeaders(from, to) {
    toggleHeader(LIST_1_UNIQUE_INDEX, to >= STATE_UNIQUE);
    toggleHeader(LIST_IDENTICAL_INDEX, to >= STATE_IDENTICAL);

    // match item animation: list 1 unique, then list 2 unique
    setTimeout(function () {
        toggleHeader(LIST_2_UNIQUE_INDEX, to >= STATE_UNIQUE);
    }, from >= to ? 0 : animationDuration + animationDelay);

    toggleConditionalHeaders(to >= STATE_SIMILAR);
}

/*
 * Given a state, adjust animation controls appropriately
 * "state" is one of the defined constants above
 */
function adjustAnimationControls(state) {
    $(".separate, .identical, .unique, .similar, .compact").removeClass("active inactive");
    // let active = {};
    let inactive = {};

    // inactive
    if (animationSpeed === ANIMATION_SPEED_0) {
        inactive[STATE_IDENTICAL] = true;
        inactive[STATE_UNIQUE] = true;
        inactive[STATE_SIMILAR] = true;
    }

    if (groupBy) {
        inactive[STATE_IDENTICAL] = true;
        inactive[STATE_UNIQUE] = true;
        delete inactive[STATE_SIMILAR];
    } else {
        delete inactive[STATE_IDENTICAL];
        delete inactive[STATE_UNIQUE];
        delete inactive[STATE_SIMILAR];
    }

    if (version === VERSION_BASELINE || version === VERSION_LINK_ONLY || version === VERSION_THREE_COLUMN || version === VERSION_3COL_CLASSES) {
        for (let i = STATE_IDENTICAL; i < NUM_STATES; i++) {
            inactive[i] = true;
        }
        $(".compare").addClass("inactive");
    }

    for (let stateIndex in inactive) {
        $("." + stateIndexToName(parseInt(stateIndex))).addClass("inactive");
    }
    $("." + stateIndexToName(state)).removeClass("inactive").addClass("active");
}

function adjustGroupLabels(from, to) {
    $(".groups .label").remove();

    if (groupBy) {
        for (let groupKey in viewData.groups) {
            // let group = viewData.groups[groupKey];

            let $label = $("<span/>");
            $label.attr("class", "label");
            $label.text(groupKey);
            $label.css("left", 0);
            $label.css("top", (viewData.groupLengths[groupKey]['startRow'][to] * rowHeight()));
            $(".groups").append($label);
        }
        $(".groups .label").addClass("show");
    }
}

function adjustCellDimensions() {
    // adjust padding
    // $("#reconciliation .item").css("padding-top", model.groupBy ? "1em" : "0.6em");
    // $("#reconciliation .item").css("padding-bottom", model.groupBy ? 0 : "0.4em");

    // adjust height
    if (displayDetails) {
        $("#reconciliation .item .detail").fadeIn();
        // $("#reconciliation .item, #review td").height($.browser.mozilla ? "4.5em" : "4em");
        $("#reconciliation .item, #review td").height("4em");
    } else {
        $("#reconciliation .item .detail").fadeOut();
        // $("#reconciliation .item, #review td").height($.browser.mozilla ? "1.75em" : "1.25em");
        $("#reconciliation .item, #review td").height("1.25em");
    }
    // $(".backdrop td").height($.browser.mozilla ? $("#reconciliation .item").outerHeight() : $("#reconciliation
    // .item").height());
    $(".backdrop td").height($("#reconciliation .item").height());
}

// given a state, adjust difference highlights on items
function adjustDifferenceHighlights(toState) {
    if (toState < STATE_SIMILAR) {
        $(".difference").removeClass("highlight");
    } else {
        if (displayName !== RECORDED_NAME) {
            $(".name.difference").removeClass("highlight");
            $(".undecided .difference:not(.name)").addClass("highlight");
        } else {
            $(".undecided .difference").addClass("highlight");
        }
    }
}

function adjustScrollTips() {
    let bottom = $("#reconciliation > .detail").outerHeight(true) + $(".branding").outerHeight(true) + parseFloat($("#reconciliation > .content").css("margin-bottom"));

    // hand-tweaked positions, adjust as appropriate
    $(".up").css("top", topOffset() * 2);
    // * 2 just for simple rough positioning
    $(".down").css("bottom", bottom);
}

function toggleHeader(index, show) {
    let $header = $(".backdrop th:nth-child(" + (index + 1) + ") .col-header");

    if (show) {
        $header.fadeIn(toggleOnDelay);
    } else {
        $header.fadeOut(toggleOnDelay);
    }
}

function toggleConditionalHeaders(show) {
    if (show) {
        $(".backdrop th:nth-child(" + (LIST_1_INDEX + 1) + ") .name .conditional").fadeIn(toggleOnDelay);
        $(".backdrop th:nth-child(" + (LIST_2_INDEX + 1) + ") .name .conditional").fadeIn(toggleOnDelay);
    } else {
        $(".backdrop th:nth-child(" + (LIST_1_INDEX + 1) + ") .name .conditional").fadeOut(toggleOffDelay);
        $(".backdrop th:nth-child(" + (LIST_2_INDEX + 1) + ") .name .conditional").fadeOut(toggleOffDelay);
    }
}

function stateIndexToName(index) {
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
            break;
    }
    return undefined;
}

// item events ///////////////////////////////////////////////////////
function mousedownHandler(event) {
    if (!touchEvent) {
        let clickType = 0;
        if (event.which === 1)
            clickType = "left";
        else if (event.which === 3)
            clickType = "right";
        itemChange($(this), this.id, clickType);
    }
}

/*
 * used by mousedown + swipe/tap to handle the user's decision for an item
 * itemId - id of item decided on
 * String clickType - type of click (indicates which direction to cycle)
 *      {"left", "right"}
 */
function itemChange($item, itemId, clickType) {
    // log(EVENT_CLICKED, "item");

    let dst;

    if (clickType === "left") {// left click
        if ($item.hasClass("undecided")) {
            dst = "accepted";
        } else if ($item.hasClass("accepted")) {
            dst = "rejected";
        } else if ($item.hasClass("rejected")) {
            dst = "undecided";
        }
    } else if (clickType === "right") {// right click
        if ($item.hasClass("undecided")) {
            dst = "rejected";
        } else if ($item.hasClass("accepted")) {
            dst = "undecided";
        } else if ($item.hasClass("rejected")) {
            dst = "accepted";
        }
    }

    if (dst) {
        processItem(itemId, dst, version === VERSION_BASELINE);

        if (afterAction === AFTER_ACTION_REMOVE) {
            redraw(true, true);
        }

        // some item was changed, update sign off button's undecided count
        // updateReviewButton();
    }
}

function mouseoverHandler() {
    let id = this.id;
    let item = items[id];

    if (printHover) {
        // for debugging, print item + id to console on hover
        console.log(item.name + "\t" + id);
    }

    // hover appropriate item(s)
    if (version === VERSION_FULL || version === VERSION_LINK_ONLY || version === VERSION_THREE_COLUMN || version === VERSION_3COL_CLASSES) {
        let toHover = getRelatedSet(id, multigroup);

        for (let i = 0; i < toHover.length; i++) {
            let hoverID = toHover[i];
            hoverSet[hoverID] = true;
            hoverItem(hoverID, true, true);
        }
    } else {
        hoverSet[id] = true;
        hoverItem(id, true, true);
    }
    hoverScrollTips(id, true);

    // update item detail
    let $detail = $(".detail .content");

    // color detail panel to draw attention
    $detail.css("background", "#555555");
    $detail.css("color", "#f0f0f0");

    // TODO more general approach? this becomes med rec-specific:
    // display generic name
    let genericName = item.getNames()['generic'];
    let genericPart = item.name === genericName ? "" : " (" + genericName + ")";

    let fullDescription = item.name + genericPart + " | ";

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
                    } else {
                        valuesString += values[i];
                    }
                    valuesString += ", ";
                }
                valuesString = valuesString.slice(0, -2);
            } else {
                valuesString = values.toString();
            }

            if (valuesString.trim() !== "") {
                fullDescription += valuesString + " | ";
            }
        }
    }
    fullDescription = fullDescription.slice(0, -3);

    // add note about edited items
    let editedExplanation = "";
    if ($(this).hasClass("modified")) {
        editedExplanation = " | (Note: * = modified item)"
    }
    $detail.text(fullDescription + editedExplanation);

    // diagnosis highlight
    if (version === VERSION_THREE_COLUMN) {
        let diagnosisSets = diagnosisSet;
        for (let diagnosisId in diagnosisSets) {
            if (diagnosisSets[diagnosisId].indexOf(id) >= 0) {
                hoverDiagnosisSet.push(diagnosisId);
                $("#" + diagnosisId).addClass("third-col-anchor-hover");
            }
        }
    } else if (version === VERSION_3COL_CLASSES) {
        // drug class highlight // TODO refactor into control column?
        let dcSets = drugClassSet;
        for (let dcId in dcSets) {
            if (dcSets[dcId].indexOf(id) >= 0) {
                hoverDiagnosisSet.push(dcId);
                // TODO rename when control col refactor
                $("#" + dcId).addClass("third-col-anchor-hover");
            }
        }
    }
}

function mouseoutHandler() {
    // debugger
    for (let id in hoverSet) {
        hoverItem(id, false, true);
    }
    hoverSet = {};
    hoverScrollTips(this.id, false);

    let $detail = $(".detail .content");
    $detail.text("Nothing to display.");

    // remove detail panel's coloring
    $detail.css("background", "#f0f0f0");
    $detail.css("color", "#333333");

    // diagnosis un-highlight
    if (version === VERSION_THREE_COLUMN) {
        for (let diagnosisId in hoverDiagnosisSet) {
            $("#" + hoverDiagnosisSet[diagnosisId]).removeClass("third-col-anchor-hover");
        }
        hoverDiagnosisSet = [];
    } else if (version === VERSION_3COL_CLASSES) {
        // drug class un-highlight // TODO clean - rename
        for (let diagnosisId in hoverDiagnosisSet) {
            $("#" + hoverDiagnosisSet[diagnosisId]).removeClass("third-col-anchor-hover");
        }
        hoverDiagnosisSet = [];
    }
}

// given an id and whether this is on mouseover, hover the item
function hoverItem(id, mouseover, showHighlights) {

    let item = items[id];
    let $item = $("#" + id);

    if (mouseover) {
        $item.addClass("item-hover");

        if (item.isShadow)
            $item.css("opacity", "0.6");
        else
            $item.css("opacity", "1");

        if ($item.hasClass("undecided")) {
            $item.addClass("undecided-hover");
        }

        // for 2 column w/ links or 3col, highlight differences on mouseover
        if (version === VERSION_LINK_ONLY || (version === VERSION_THREE_COLUMN && showHighlights) || (version === VERSION_3COL_CLASSES && showHighlights)) {
            $("#" + id + " .difference").addClass("highlight");
        }

    } else {
        $item.removeClass("item-hover");

        if ($item.hasClass("undecided")) {
            $item.removeClass("undecided-hover");
        }

        // for 2 column w/ links or 3col, highlight differences on mouseover
        if (version === VERSION_LINK_ONLY || (version === VERSION_THREE_COLUMN && showHighlights) || (version === VERSION_3COL_CLASSES && showHighlights)) {
            $("#" + id + " .difference").removeClass("highlight");
        }
    }
}

// hover item if mouseover is on a diagnosis
function diagnosisHoverItem(id, mouseover, showHighlights) {
    let item = items[id];
    let $item = $("#" + id);

    if (mouseover) {
        $item.addClass("item-hover");

        if (item.isShadow)
            $item.css("opacity", "0.6");
        else
            $item.css("opacity", "1");

        if ($item.hasClass("undecided")) {
            //$item.addClass("diagnosis-hover");
        } else {
            // undo de-emphasizing
            $item.css("opacity", "1.0");
        }

        // for 2 column w/ links or 3col, highlight differences on mouseover
        if (version === VERSION_LINK_ONLY || (version === VERSION_THREE_COLUMN && showHighlights) || (version === VERSION_3COL_CLASSES && showHighlights)) {
            $("#" + id + " .difference").addClass("highlight");
        }

    } else {
        $item.removeClass("item-hover");

        if ($item.hasClass("undecided")) {
            //$item.removeClass("diagnosis-hover");
        }

        // for 2 column w/ links or 3col, highlight differences on mouseover
        if (version === VERSION_LINK_ONLY || (version === VERSION_THREE_COLUMN && showHighlights) || (version === VERSION_3COL_CLASSES && showHighlights)) {
            $("#" + id + " .difference").removeClass("highlight");
        }
    }
}

function getUniqueElements(arr) {
    let u = {}, a = [];
    for (let i = 0, l = arr.length; i < l; ++i) {
        if (u.hasOwnProperty(arr[i])) {
            continue;
        }
        a.push(arr[i]);
        u[arr[i]] = 1;
    }
    return a;
}

function hoverScrollTips(id, mouseover) {
    $(".scroll-tip").removeClass("show");

    if (mouseover) {
        let checkItems = (version === VERSION_FULL || version === VERSION_LINK_ONLY || version === VERSION_THREE_COLUMN || version === VERSION_3COL_CLASSES) ? getRelatedSet(id, multigroup) : getShadowSet(id);
        checkItems = getUniqueElements(checkItems);

        let numObscured = {
            "neither": 0,
            "above": 0,
            "below": 0
        };

        let namesObscured = {
            "neither": "",
            "above": "",
            "below": ""
        };

        for (let i = 0; i < checkItems.length; i++) {
            let id = checkItems[i];
            if (!hidden[id]) {
                let offScreen = isOffscreen(id);
                numObscured[offScreen]++;
                namesObscured[offScreen] += ("\n" + items[id].name);
            }
        }

        if (numObscured["above"] > 0) {
            $(".up").text("...more (" + numObscured["above"] + ")" + namesObscured["above"]);
            $(".up").addClass("show");
        }

        if (numObscured["below"] > 0) {
            $(".down").text("...more (" + numObscured["below"] + ")" + namesObscured["below"]);
            $(".down").addClass("show");
        }
    }
}

/*
 * Toggle options panel based on whether $panel has active class
 *
 * doRedraw - whether to perform a redraw afterwards
 */
function toggleOptionsPanel($panel, doRedraw) {
    if ($panel.hasClass("active")) {
        $panel.text("show options").removeClass("active");

        $(".options-panel").css("transition", "transform 0.3s, opacity 0.2s").removeClass("show");
        $(".options-panel").css("-webkit-transition", "-webkit-transform 0.3s, opacity 0.2s").removeClass("show");
        $(".options-panel").css("-moz-transition", "-moz-transform 0.3s, opacity 0.2s").removeClass("show");
        $(".options-panel").css("-ms-transition", "-ms-transform 0.3s, opacity 0.2s").removeClass("show");
        $(".options-panel").css("-o-transition", "-o-transform 0.3s, opacity 0.2s").removeClass("show");

        $("#reconciliation > .content").css("transition", "height 0.3s");
        $("#reconciliation > .content").css("-webkit-transition", "height 0.3s");
        $("#reconciliation > .content").css("-moz-transition", "height 0.3s");
        $("#reconciliation > .content").css("-ms-transition", "height 0.3s");
        $("#reconciliation > .content").css("-o-transition", "height 0.3s");

        // $(".add, .edit").css("transition", "top 0.3s, width 0.2s");
        // $(".add, .edit").css("-webkit-transition", "top 0.3s, width 0.2s");
        // $(".add, .edit").css("-moz-transition", "top 0.3s, width 0.2s");
        // $(".add, .edit").css("-ms-transition", "top 0.3s, width 0.2s");
        // $(".add, .edit").css("-o-transition", "top 0.3s, width 0.2s");

    } else {
        $panel.text("hide options").addClass("active");

        $(".options-panel").css("transition", "transform 0.2s, opacity 0.2s").addClass("show");
        $(".options-panel").css("-webkit-transition", "-webkit-transform 0.2s, opacity 0.2s").addClass("show");
        $(".options-panel").css("-moz-transition", "-moz-transform 0.2s, opacity 0.2s").addClass("show");
        $(".options-panel").css("-ms-transition", "-ms-transform 0.2s, opacity 0.2s").addClass("show");
        $(".options-panel").css("-o-transition", "-o-transform 0.2s, opacity 0.2s").addClass("show");

        $("#reconciliation > .content").css("transition", "height 0.2s");
        $("#reconciliation > .content").css("-webkit-transition", "height 0.2s");
        $("#reconciliation > .content").css("-moz-transition", "height 0.2s");
        $("#reconciliation > .content").css("-ms-transition", "height 0.2s");
        $("#reconciliation > .content").css("-o-transition", "height 0.2s");

        // $(".add, .edit").css("transition", "top 0.2s, width 0.2s");
        // $(".add, .edit").css("-webkit-transition", "top 0.2s, width 0.2s");
        // $(".add, .edit").css("-moz-transition", "top 0.2s, width 0.2s");
        // $(".add, .edit").css("-ms-transition", "top 0.2s, width 0.2s");
        // $(".add, .edit").css("-o-transition", "top 0.2s, width 0.2s");

    }

    if (doRedraw)
        redraw(true, true, true);
}

function isOffscreen(id) {
    let status = "neither";
    let $content = $(".scrolling_content");
    let divHeight = $(".item").outerHeight();
    let topEdge = $(".scrolling_content").scrollTop();
    let bottomEdge = topEdge + $content.outerHeight();

    if (!positions[id]) {
        return status;
    }
    // skip for items that are not visible (e.g. shadows that are populated by not in view data)

    let position = offsetToPosition(positions[id][state]);

    if ((position.y + divHeight) < topEdge || topEdge > (position.y + divHeight * 0.75)) {
        status = "above";
    } else if (position.y > bottomEdge || (position.y + divHeight * 0.25) > bottomEdge) {
        status = "below";
    }
    return status;
}

// item action ///////////////////////////////////////////////////////
function resetDecisions() {
    resetLinkActionFlags();

    state = STATE_SEPARATE;
}

function resetLinkActionFlags() {
    linkAction = {};

    for (let id in items) {
        linkAction[id] = true;
    }
}

function processItem(id, dst, noLink) {
    // don't trigger meaningless linked actions
    if (!$("#" + id).hasClass(dst)) {
        if (noLink) {
            actOnItem(id, dst);
        } else {
            // act on shadow = act on item
            actOnSet(items[id].isShadow ? getShadowed(id) : id, dst);
        }
    }
}

function getItemsInColumn(state, columnIndex) {

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
            return $.grep(list1.source, function (id) {
                return !(id in identical);
            });
        else if (columnIndex === LIST_IDENTICAL_INDEX)
            return $.grep(Object.keys(identical), function (id) {
                return !(hidden[id]);
            });
        else if (columnIndex === LIST_2_INDEX)
            return $.grep(list2.source, function (id) {
                return !(id in identical);
            });

    } else {

        // by state unique and up, all items in final columns
        // return data in columns filtering things out as needed

        if (columnIndex === LIST_1_UNIQUE_INDEX) {
            return unique1;
        } else if (columnIndex === LIST_1_INDEX) {
            return $.grep(list1.source, function (id) {
                return !(id in identical) && unique1.indexOf(id) < 0;
            });
        } else if (columnIndex === LIST_IDENTICAL_INDEX) {
            return $.grep(Object.keys(identical), function (id) {
                return !(hidden[id]);
            });
        } else if (columnIndex === LIST_2_INDEX) {
            return $.grep(list2.source, function (id) {
                return !(id in identical) && unique2.indexOf(id) < 0;
            });
        } else if (columnIndex === LIST_2_UNIQUE_INDEX) {
            return unique2;
        }

    }
}

// called to handle column actions (like "keep", "reject", "clear")
function processColumn(event) {
    // log(EVENT_CLICKED, "column_action");
    // log(EVENT_COLUMN_ACTION, "dst:" + event.data.dst + ",state:" + state + ",column:" + event.data.index);

    let col = getItemsInColumn(state, event.data.index)

    for (let j = 0; j < col.length; j++) {
        let id = col[j];
        // only act on items in this particular column
        //  and only act on undecided ones
        if (event.data.dst === 'undecided' || $("#" + id).hasClass('undecided')) {
            processItem(id, event.data.dst, event.data.index !== LIST_IDENTICAL_INDEX);
        }
    }

    if (col.length > 0 && afterAction === AFTER_ACTION_REMOVE) {
        redraw(true, true);
    }

    // update review button's number of undecided
    // updateReviewButton();
}

function actOnSet(id, dst) {
    let identical = getIdentical(id);
    let similar = getSimilar(id, undefined, true);

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

function actOnItem(id, dst) {
    // act on item
    decide(id, dst);

    // act on shadows
    let shadows = getShadows(id);

    for (let i = 0; i < shadows.length; i++) {
        decide(shadows[i], dst);
    }
}

function decide(id, dst) {
    let $item = $("#" + id);
    let $differences = $("#" + id + " .difference");
    let checkID = items[id].isShadow ? getShadowed(id) : id;

    // update model
    // let src;

    // if ($item.hasClass("accepted")) {
    //     src = "accepted";
    // } else if ($item.hasClass("rejected")) {
    //     src = "rejected";
    // }
    // decide(id, src, dst);

    // update view
    $item.removeClass("accepted rejected undecided undecided-hover");

    if (dst === "undecided") {
        if (id in hoverSet) {
            $item.addClass("undecided-hover");
        }

        if (state >= STATE_SIMILAR) {
            $differences.addClass("highlight");
        }
    } else {
        $differences.removeClass("highlight");
    }
    $item.addClass(dst);

    /*
     * Actions on members of identical sets are always linked.
     *
     * Only the first action on a similar set is linked.
     */
    linkAction[id] = checkID in identical;
}

function updatePreview($field) {
    $(".preview ." + $field.attr("name")).text($field.val());
}

// save decisions into session storage for summary.html
function saveItemActions() {
    let stop = "", start = "", cont = "";

    for (let id in items) {
        let item = items[id];

        if (item.isShadow) {
            continue;
        }
        let $item = $("#" + id);
        let frequency = item.attributes[ATTR_FREQUENCY].toString();

        // expand abbreviations
        frequency = frequency.replace(/w/i, " weeks");
        frequency = frequency.replace(/h/i, " hours");
        frequency = frequency.replace(/B\.?I\.?D\.?/i, "two times as day");
        frequency = frequency.replace(/T\.?I\.?D\.?/i, "three times a day");
        frequency = frequency.replace(/Q\.?I\.?D\.?/i, "four times a day");
        frequency = frequency.replace(/q/i, "every ");

        let modifiedStr = item.isModified ? "* " : "";

        let itemString = item.listID + "\t" + modifiedStr + item.name + "\t" + frequency + "\t" + item.attributes[ATTR_DOSE] + "\t" + item.attributes[ATTR_ROUTE] + "\n";

        if (item.listID === list1.id && $item.hasClass("accepted")) {
            cont = cont + itemString;
        } else if (item.listID === list1.id && $item.hasClass("rejected")) {
            stop = stop + itemString;
        } else if (item.listID === list2.id && $item.hasClass("accepted")) {
            start = start + itemString;
        }
    }

    // setStorageItem("stop", stop);
    // setStorageItem("start", start);
    // setStorageItem("continue", cont);

    // save patient name
    // setStorageItem("patient_name", patientLastName + ", " + patientFirstName);
}

// updates cycling/options and does redraw depending on dontRedraw
function updateGroupBy(toGroup, dontRedraw) {

    // update cycling if toGroup is valid
    let $next_val;
    let $next_name;

    // if going to group by drug class, next one is none
    if (toGroup === "__ATTR_DIAGNOSES__") {
        $next_val = "";
        $next_name = "none";
    } else {// otherwise next is drug class
        $next_val = "__ATTR_DIAGNOSES__";
        $next_name = "diagnoses";
    }

    // update the grouping in the options (using value)
    $("select[name='groupBy']").val(toGroup);

    // update the cycle group button's text
    $(".cycle_groupBy").html("group by: " + $next_name);
    $(".cycle_groupBy").attr("value", $next_val);

    setGroupBy(toGroup)

    // force; grouping in identical + similar can have problems due to group height changes
    //  two alternatives: have extra space to handle group height changes OR incorporate shifting into animation
    // if (groupBy && state < STATE_SIMILAR && state !== STATE_SEPARATE) {
    if (getGroupBy() && state < STATE_SIMILAR && state !== STATE_SEPARATE) {
        state = STATE_SIMILAR;
    }

    if (!dontRedraw)
        redraw(true, true);
}

