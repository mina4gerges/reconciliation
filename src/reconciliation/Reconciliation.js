import React, { useEffect } from "react";

import "../Reconciliation.css";

import { DATASET_DEFAULT, init } from "./model";
import { autoAnimateDefault, initController, versionDefault } from "./controller";

const Reconciliation = () => {

    useEffect(() => {
        init(DATASET_DEFAULT);
        initController(false, versionDefault, autoAnimateDefault);
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
