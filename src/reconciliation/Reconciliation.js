import React, { useEffect } from "react";

import "../Reconciliation.css";

import { index } from './index';

const loadScript = url => {

    let script = document.createElement("script")
    script.type = "text/javascript";
    script.async = false;
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

const Reconciliation = () => {
    useEffect(() => {
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/jquery-1.7.1.min.js`);
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/jquery.transit.min.js`);
        index();
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/utils.js`);
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/model.js`);
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/logger.js`);
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/controller.js`);
        // loadScript(`${process.env.PUBLIC_URL}/js/reconciliation/index.js`);
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
