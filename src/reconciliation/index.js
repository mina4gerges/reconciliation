// import { loggerInit } from "./logger";
import { DATASET_DEFAULT, init } from "./model";
import { autoAnimateDefault, initController, versionDefault } from "./controller";

export const index = () => {

    init(DATASET_DEFAULT);


    initController(false, versionDefault, autoAnimateDefault);


    // loggerInit();
}

