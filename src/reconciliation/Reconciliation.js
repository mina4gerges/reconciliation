import React, { useEffect, useState } from "react";

import "./Reconciliation.css";

import { DATASET_DEFAULT, init, populateLists } from "./ReconciliationModel";
import {
    adjustBackdrop,
    changeState,
    initAnimation,
    populateBackdrop,
    populateItems,
    redraw,
    resetDecisions,
} from "./ReconciliationAnimation";

const Reconciliation = () => {

    const [items, setItems] = useState([]);

    useEffect(() => {
        init(DATASET_DEFAULT);
        setItems(populateLists(DATASET_DEFAULT));
        initAnimation(false, "__AUTO_ANIMATE_OFF__");
    }, []);

    return <div id="reconciliation" className="content-text">

        <button onClick={() => changeState(4)}>Animate</button>
        <button onClick={() => changeState(1)}>identical</button>
        <button onClick={() => changeState(2)}>unique</button>
        <button onClick={() => changeState(3)}>similar</button>
        <button onClick={() => changeState(4)}>compact</button>
        <button onClick={() => {
            resetDecisions();
            redraw(true, true)
        }}>Reset
        </button>

        <div className="content">
            <table className="backdrop backdrop-header">
                {populateBackdrop()}
            </table>
            <div className="scrolling_content scroll-y">
                <table className="backdrop backdrop-body">
                    <tbody>
                        {adjustBackdrop(0)}
                    </tbody>
                </table>
                <div className="items">
                    {populateItems(items)}
                </div>
            </div>
        </div>
    </div>
}

export default Reconciliation;
