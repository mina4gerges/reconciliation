$(function () {

    let dataset = model.DATASET_DEFAULT;
    let version = controller.versionDefault;
    let autoAnimate = controller.autoAnimateDefault;

    model.init(dataset);

    controller.init(false, version, autoAnimate);

    logger.init();
});

