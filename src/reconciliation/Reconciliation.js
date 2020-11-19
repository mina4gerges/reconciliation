import React, { useEffect } from "react";

import "./Reconciliation.css";

import { DATASET_DEFAULT, init } from "./ReconciliationModel";
import { autoAnimateDefault, initAnimation, versionDefault } from "./ReconciliationAnimation";

const Reconciliation = () => {

    useEffect(() => {
        init(DATASET_DEFAULT);
        initAnimation(false, versionDefault, autoAnimateDefault);
    }, []);

    return <div id="reconciliation" className="content-text">
        <div className="content">
            <table className="backdrop backdrop-header" />
            <div className="scrolling_content scroll-y">
                <table className="backdrop backdrop-body" />
                <div className="items" />
            </div>
        </div>
    </div>
}

export default Reconciliation;
