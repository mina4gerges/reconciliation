import { toggleItem, toggleOffDelay, toggleOnDelay } from "./ReconciliationAnimation";

let dataset = "";
let shadows = {};
let filterOn = "";
export let items = {};
export let hidden = {};
let itemsToShadows = {};
export let groupBy = "";
export let unique1 = [];
export let unique2 = [];
export let identical = [];
export let similar = [];
export let attributes = {};
export let diagnosisSet = {};
export let drugClassSet = {};
const FILTER_DELAY_SCALE = 4;
export let multigroup = false;
export let shadowsToItems = {};
export const DEFAULT_GROUP = "";
const sortBy = "__ATTR_NAME__";
export const ATTR_NAME = "__ATTR_NAME__";
export const RECORDED_NAME = "recorded";
export let displayName = RECORDED_NAME;
export const ATTR_DOSE = "__ATTR_DOSE__";
export const ATTR_ROUTE = "__ATTR_ROUTE__";
const ATTR_DIAGNOSES = "__ATTR_DIAGNOSES__";
export const ATTR_SUBITEM = "__ATTR_SUBITEM__";
const ATTR_DRUG_CLASS = "__ATTR_DRUG_CLASS__";
export const ATTR_FREQUENCY = "__ATTR_FREQUENCY__";
const ATTR_DATE_STARTED = "__ATTR_DATE_STARTED__";
const ATTR_INSTRUCTIONS = "__ATTR_INSTRUCTIONS__";
const ATTR_TYPE_NUMERIC = "__ATTR_TYPE_NUMERIC__";
const ATTR_TYPE_GENERAL = "__ATTR_TYPE_GENERAL__";
export let afterAction = "__AFTER_ACTION_GRAYOUT__";
const ATTR_TYPE_CATEGORICAL = "__ATTR_TYPE_CATEGORICAL__";
export const DATASET_DEFAULT = "__DATASET_APPENDECTOMY__";
export const AFTER_ACTION_REMOVE = "__AFTER_ACTION_REMOVE__";
export const AFTER_ACTION_GRAYOUT = "__AFTER_ACTION_GRAYOUT__";

export const list1 = {
    id: "list0",
    name: "Intake",
    source: []
};

export const list2 = {
    id: "list1",
    name: "Hospital",
    source: []
};

// expected column names of csv format - all items have these attributes given in the csv
let CSVC = {
    ID: "id",
    DOSE: "dose",
    ROUTE: "route",
    ORIGIN: "origin",
    B_NAME: "brand name",
    G_NAME: "generic name",
    DIAGNOSES: "diagnoses",
    FREQUENCY: "frequency",
    R_NAME: "recorded name",
    DRUG_CLASSES: "drug classes",
};

/*
 * Hard-coded datasets used by Twinlist, in future, should retrieve from other data source
 * Assumptions
 *      patient information contained in dataset
 *      item relationships present as a list of unique1, list of unique2, list of lists of identical items,
 *       similar items given as a list of objects where each object describes what items are similar and what
 *       the differences are
 *      csv format for data with specific column names (see CSVC)
 *      any addtional information not present in the csv format can be given as "other_data"
 *       Assumes the keys match the attribute constants used by Twinlist (e.g. see visible.ATTR_ROUTE, etc.)
 */
let DATASETS = {
    "__DATASET_APPENDECTOMY__": {
        // patient data
        patientFirstName: "David",
        patientLastName: "Doe",
        patientAge: 55,
        patientGender: "M",

        // item relationships
        unique1: [0, 5],
        unique2: [9, 10],
        identical: [[1, 11], [4, 8]],
        similar: [
            { items: [2, 7], differences: [ATTR_NAME, ATTR_DOSE] },
            { items: [3, 6], differences: [ATTR_NAME] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic",atherosclerotic vascular disease\n' +
            '1,list0,Chantix,varenicline,Chantix,81 mg,PO,daily,antismoking,nicotine dependence\n' +
            '2,list0,Lipitor,atorvastatin,Lipitor,20 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '3,list0,Capoten,captopril,Capoten,25 mg,PO,BID,antihypertensive,hypertension\n' +
            '4,list0,multivitamin,multivitamin,multivitamin,1 tablet,PO,daily,dietary supplement,vitamin deficiency\n' +
            '5,list0,Sonata,zaleplon,Sonata,10 mg,PO,qHS prn,sedative,insomnia\n' +
            '6,list1,captopril,captopril,Capoten,25 mg,PO,BID,antihypertensive,hypertension\n' +
            '7,list1,atorvastatin,atorvastatin,Lipitor,25 mg,PO,qAM,anticholesterol,hypercholesterolemia\n' +
            '8,list1,multivitamin,multivitamin,multivitamin,1 tablet,PO,daily,dietary supplement,vitamin deficiency\n' +
            '9,list1,temazepam,temazepam,Restoril,15 mg,PO,qHS,"sedative,antianxiety",insomnia\n' +
            '10,list1,tramadol,tramadol,Ultram,50 mg,PO,q4h prn pain,analgesic,pain\n' +
            '11,list1,Chantix,varenicline,Chantix,81 mg,PO,daily,antismoking,nicotine dependence'
    },  // end of APP

    "__DATASET_CONGESTIVE_HEART_FAILURE_1__": {
        // patient data
        patientFirstName: "Jim",
        patientLastName: "Jones",
        patientAge: 74,
        patientGender: "M",

        // item relationships
        unique1: [3, 8],
        unique2: [16, 18, 20],
        identical: [[5, 12], [7, 13]],
        similar: [
            { items: [0, 11], differences: [ATTR_FREQUENCY] },
            { items: [1, 22], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [2, 17], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [4, 15], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [6, 14], differences: [ATTR_FREQUENCY] },
            { items: [9, 21], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [10, 19], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,acetaminophen,acetaminophen,Tylenol,650 mg,PO,q4h prn,"analgesic,antipyretic",pain\n' +
            '1,list0,Aldactone,spironolactone,Aldactone,100 mg,PO,daily,antihypertensive,hypertension\n' +
            '2,list0,Amaryl,glimepiride,Amaryl,4 mg,PO,daily,antidiabetic,diabetes\n' +
            '3,list0,Ambien,zolpidem,Ambien,10 mg,PO,qHS prn,sedative,insomnia\n' +
            '4,list0,Aricept,donepezil,Aricept,10 mg,PO,daily,acetylcholinesterase inhibitor,dementia\n' +
            '5,list0,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic","atherosclerotic vascular disease, pain"\n' +
            '6,list0,cimetidine,cimetidine,Tagamet,800 mg,PO,BID,antacid,GERD\n' +
            '7,list0,Coreg,carvedilol,Coreg,6.25 mg,PO,BID,antihypertensive,hypertension\n' +
            '8,list0,Colace,ducosate,Colace,100 mg,PO,BID,stool softener,constipation\n' +
            '9,list0,Crestor,rosuvastatin,Crestor,20 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '10,list0,Hyzaar,losartan + hydrochlorothiazide,Hyzaar,100 / 25 mg,PO,daily,"antihypertensive,diuretic","antihypertensive, diuretic"\n' +
            '11,list1,acetaminophen,acetaminophen,Tylenol,650 mg,PO,q4h prn headache or pain,"analgesic,antipyretic",pain\n' +
            '12,list1,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic",atherosclerotic vascular disease\n' +
            '13,list1,Coreg,carvedilol,Coreg,6.25 mg,PO,BID,antihypertensive,hypertension\n' +
            '14,list1,cimetidine,cimetidine,Tagamet,800 mg,PO,q12h,antacid,GERD\n' +
            '15,list1,donepezil,donepezil,Aricept,10 mg,PO,qAM,acetylcholinesterase inhibitor,dementia\n' +
            '16,list1,furosemide,furosemide,Lasix,40 mg,PO,BID,"diuretic,antihypertensive",congestive heart failure\n' +
            '17,list1,glimepiride,glimepiride,Amaryl,4 mg,PO,qAM,antidiabetic,diabetes\n' +
            '18,list1,lorazepam,lorazepam,Ativan,1 mg,PO,qHS prn insomnia,"sedative,antianxiety",insomnia\n' +
            '19,list1,losartan,losartan,Cozaar,50 mg,PO,qAM,antihypertensive,hypertension\n' +
            '20,list1,magnesium hydroxide,magnesium hydroxide,Milk of magnesia,30 ml,PO,daily prn constipation,"laxative,antacid",constipation\n' +
            '21,list1,rosuvastatin,rosuvastatin,Crestor,20 mg,PO,qAM,anticholesterol,hypercholesterolemia\n' +
            '22,list1,spironolactone,spironolactone,Aldactone,100 mg,PO,qAM,antihypertensive,hypertension',

        // optional data (Note: displayed in item details but not really used)
        other_data: {
            10: {
                "__ATTR_SUBITEM__": [
                    { name: "losartan", attributes: { "__ATTR_DOSE__": "100 mg" } },
                    { name: "hydrochlorothiazide", attributes: { "__ATTR_DOSE__": "25 mg" } }]
            }
        }
    }, // end of CHF1

    '__DATASET_CONGESTIVE_HEART_FAILURE_2__': {
        // patient data
        patientFirstName: "Mary",
        patientLastName: "Smith",
        patientAge: 65,
        patientGender: "F",

        // item relationships
        unique1: [5, 6, 8],
        unique2: [14, 21],
        identical: [[7, 15], [9, 16]],
        similar: [
            { items: [0, 11], differences: [ATTR_NAME] },
            { items: [1, 12], differences: [ATTR_NAME, ATTR_DOSE] },
            { items: [2, 13], differences: [ATTR_NAME, ATTR_DOSE] },
            { items: [3, 18], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [4, 19, 20], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] },
            { items: [10, 17], differences: [ATTR_FREQUENCY] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,Coreg,carvedilol,Coreg,25 mg,PO,BID,antihypertensive,hypertension\n' +
            '1,list0,HCTZ,hydrochlorothiazide,Hydrodiuril,25 mg,PO,daily,"diuretic,antihypertensive",congestive heart failure\n' +
            '2,list0,Coumadin,warfarin,Coumadin,5 mg,PO,daily,anticoagulant,thrombosis\n' +
            '3,list0,Lasix,furosemide,Lasix,40 mg,PO,daily,"diuretic,antihypertensive",congestive heart failure\n' +
            '4,list0,Percocet,acetaminophen + oxycodone,Percocet,1 tablet,PO,q4h prn pain,analgesic,pain\n' +
            '5,list0,Zantac,ranitidine,Zantac,150 mg,PO,BID,antacid,GERD\n' +
            '6,list0,Dulcolax,bisacodyl,Dulcolax,10 mg,PO,daily prn,laxative,constipation\n' +
            '7,list0,loratadine,loratadine,Claritin,10 mg,PO,daily prn,antihistamine,nasal congestion\n' +
            '8,list0,Metamucil,psyllium husk,Metamucil,1 tbsp,PO,daily,stool softener,constipation\n' +
            '9,list0,pravastatin,pravastatin,Pravachol,40 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '10,list0,zaleplon,zaleplon,Sonata,10 mg,PO,qHS prn,sedative,insomnia\n' +
            '11,list1,carvedilol,carvedilol,Coreg,25 mg,PO,BID,antihypertensive,hypertension\n' +
            '12,list1,hydrochlorothiazide,hydrochlorothiazide,Hydrodiuril,50 mg,PO,daily,"diuretic,antihypertensive",congestive heart failure\n' +
            '13,list1,warfarin,warfarin,Coumadin,4 mg,PO,daily,anticoagulant,thrombosis\n' +
            '14,list1,magnesium hydroxide,magnesium hydroxide,Milk of Magnesia,30 ml,PO,daily prn constipation,"laxative,antacid",constipation\n' +
            '15,list1,loratadine,loratadine,Claritin,10 mg,PO,daily prn,antihistamine,nasal congestion\n' +
            '16,list1,pravastatin,pravastatin,Pravachol,40 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '17,list1,zaleplon,zaleplon,Sonata,10 mg,PO,qHS prn insomnia,sedative,insomnia\n' +
            '18,list1,furosemide,furosemide,Lasix,40 mg,PO,BID,"diuretic,antihypertensive",congestive heart failure\n' +
            '19,list1,oxycodone,oxycodone,Oxycontin,5 mg,PO,q4-6h prn pain,analgesic,pain\n' +
            '20,list1,acetaminophen,acetaminophen,Tylenol,650 mg,PO,q4h prn pain,analgesic,pain\n' +
            '21,list1,pantoprazole,pantoprazole,Protonix,20 mg,PO,BID,antacid,GERD',

        other_data: {
            4: {
                "__ATTR_SUBITEM__": [
                    { name: "acetaminophen", attributes: { "__ATTR_DOSE__": "" } },
                    { name: "oxycodone", attributes: { "__ATTR_DOSE__": "" } }]
            }
        }
    }, // end of CHF2

    '__DATASET_PULMONARY_DISEASE_1__': {
        // patient data
        patientFirstName: "Penny",
        patientLastName: "Pfeifer",
        patientAge: 63,
        patientGender: "F",

        // item relationships
        unique1: [0, 2, 5, 6, 10, 11, 12, 14],
        unique2: [16, 19, 22, 23, 25, 27],
        identical: [[3, 26], [15, 18]],
        similar: [
            { items: [1, 28], differences: [ATTR_NAME] },
            { items: [4, 13, 17], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] },
            { items: [7, 20], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [8, 24], differences: [ATTR_DOSE] },
            { items: [9, 21], differences: [ATTR_NAME, ATTR_FREQUENCY] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,Abilify,aripiprazole,Abilify,5 mg,PO,daily,"antipsychotic,antidepressant",depression\n' +
            '1,list0,Advair,salmeterol + fluticasone,Advair,250 / 50 mg,PO,BID,bronchodilator,COPD\n' +
            '2,list0,Bactrim,trimethoprim + sulfamethoxazole,Bactrim,2 tablets,PO,q12h,antibiotic,pneumonia\n' +
            '3,list0,multivitamin,multivitamin,multivitamin,1 tablet,PO,daily,dietary supplement,vitamin deficiency\n' +
            '4,list0,Fosamax+D,alendronate + vitamin D,Fosamax+D,1 tablet,PO,daily,bone resorption inhibitor,osteoporosis\n' +
            '5,list0,Hygroton,chlorthalidone,Hygroton,50 mg,PO,daily,"diuretic,antihypertensive",hypertension\n' +
            '6,list0,Lunesta,eszopiclone,Lunesta,2 mg,PO,qHS prn,sedative,insomnia\n' +
            '7,list0,Plavix,clopidogrel,Plavix,75 mg,PO,daily,antiplatelet,atherosclerotic vascular disease\n' +
            '8,list0,prednisone,prednisone,Deltasone,40 mg,PO,taper,corticosteroid,COPD\n' +
            '9,list0,Premarin,conjugated estrogens,Premarin,0.3 mg,PO,daily,sex hormone,menopause symptoms\n' +
            '10,list0,Metamucil,psyllium husk,Metamucil,1 tbsp,PO,daily,stool softener,constipation\n' +
            '11,list0,Nexium,esomeprazole,Nexium,20 mg,PO,daily,antacid,GERD\n' +
            '12,list0,Senokot,sennosides,Senokot,2 tablets,PO,daily prn constipation,laxative,constipation\n' +
            '13,list0,vitamin D,vitamin D,Calciferol,800 IU,PO,daily,dietary supplement,vitamin deficiency\n' +
            '14,list0,Zestril,lisinopril,Zestril,20 mg,PO,daily,antihypertensive,hypertension\n' +
            '15,list0,bupropion,bupropion,Zyban,150 mg,PO,BID,"antidepressant,antismoking",antidepressant\n' +
            '16,list1,acetaminophen,acetaminophen,Tylenol,650 mg,PO,q4h prn headache,"analgesic,antipyretic",pain\n' +
            '17,list1,alendronate,alendronate,Fosamax,10 mg,PO,daily,bone resorption inhibitor,osteoporosis\n' +
            '18,list1,bupropion,bupropion,Zyban,150 mg,PO,BID,"antidepressant,antismoking",antidepressant\n' +
            '19,list1,moxifloxacin,moxifloxacin,Avelox,400 mg,PO,daily,antibiotic,pneumonia\n' +
            '20,list1,clopidogrel,clopidogrel,Plavix,75 mg,PO,qAM,antiplatelet,atherosclerotic vascular disease\n' +
            '21,list1,conjugated estrogens,conjugated estrogens,Premarin,0.3 mg,PO,qAM,sex hormone,menopause symptoms\n' +
            '22,list1,hydrochlorthiazide,hydrochlorthiazide,Hydrodiuril,50 mg,PO,qAM,"diuretic,antihypertensive",hypertension\n' +
            '23,list1,lorazepam,lorazepam,Ativan,0.5 mg,PO,qHS prn,"sedative,antianxiety",anxiety\n' +
            '24,list1,prednisone,prednisone,Deltasone,30 mg,PO,taper,corticosteroid,COPD\n' +
            '25,list1,magnesium hydroxide,magnesium hydroxide,Milk of Magnesia,30 ml,PO,daily prn constipation,"laxative,antacid",constipation\n' +
            '26,list1,multivitamin,multivitamin,multivitamin,1 tablet,PO,daily,dietary supplement,vitamin deficiency\n' +
            '27,list1,pantoprazole,pantoprazole,Protonix,40 mg,PO,qAM,antacid,GERD\n' +
            '28,list1,salmeterol + fluticasone,salmeterol + fluticasone,Advair,250 / 50 mg,PO,BID,bronchodilator,bronchodilator',

        other_data: {
            1: {
                "__ATTR_SUBITEM__": [
                    { name: "salmeterol", attributes: { "__ATTR_DOSE__": "250 mg" } },
                    { name: "fluticasone", attributes: { "__ATTR_DOSE__": "50 mg" } }]
            },
            2: {
                "__ATTR_SUBITEM__": [
                    { name: "trimethoprim", attributes: { "__ATTR_DOSE__": "" } },
                    { name: "sulfamethoxazole", attributes: { "__ATTR_DOSE__": "" } }],
                "__ATTR_DATE_STARTED__": ["started 3 days ago"]
            },
            4: {
                "__ATTR_SUBITEM__": [
                    { name: "alendronate", attributes: { "__ATTR_DOSE__": "" } },
                    { name: "vitamin D", attributes: { "__ATTR_DOSE__": "" } }]
            },
            28: {
                "__ATTR_SUBITEM__": [
                    { name: "salmeterol", attributes: { "__ATTR_DOSE__": "250 mg" } },
                    { name: "fluticasone", attributes: { "__ATTR_DOSE__": "50 mg" } }]
            }
        }
    }, // end of PD1

    '__DATASET_PULMONARY_DISEASE_2__': {
        // patient data
        patientFirstName: "Richard",
        patientLastName: "White",
        patientAge: 80,
        patientGender: "M",

        // item relationships
        unique1: [0, 2, 3, 10, 11, 12, 15],
        unique2: [16, 18, 19, 20, 29],
        identical: [[5, 22], [6, 23], [13, 27]],
        similar: [
            { items: [1, 17], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] },
            { items: [4, 21], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] },
            { items: [7, 24], differences: [ATTR_NAME] },
            { items: [8, 25], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [9, 26], differences: [ATTR_NAME] },
            { items: [14, 28], differences: [ATTR_NAME] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,dabigatran,dabigatran,Pradaxa,150 mg,PO,BID,anticoagulant,atrial fibrillation\n' +
            '1,list0,Zestoretic,hydrochlorothiazide + lisinopril,Zestoretic,20 / 12.5 mg,PO,daily,"antihypertensive,diuretic",hypertension\n' +
            '2,list0,metformin,metformin,Glucophage,850 mg,PO,daily,antidiabetic,diabetes\n' +
            '3,list0,Micronase,glyburide,glyburide,5 mg,PO,daily,antidiabetic,diabetes\n' +
            '4,list0,Toprol XL,metoprolol,Toprol XL,25 mg,PO,daily,antihypertensive,hypertension\n' +
            '5,list0,acetaminophen,acetaminophen,Tylenol,1 g,PO,q6h prn pain,"analgesic,antipyretic",pain\n' +
            '6,list0,tramadol,tramadol,Ultram,50 mg,PO,q6h prn pain,analgesic,pain\n' +
            '7,list0,Plavix,clopidogrel,Plavix,75 mg,PO,daily,antiplatelet,atherosclerotic vascular disease\n' +
            '8,list0,Aricept,donepezil,Aricept,10 mg,PO,daily,acetylcholinesterase inhibitor,dementia\n' +
            '9,list0,Prozac,fluoxetine,Prozac,20 mg,PO,daily,antidepressant,depression\n' +
            '10,list0,vitamin B12,vitamin B12,vitamin B12,1000 mcg,SC,qMonth,dietary supplement,vitamin deficiency\n' +
            '11,list0,Calciferol,vitamin D,Calciferol,600 IU,PO,daily,dietary supplement,osteoporosis\n' +
            '12,list0,calcium carbonate,calcium carbonate,Tums,500 mg,PO,QID,dietary supplement,osteoporosis\n' +
            '13,list0,lorazepam,lorazepam,Ativan,1 mg,PO,q8h prn anxiety,"sedative,antianxiety",anxiety\n' +
            '14,list0,Lipitor,rosuvastatin,Lipitor,40 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '15,list0,Tirosint,levothyroxine,Tirosint,100 mcg,PO,daily,thyroid,hypothyroidism\n' +
            '16,list1,enoxaparin,enoxaparin,Lovenox,40 mg,SC,daily,anticoagulant,atrial fibrillation\n' +
            '17,list1,lisinopril,lisinopril,Zestril,20 mg,PO,daily,antihypertensive,hypertension\n' +
            '18,list1,hydrochlorothiazide,hydrochlorothiazide,Hydrodiuril,12.5 mg,PO,daily,"diuretic,antihypertensive",hypertension\n' +
            '19,list1,insulin sliding scale,insulin sliding scale,Humulin,,SC,q4h prn,antidiabetic,diabetes\n' +
            '20,list1,Lantus,insulin glargine,Lantus,20 mg,SC,qHS,antidiabetic,diabetes\n' +
            '21,list1,metoprolol,metoprolol,Toprol XL,50 mg,PO,BID,antihypertensive,hypertension\n' +
            '22,list1,acetaminophen,acetaminophen,Tylenol,1 g,PO,q6h prn pain,"analgesic,antipyretic",pain\n' +
            '23,list1,tramadol,tramadol,Ultram,50 mg,PO,q6h prn pain,analgesic,pain\n' +
            '24,list1,clopidogrel,clopidogrel,Plavix,75 mg,PO,daily,antiplatelet,atherosclerotic vascular disease\n' +
            '25,list1,donepezil,donepezil,Aricept,10 mg,PO,qHS,acetylcholinesterase inhibitor,dementia\n' +
            '26,list1,fluoxetine,fluoxetine,Prozac,20 mg,PO,daily,antidepressant,depression\n' +
            '27,list1,lorazepam,lorazepam,Ativan,1 mg,PO,q8h prn anxiety,"sedative,antianxiety",anxiety\n' +
            '28,list1,rosuvastatin,rosuvastatin,Lipitor,40 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '29,list1,cephalexin,cephalexin,Biocef,500 mg,PO,q6h,antibiotic,cellulitis',

        other_data: {
            1: {
                "__ATTR_SUBITEM__": [
                    { name: "hydrochlorothiazide", attributes: { "__ATTR_DOSE__": "20 mg" } },
                    { name: "lisinopril", attributes: { "__ATTR_DOSE__": "12.5 mg" } }]
            },
            29: {
                "__ATTR_DATE_STARTED__": ["started 1 day ago"]
            },
        }
    }, // end of PD2

    '__DATASET_OTHER_SIMPLE__': {
        // patient data
        patientFirstName: "John",
        patientLastName: "Doe",
        patientAge: 30,
        patientGender: "M",

        // item relationships
        unique1: [4],
        unique2: [9, 10, 13],
        identical: [[1, 7], [2, 12], [3, 11]],
        similar: [
            { items: [0, 6], differences: [ATTR_FREQUENCY] },
            { items: [5, 8], differences: [ATTR_NAME] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,Acetaminophen,Acetaminophen,Acetaminophen,325 mg,PO,q6h,"analgesic,antipyretic",\n' +
            '1,list0,Darbepoetin,Darbepoetin,Darbepoetin,60 mg,SC,qFriday,ESA,\n' +
            '2,list0,Calcitrol,Calcitrol,Calcitrol,0.25 mg,PO,daily,supplement,\n' +
            '3,list0,Ramipril,Ramipril,Ramipril,5 mg,PO,daily,ACE inhibitor,\n' +
            '4,list0,Meloxicam,Meloxicam,Meloxicam,7.5 mg,PO,daily,"analgesic,NSAID",\n' +
            '5,list0,Folvite,Folvite,Folvite,1 mg,PO,daily,supplement,\n' +
            '6,list1,Acetaminophen,Acetaminophen,Acetaminophen,325 mg,PO,q4h,"analgesic,antipyretic",\n' +
            '7,list1,Darbepoetin,Darbepoetin,Darbepoetin,60 mg,SC,qFriday,ESA,\n' +
            '8,list1,Folic acid,Folic acid,Folic acid,1 mg,PO,daily,supplement,\n' +
            '9,list1,Omeprazole,Omeprazole,Omeprazole,40 mg,PO,daily,proton-pump inhibitor,\n' +
            '10,list1,Ciprofloxacin,Ciprofloxacin,Ciprofloxacin,500 mg,PO,daily,antibiotic,\n' +
            '11,list1,Ramipril,Ramipril,Ramipril,5 mg,PO,daily,ACE inhibitor,\n' +
            '12,list1,Calcitrol,Calcitrol,Calcitrol,0.25 mg,PO,daily,supplement,\n' +
            '13,list1,Ferrous Gloconate,Ferrous Gloconate,Ferrous Gloconate,300 mg,PO,TID,supplement,',

        other_data: {
            10: {
                "__ATTR_DATE_STARTED__": ["started 4 days ago"]
            }
        }
    }, // end of O_SIMPLE

    '__DATASET_OTHER_COMPLEX__': {
        // patient data
        patientFirstName: "Jane",
        patientLastName: "Doe",
        patientAge: 30,
        patientGender: "F",

        // item relationships
        unique2: [14],
        unique1: [2, 7, 8],
        identical: [[0, 4, 13], [5, 16]],
        similar: [
            {
                items: [0, 1, 4, 11, 13, 15],
                differences: [ATTR_NAME, ATTR_FREQUENCY]
            },
            { items: [3, 6, 10], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [9, 12], differences: [ATTR_NAME] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,Acetaminophen,Acetaminophen,Acetaminophen,325 mg,PO,q4h,"analgesic,antipyretic",\n' +
            '1,list0,Tylenol,Tylenol,Tylenol,325 mg,PO,q6h,"analgesic,antipyretic",\n' +
            '2,list0,Zyrtec,Zyrtec,Zyrtec,10 mg,PO,daily,"antihistamine",\n' +
            '3,list0,Allegra-D,Allegra-D,Allegra-D,60 / 120 mg,PO,BID,"antihistamine,decongestant",\n' +
            '4,list0,Acetaminophen,Acetaminophen,Acetaminophen,325 mg,PO,q4h,"analgesic,antipyretic",\n' +
            '5,list0,Darbepoetin,Darbepoetin,Darbepoetin,60 mg,SC,qFriday,"ESA",\n' +
            '6,list0,Sudafed,Sudafed,Sudafed,30 mg,PO,q6h,"decongestant",\n' +
            '7,list0,Aspirin,Aspirin,Aspirin,81 mg,PO,daily,"salicylate",\n' +
            '8,list0,Claritin,Claritin,Claritin,10 mg,PO,daily,"antihistamine",\n' +
            '9,list0,Advil,Advil,Advil,200 mg,PO,q4h,"NSAID",\n' +
            '10,list1,Fexofenadine,Fexofenadine,Fexofenadine,60 mg,PO,daily,"antihistamine",\n' +
            '11,list1,Acetaminophen,Acetaminophen,Acetaminophen,3325 mg,PO,q4h,"analgesic,antipyretic",\n' +
            '12,list1,Ibuprofen,Ibuprofen,Ibuprofen,200 mg,PO,q4h,"NSAID",\n' +
            '13,list1,Acetaminophen,Acetaminophen,Acetaminophen,325 mg,PO,q4h,"analgesic,antipyretic",\n' +
            '14,list1,Prednisone,Prednisone,Prednisone,30 mg,PO,daily,"corticosteroid",\n' +
            '15,list1,Acetaminophen,Acetaminophen,Acetaminophen,325 mg,PO,q6h,"analgesic,antipyretic",\n' +
            '16,list1,Darbepoetin,Darbepoetin,Darbepoetin,60 mg,SC,qFriday,"ESA",',

        other_data: {
            3: {
                '__ATTR_SUBITEM__': [
                    { name: "Fexofenadine", attributes: { "__ATTR_DOSAGE__": ["60 mg"] } },
                    { name: "Pseudoephedrine", attributes: { "__ATTR_DOSAGE__": ["120 mg"] } }]
            }
        }

    }, // end of O_COMPLEX

    '__DATASET_OTHER_EXTRA__': {
        // patient data
        patientFirstName: "Jim",
        patientLastName: "Jones",
        patientAge: 74,
        patientGender: "M",

        // item relationships
        unique1: [2, 7],
        unique2: [14, 15, 17],
        identical: [[4, 10], [6, 11]],
        similar: [
            { items: [1, 20], differences: [ATTR_NAME] },
            { items: [0, 19], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [3, 13], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [5, 12], differences: [ATTR_FREQUENCY] },
            { items: [8, 18], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [9, 16], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,Aldactone,spironolactone,Aldactone,100 mg,PO,daily,"antihypertensive",hypertension\n' +
            '1,list0,Avelox,moxifloxacin,Avelox,400 mg,PO,daily,"antibiotic",pneumonia\n' +
            '2,list0,Ambien,zolpidem,Ambien,10 mg,PO,qHS prn,"sedative",insomnia\n' +
            '3,list0,Aricept,donepezil,Aricept,10 mg,PO,daily,"acetylcholinesterase inhibitor",dementia\n' +
            '4,list0,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic","atherosclerotic vascular disease, pain"\n' +
            '5,list0,cimetidine,cimetidine,Tagamet,800 mg,PO,BID,"antacid",GERD\n' +
            '6,list0,Coreg,carvedilol,Coreg,6.25 mg,PO,BID,"antihypertensive",hypertension\n' +
            '7,list0,Colace,ducosate,Colace,100 mg,PO,BID,"stool softener",constipation\n' +
            '8,list0,Crestor,rosuvastatin,Crestor,20 mg,PO,daily,"anticholesterol",hypercholesterolemia\n' +
            '9,list0,Hyzaar,losartan + hydrochlorothiazide,Hyzaar,100 / 25 mg,PO,daily,"antihypertensive,diuretic","antihypertensive, diuretic"\n' +
            '10,list1,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic",atherosclerotic vascular disease\n' +
            '11,list1,Coreg,carvedilol,Coreg,6.25 mg,PO,BID,"antihypertensive",hypertension\n' +
            '12,list1,cimetidine,cimetidine,Tagamet,800 mg,PO,q12h,"antacid",GERD\n' +
            '13,list1,donepezil,donepezil,Aricept,10 mg,PO,qAM,"acetylcholinesterase inhibitor",dementia\n' +
            '14,list1,furosemide,furosemide,Lasix,40 mg,PO,BID,"diuretic,antihypertensive",congestive heart failure\n' +
            '15,list1,lorazepam,lorazepam,Ativan,1 mg,PO,qHS prn insomnia,"sedative,antianxiety",insomnia\n' +
            '16,list1,losartan,losartan,Cozaar,50 mg,PO,qAM,"antihypertensive",hypertension\n' +
            '17,list1,magnesium hydroxide,magnesium hydroxide,Milk of magnesia,30 ml,PO,daily prn constipation,"laxative,antacid",constipation\n' +
            '18,list1,rosuvastatin,rosuvastatin,Crestor,20 mg,PO,qAM,"anticholesterol",hypercholesterolemia\n' +
            '19,list1,spironolactone,spironolactone,Aldactone,100 mg,PO,qAM,"antihypertensive",hypertension\n' +
            '20,list1,moxifloxacin,moxifloxacin,Avelox,400 mg,PO,daily,"antibiotic",pneumonia',

        other_data: {
            1: {
                '__ATTR_DATE_STARTED__': // always 2 days ago
                    ["Started " +
                    new Date(Date.now() - 172800000).toDateString().split(" ")[1] + ". " +
                    new Date(Date.now() - 172800000).toDateString().split(" ")[2] + ", " +
                    new Date(Date.now() - 172800000).toDateString().split(" ")[3] + " (2 days ago)"]
            },
            9: {
                '__ATTR_SUBITEM__': [
                    { name: "losartan", attributes: { "__ATTR_DOSE__": "100 mg" } },
                    { name: "hydrochlorothiazide", attributes: { "__ATTR_DOSE__": "25 mg" } }],
            },
            20: {
                '__ATTR_DATE_STARTED__': // always 1 day ago
                    ["Started " +
                    new Date(Date.now() - 86400000).toDateString().split(" ")[1] + ". " +
                    new Date(Date.now() - 86400000).toDateString().split(" ")[2] + ", " +
                    new Date(Date.now() - 86400000).toDateString().split(" ")[3] + " (1 day ago)"]
            },
        }
    }, // end of O_EXTRA
    // (Note: was only used to generate a compact screenshot with grouping by drug class + showing dates on
    // antibiotics)

    '__DATASET_PULMONARY_DISEASE_2_CORRECTED__': {
        // patient data
        patientFirstName: "Richard",
        patientLastName: "White",
        patientAge: 80,
        patientGender: "M",

        // item relationships
        unique1: [0, 2, 3, 10, 11, 12, 15],
        unique2: [16, 19, 20, 29],

        identical: [[5, 22], [6, 23], [13, 27]],

        similar: [
            { items: [1, 17, 18], differences: [ATTR_NAME, ATTR_DOSE] },
            { items: [4, 21], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] },
            { items: [7, 24], differences: [ATTR_NAME] },
            { items: [8, 25], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [9, 26], differences: [ATTR_NAME] },
            { items: [14, 28], differences: [ATTR_NAME] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,dabigatran,dabigatran,Pradaxa,150 mg,PO,BID,anticoagulant,atrial fibrillation\n' +
            '1,list0,Zestoretic,hydrochlorothiazide + lisinopril,Zestoretic,20 / 12.5 mg,PO,daily,"antihypertensive,diuretic",hypertension\n' +
            '2,list0,metformin,metformin,Glucophage,850 mg,PO,daily,antidiabetic,diabetes\n' +
            '3,list0,Micronase,glyburide,glyburide,5 mg,PO,daily,antidiabetic,diabetes\n' +
            '4,list0,Toprol XL,metoprolol,Toprol XL,25 mg,PO,daily,antihypertensive,hypertension\n' +
            '5,list0,acetaminophen,acetaminophen,Tylenol,1 g,PO,q6h prn pain,"analgesic,antipyretic",pain\n' +
            '6,list0,tramadol,tramadol,Ultram,50 mg,PO,q6h prn pain,analgesic,pain\n' +
            '7,list0,Plavix,clopidogrel,Plavix,75 mg,PO,daily,antiplatelet,atherosclerotic vascular disease\n' +
            '8,list0,Aricept,donepezil,Aricept,10 mg,PO,daily,acetylcholinesterase inhibitor,dementia\n' +
            '9,list0,Prozac,fluoxetine,Prozac,20 mg,PO,daily,antidepressant,depression\n' +
            '10,list0,vitamin B12,vitamin B12,vitamin B12,1000 mcg,SC,qMonth,dietary supplement,vitamin deficiency\n' +
            '11,list0,Calciferol,vitamin D,Calciferol,600 IU,PO,daily,dietary supplement,osteoporosis\n' +
            '12,list0,calcium carbonate,calcium carbonate,Tums,500 mg,PO,QID,dietary supplement,osteoporosis\n' +
            '13,list0,lorazepam,lorazepam,Ativan,1 mg,PO,q8h prn anxiety,"sedative,antianxiety",anxiety\n' +
            '14,list0,Lipitor,rosuvastatin,Lipitor,40 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '15,list0,Tirosint,levothyroxine,Tirosint,100 mcg,PO,daily,thyroid,hypothyroidism\n' +
            '16,list1,enoxaparin,enoxaparin,Lovenox,40 mg,SC,daily,anticoagulant,atrial fibrillation\n' +
            '17,list1,lisinopril,lisinopril,Zestril,20 mg,PO,daily,antihypertensive,hypertension\n' +
            '18,list1,hydrochlorothiazide,hydrochlorothiazide,Hydrodiuril,12.5 mg,PO,daily,"diuretic,antihypertensive",hypertension\n' +
            '19,list1,insulin sliding scale,insulin sliding scale,Humulin,,SC,q4h prn,antidiabetic,diabetes\n' +
            '20,list1,Lantus,insulin glargine,Lantus,20 mg,SC,qHS,antidiabetic,diabetes\n' +
            '21,list1,metoprolol,metoprolol,Toprol XL,50 mg,PO,BID,antihypertensive,hypertension\n' +
            '22,list1,acetaminophen,acetaminophen,Tylenol,1 g,PO,q6h prn pain,"analgesic,antipyretic",pain\n' +
            '23,list1,tramadol,tramadol,Ultram,50 mg,PO,q6h prn pain,analgesic,pain\n' +
            '24,list1,clopidogrel,clopidogrel,Plavix,75 mg,PO,daily,antiplatelet,atherosclerotic vascular disease\n' +
            '25,list1,donepezil,donepezil,Aricept,10 mg,PO,qHS,acetylcholinesterase inhibitor,dementia\n' +
            '26,list1,fluoxetine,fluoxetine,Prozac,20 mg,PO,daily,antidepressant,depression\n' +
            '27,list1,lorazepam,lorazepam,Ativan,1 mg,PO,q8h prn anxiety,"sedative,antianxiety",anxiety\n' +
            '28,list1,rosuvastatin,rosuvastatin,Lipitor,40 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '29,list1,cephalexin,cephalexin,Biocef,500 mg,PO,q6h,antibiotic,cellulitis',

        other_data: {
            1: {
                "__ATTR_SUBITEM__": [
                    { name: "hydrochlorothiazide", attributes: { "__ATTR_DOSE__": "20 mg" } },
                    { name: "lisinopril", attributes: { "__ATTR_DOSE__": "12.5 mg" } }]
            },
            29: {
                "__ATTR_DATE_STARTED__": ["Started " +
                new Date(Date.now() - 86400000).toDateString().split(" ")[1] + ". " +
                new Date(Date.now() - 86400000).toDateString().split(" ")[2] + ", " +
                new Date(Date.now() - 86400000).toDateString().split(" ")[3] + " (1 day ago)"]
            },
        }
    }, // end of PD2_C

    "__DATASET_CONGESTIVE_HEART_FAILURE_1_MODIFIED__": {
        // patient data
        patientFirstName: "Jim",
        patientLastName: "Jones",
        patientAge: 74,
        patientGender: "M",

        // item relationships
        unique1: [3, 8],
        unique2: [16, 18, 20],
        identical: [[5, 12], [7, 13]],
        similar: [
            { items: [0, 11], differences: [ATTR_FREQUENCY] },
            { items: [1, 22], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [2, 17], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [4, 15], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [6, 14], differences: [ATTR_FREQUENCY] },
            { items: [9, 21], differences: [ATTR_NAME, ATTR_FREQUENCY] },
            { items: [10, 19], differences: [ATTR_NAME, ATTR_DOSE, ATTR_FREQUENCY] }],

        // item data
        csv:
            'id,origin,recorded name,generic name,brand name,dose,route,frequency,drug classes,diagnoses\n' +
            '0,list0,acetaminophen,acetaminophen,Tylenol,650 mg,PO,q4h prn,"analgesic,antipyretic",pain\n' +
            '1,list0,Aldactone,spironolactone,Aldactone,100 mg,PO,daily,antihypertensive,hypertension\n' +
            '2,list0,Amaryl,glimepiride,Amaryl,4 mg,PO,daily,antidiabetic,diabetes\n' +
            '3,list0,Ambien,zolpidem,Ambien,10 mg,PO,qHS prn,sedative,insomnia\n' +
            '4,list0,Aricept,donepezil,Aricept,10 mg,PO,daily,acetylcholinesterase inhibitor,dementia\n' +
            '5,list0,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic","atherosclerotic vascular disease"\n' +
            '6,list0,cimetidine,cimetidine,Tagamet,800 mg,PO,BID,antacid,GERD\n' +
            '7,list0,Coreg,carvedilol,Coreg,6.25 mg,PO,BID,antihypertensive,hypertension\n' +
            '8,list0,Colace,ducosate,Colace,100 mg,PO,BID,stool softener,constipation\n' +
            '9,list0,Crestor,rosuvastatin,Crestor,20 mg,PO,daily,anticholesterol,hypercholesterolemia\n' +
            '10,list0,Cozaar,losartan,Cozaar,25 mg,PO,daily,"antihypertensive","hypertension,congestive heart failure"\n' +
            '11,list1,acetaminophen,acetaminophen,Tylenol,650 mg,PO,q4h prn headache or pain,"analgesic,antipyretic",pain\n' +
            '12,list1,aspirin,aspirin,Bayer,81 mg,PO,daily,"non-steroidal anti-inflammatory drug,analgesic,antiplatelet,antipyretic",atherosclerotic vascular disease\n' +
            '13,list1,Coreg,carvedilol,Coreg,6.25 mg,PO,BID,antihypertensive,hypertension\n' +
            '14,list1,cimetidine,cimetidine,Tagamet,800 mg,PO,q12h,antacid,GERD\n' +
            '15,list1,donepezil,donepezil,Aricept,10 mg,PO,qAM,acetylcholinesterase inhibitor,dementia\n' +
            '16,list1,furosemide,furosemide,Lasix,40 mg,PO,BID,"diuretic,antihypertensive",congestive heart failure\n' +
            '17,list1,glimepiride,glimepiride,Amaryl,4 mg,PO,qAM,antidiabetic,diabetes\n' +
            '18,list1,lorazepam,lorazepam,Ativan,1 mg,PO,qHS prn insomnia,"sedative,antianxiety",insomnia\n' +
            '19,list1,losartan,losartan,Cozaar,50 mg,PO,qAM,antihypertensive,"hypertension,congestive heart failure"\n' +
            '20,list1,magnesium hydroxide,magnesium hydroxide,Milk of magnesia,30 ml,PO,daily prn constipation,"laxative,antacid",constipation\n' +
            '21,list1,rosuvastatin,rosuvastatin,Crestor,20 mg,PO,qAM,anticholesterol,hypercholesterolemia\n' +
            '22,list1,spironolactone,spironolactone,Aldactone,100 mg,PO,qAM,antihypertensive,hypertension',
    }, // end of CHF1_M
};

export function init(dataset) {
    resetState();
    loadData(dataset);
}

/*
 * Create and return viewData object (contains information on what to display)
 *
 * Arguments:
 *     boolean sort - whether to sort data
 *     boolean filter - whether to filter data
 *
 * Preconditions:
 *     visible.multigroup - indicates whether to include shadows
 *     visible.groupBy - indicates what (if any) grouping to use
 *     visible.shadows - shadows populated (e.g. during loadData)
 *
 *     visible.unique1 - contains ids that will end up in unique1
 *     visible.unique2 - contains ids that will end up in unique2
 *     visible.identical - contains ids that will end up in identical
 *
 * Returns:
 *     viewData object (see viewData in controller for object description)
 *
 * Algorithm summary:
 *     build a list of relevantIds (includes shadows if multigroup on)
 *     filter and sort the list
 *     bucket into groups and compute metadata in viewData (e.g. lengths)
 */
export function viewDataModel(sort, filter) {

    let viewData = {};

    // get every id we need to care about (e.g. list1 + list2 + shadows (if any))
    let relevantIds = list1.source.concat(list2.source);

    // get or hide shadows
    if (multigroup && groupBy) {
        for (let shadowID in shadows) {
            let shadow = shadows[shadowID];
            if (groupBy in shadow.attributes && shadow.attributes[groupBy].length > 1 && shadow.attributes[groupBy][shadow.groupByOffset]) {
                // if shadow should be shown, update accordingly:
                relevantIds.push(shadowID);

                // update information about what is hidden
                if (shadowID in hidden) {
                    toggleItem(("#" + shadowID), toggleOnDelay, true);
                    if (hidden[shadowID])
                        delete hidden[shadowID];
                }
            } else {
                // otherwise, hide the shadow
                toggleItem(("#" + shadowID), toggleOffDelay, false);
                hidden[shadowID] = true;
            }
        }
    } else {
        // no multigroup + groupBy = no shadows
        for (let shadowID in shadows) {
            toggleItem(("#" + shadowID), toggleOffDelay, false);
            hidden[shadowID] = true;
        }
    }

    // filter based on unified filter
    if (filter) {
        relevantIds = relevantIds.filter(unifiedFilter);
    }

    // sort data
    if (sort || filter) {
        relevantIds = relevantIds.sort(groupThenSort);
    }

    // initialize default group
    let groups = {};
    viewData.groups = groups;

    groups[DEFAULT_GROUP] = [];

    let groupNames = [];
    // names of groups, used for ranking

    // for calculating lengths of groups
    let groupLengths = {};
    viewData.groupLengths = groupLengths;

    // Note: identicalMarker is a hash to keep track of distinct groups of
    //  identical objects
    groupLengths[""] = {
        "unique1": [],
        "identicalMarker": {},
        "unique2": []
    };

    for (let i in relevantIds) {
        let id = relevantIds[i];
        let item = items[id];

        let trueId = item.isShadow ? parseInt(shadowsToItems[id]) : id;

        // populate "groups"

        let itemGroup = DEFAULT_GROUP;
        if (item.attributes.hasOwnProperty(groupBy)) {
            // put id into its group if it has the grouped attribute
            // groupByOffset = offset into attribute list to get the primary group
            itemGroup = item.attributes[groupBy][item.groupByOffset];

            // initialize array for group if needed
            if (!groups.hasOwnProperty(itemGroup)) {
                groups[itemGroup] = [];
                groupNames.push(itemGroup);
                groupLengths[itemGroup] = {
                    "unique1": [],
                    "identicalMarker": {},
                    "unique2": []
                };
            }
        }

        // put into retrieved (possibly just created) (or default) group
        groups[itemGroup].push(id);

        // update groupLengths depending on where if will end up

        if (unique1.indexOf(trueId) >= 0) {
            groupLengths[itemGroup].unique1.push(id);
        } else if (unique2.indexOf(trueId) >= 0) {
            groupLengths[itemGroup].unique2.push(id);
        } else if (trueId in identical) {
            // get identical set, see if group marker already there, if not, add this
            let idenList = identical[trueId];
            let j = 0;
            for (; j < idenList.length; j++) {
                if (idenList[j] in groupLengths[itemGroup].identicalMarker)
                    break;
            }

            if (j === idenList.length) {
                // if didn't find group marker, add this to identicalMarker
                groupLengths[itemGroup].identicalMarker[trueId] = idenList;
            }
        } // else in similar

    }// end of grouping ids

    // delete default group if unused (all other groups only exist if created)
    if (groups[DEFAULT_GROUP].length === 0) {
        delete groups[DEFAULT_GROUP];
    } else {
        groupNames.push(DEFAULT_GROUP);
    }

    // specify group ranking // assumed item traversal order is equivalent, so is just groupNames
    viewData['groupRank'] = groupNames;

    // add method to get everything in rank order (for convenience)
    viewData.getAll = function () {
        let ret = [];
        for (let i in viewData['groupRank']) {
            let groupName = viewData['groupRank'][i];
            if (viewData['groups'].hasOwnProperty(groupName))
                ret = ret.concat(viewData['groups'][groupName]);
        }
        return ret;
    };

    return viewData;
}

export function setGroupBy(newValue) {
    groupBy = newValue
}

export function getGroupBy() {
    return groupBy;
}

export function setFilterOn(newValue) {
    filterOn = newValue;
}

export function getIdentical(id, includeShadows, applyFilter) {
    let tempIdentical = [];
    let checkID = items[id].isShadow ? getShadowed(id) : id;

    if (checkID in identical) {
        tempIdentical = identical[checkID].slice();
    }
    tempIdentical.splice(tempIdentical.indexOf(parseFloat(checkID)), 1);

    if (includeShadows) {
        let shadows = [];

        for (let i = 0; i < tempIdentical.length; i++) {
            shadows = shadows.concat(getShadows(tempIdentical[i]));
        }
        tempIdentical = tempIdentical.concat(shadows);
    }
    return applyFilter ? tempIdentical.filter(unifiedFilter) : tempIdentical;
}

export function getSimilar(id, includeShadows, applyFilter) {
    let tempSimilar = [];
    let checkID = items[id].isShadow ? getShadowed(id) : id;

    if (checkID in similar) {
        tempSimilar = similar[checkID].items.slice();
    }
    tempSimilar.splice(tempSimilar.indexOf(parseFloat(checkID)), 1);

    if (includeShadows) {
        let shadows = [];

        for (let i = 0; i < tempSimilar.length; i++) {
            shadows = shadows.concat(getShadows(tempSimilar[i]));
        }
        tempSimilar = tempSimilar.concat(shadows);
    }
    return applyFilter ? tempSimilar.filter(unifiedFilter) : tempSimilar;
}

// given an id, return item ids that are related
export function getRelated(id, includeShadows) {
    if (("" + id)[0] === 'd') {
        // this is for 3 column view for a drug class or diagnosis "group item"
        if (("" + id)[1] === 'c')
            return drugClassSet[id];
        // drug class
        else
            return diagnosisSet[id];
        // diagnosis
    } else {
        let identical = getIdentical(id, includeShadows, true);
        let similar = getSimilar(id, includeShadows, true);
        let hash = {};
        let length = Math.min(identical.length, similar.length);

        console.log('identical', identical)
        console.log('similar', similar)

        // remove duplicates
        for (let i = 0; i < length; i++) {
            hash[identical[i]] = true;
            hash[similar[i]] = true;
        }

        if (length < identical.length) {
            for (let i = 0; i < identical.length; i++) {
                hash[identical[i]] = true;
            }
        } else if (length < similar.length) {
            for (let i = 0; i < similar.length; i++) {
                hash[similar[i]] = true;
            }
        }

        // convert results into array format
        let related = [];

        for (let hashedID in hash) {
            related.push(hashedID);
        }
        return related;
    }
}

export function getRelatedSet(id, includeShadows) {
    return getShadowSet(id).concat(getRelated(id, includeShadows));
}

export function getShadows(id) {
    if (id in itemsToShadows) {
        return itemsToShadows[id];
    }
    return [];
}

export function getShadowed(id) {
    return shadowsToItems[id];
}

export function getShadowSet(id) {
    if (("" + id)[0] === 'd')// TODO diagnosis version doesn't support multigroup right now
        return [];

    let checkID = items[id].isShadow ? getShadowed(id) : id;

    return [checkID].concat(getShadows(checkID));
}

function loadData(newDataset) {
    dataset = newDataset;

    // populatePatientInformation(dataset);
    populateLists(dataset);
    detectAttributes();
    detectRelationships(dataset);
    detectDiagnoses();
    detectDrugClasses();

    // create "shadows", copies, to show n-group affiliation
    populateShadows();

}

function getFilterOn() {
    return filterOn;
}

// initialization
function resetState() {
    items = {};
    list1.source = [];
    list2.source = [];
    diagnosisSet = {};

    shadows = {};
    itemsToShadows = {};
    shadowsToItems = {};
    hidden = {};

    attributes = {};

    unique1 = [];
    unique2 = [];
    identical = {};
    similar = {};

}

/*
 * Given a dataset, populate the list1, list2, and undecided lists
 */
function populateLists(dataset) {
    let objId = 0, name = {}, attributes = {}, item = {};

    let data = DATASETS[dataset];

    // read csv data into array of arrays
    let csv_data = CSVToArray(data['csv']);

    // convert from array of arrays into array of objects
    let extractedItems = arrOfArrsToArrOfObjects(csv_data);

    // for each item, save the attributes into a ListItem object
    for (let csvi = 0; csvi < extractedItems.length; csvi++) {
        let obj = extractedItems[csvi];
        objId = parseInt(obj[CSVC.ID][0]);

        name = {
            recorded: obj[CSVC.R_NAME][0],
            generic: obj[CSVC.G_NAME][0],
            brand: obj[CSVC.B_NAME][0]
        };

        attributes = {};
        attributes[ATTR_DOSE] = obj[CSVC.DOSE];
        attributes[ATTR_ROUTE] = obj[CSVC.ROUTE];
        attributes[ATTR_FREQUENCY] = obj[CSVC.FREQUENCY];
        attributes[ATTR_DRUG_CLASS] = obj[CSVC.DRUG_CLASSES];
        attributes[ATTR_DIAGNOSES] = obj[CSVC.DIAGNOSES];

        // grab other data if present
        if (data.other_data && data.other_data.hasOwnProperty(objId)) {
            // add information for each optional attribute
            for (let key in data.other_data[objId]) {
                attributes[key] = data.other_data[objId][key];
            }
        }

        item = ListItem(objId, obj[CSVC.ORIGIN][0], name, attributes);

        if (item.listID === list1.id) {
            list1.source.push(item.id);
        } else {
            list2.source.push(item.id);
        }
        items[item.id] = item;
    }

}

/*
 * Postconditions:
 *      populate shadows based on groupby - or retrieve if cached
 *      all possible shadows populated since shadows can be reused
 *
 * Also, continue intializing some item attributes
 *  (e.g. isShadow, isShadowed, groupByOffset)
 */
function populateShadows() {
    // detect all possible groups
    let potentialGroups = {};
    let potentialGroupByAttributes = [];

    for (let attribute in attributes) {
        if (attributes[attribute].type === ATTR_TYPE_CATEGORICAL) {
            potentialGroupByAttributes.push(attribute);
        }
    }

    for (let id in items) {
        for (let i = 0; i < potentialGroupByAttributes.length; i++) {
            let attributes = items[id].attributes;
            let attribute = potentialGroupByAttributes[i];

            if (attribute in attributes) {
                let values = attributes[attribute];

                for (let j = 0; j < values.length; j++) {
                    let value = values[j];

                    if (potentialGroups[value] === undefined) {
                        potentialGroups[value] = [];
                    }
                    potentialGroups[value].push(id);
                }
            }
        }
    }

    // slight optimization: remove 1-item groups when multigrouping
    for (let groupByAttribute in potentialGroups) {
        if (potentialGroups[groupByAttribute].length < 2) {
            delete potentialGroups[groupByAttribute];
        }
    }

    // create shadows
    for (let id in items) {
        let item = items[id];

        // originals will always be associated with the primary group
        item.groupByOffset = 0;

        // originals are not shadows, and currently have no shadows
        item.isShadow = false;
        item.isShadowed = false;

        // search for potential shadows
        for (let attributeName in attributes) {
            let attribute = attributes[attributeName];

            if (attribute.type === ATTR_TYPE_CATEGORICAL) {
                if (attributeName in item.attributes) {
                    let values = item.attributes[attributeName];

                    if (values.length > 1) {
                        /*
                         * Prepare shadows; these "shadows" will only appear
                         * when the user groups by this particular
                         * attribute.
                         *
                         * For group affiliation [ A, B, C ]:
                         *   - the original will be grouped with A,
                         *   - shadow 0 will be grouped with B, and
                         *   - shadow 1 will be grouped with C.
                         *
                         * Acting on the original will act on all shadows;
                         * acting on a shadow will similarly act on the
                         * original (and all other shadows).
                         */
                        for (let i = 1; i < values.length; i++) {
                            let value = values[i];

                            // don't create unnecessary shadows
                            if (potentialGroups[value] === undefined) {
                                continue;
                            }

                            // convention: originalID_shadowID
                            let shadowID = id + "_" + (i - 1);

                            // create the shadow from the original
                            let shadow = ListItem(shadowID, item.listID, item.getNames(), item.attributes);
                            shadow.isShadow = true;
                            shadow.isShadowed = false;
                            shadow.groupByOffset = i;

                            shadows[shadowID] = shadow;

                            // original now has a shadow
                            item.isShadowed = true;

                            // for convenience, hash in items as well
                            items[shadowID] = shadow;

                            // hash from original to shadow
                            if (id in itemsToShadows) {
                                itemsToShadows[id].push(shadowID);
                            } else {
                                itemsToShadows[id] = [shadowID];
                            }

                            // hash from shadow to original
                            shadowsToItems[shadowID] = id;

                        }
                    }
                }
            }
        }
    }
}

function detectAttributes() {
    attributes[ATTR_NAME] = {
        type: ATTR_TYPE_GENERAL,
        display: true
    };
    attributes[ATTR_DOSE] = {
        type: ATTR_TYPE_NUMERIC,
        display: true
    };
    attributes[ATTR_ROUTE] = {
        type: ATTR_TYPE_CATEGORICAL,
        display: true,
        rank: []
    };
    attributes[ATTR_FREQUENCY] = {
        type: ATTR_TYPE_GENERAL,
        display: true
    };
    attributes[ATTR_DRUG_CLASS] = {
        type: ATTR_TYPE_CATEGORICAL,
        display: false,
        rank: ["antipyretic", "antibiotic", "analgesic", "antidiabetic", "sedative", "antianxiety", "diuretic", "bronchodilator", "corticosteroid", "antipsychotic", "antihypertensive", "anticoagulant", "antihistamine", "thyroid", "antiplatelet", "non-steroidal anti-inflammatory drug", "antacid", "antidepressant", "acetylcholinesterase inhibitor", "antismoking", "sex hormone", "anticholesterol", "bone resorption inhibitor", "dietary supplement", "laxative", "stool softener", "unknown"]
    };
    attributes[ATTR_DIAGNOSES] = {
        type: ATTR_TYPE_CATEGORICAL,
        display: false
    };
    attributes[ATTR_DATE_STARTED] = {
        type: ATTR_TYPE_GENERAL,
        display: false
    };
    attributes[ATTR_SUBITEM] = {
        type: ATTR_TYPE_GENERAL,
        display: false
    };
    attributes[ATTR_INSTRUCTIONS] = {
        type: ATTR_TYPE_GENERAL,
        display: false
    };
}

/*
 * Given a dataset, extract relationship information between items and
 * populate relationship data structures
 */
function detectRelationships(dataset) {

    unique1 = DATASETS[dataset].unique1;
    unique2 = DATASETS[dataset].unique2;
    let tempIdentical = DATASETS[dataset].identical;
    let tempSimilar = DATASETS[dataset].similar;

    if (tempIdentical || tempSimilar) {

        for (let i = 0; i < tempIdentical.length; i++) {
            let set = tempIdentical[i];

            if (set)
                for (let j = 0; j < set.length; j++) {
                    identical[set[j]] = set;
                }
        }

        for (let i = 0; i < tempSimilar.length; i++) {
            let set = tempSimilar[i];

            if (set)
                for (let j = 0; j < set.items.length; j++) {
                    similar[set.items[j]] = set;
                }
        }
    }
}

function detectDrugClasses() {
    // hash to remove duplicates
    let tempDrugClasses = {};

    let finalDrugClasses = {};

    // drug classes have ids like: "dc0"
    let i = 0;

    drugClassSet = {};

    for (let id in items) {
        let item = items[id];

        let drugClasses = item["attributes"][ATTR_DRUG_CLASS];

        for (let drugClassIndex in drugClasses) {
            let drugClass = drugClasses[drugClassIndex];

            // look up drug class id if there (to add this item to the set)

            // drug class id
            let dcid;

            if (!tempDrugClasses[drugClass]) {
                dcid = "dc" + i;
                i++;
                drugClasses[dcid] = drugClass;
                finalDrugClasses[dcid] = drugClass;
                drugClassSet[dcid] = [];
                tempDrugClasses[drugClass] = dcid;
            } else {
                dcid = tempDrugClasses[drugClass];
            }

            drugClassSet[dcid].push(id);
        }

    }
}

function detectDiagnoses() {
    let tempDrugClasses = {};
    let tempDiagnoses = {};
    // hash to remove duplicates
    let i = 0;
    // drug classes have ids like: "dc0"

    diagnosisSet = {};

    for (let id in items) {
        let item = items[id];

        let diagnoses = item["attributes"][ATTR_DIAGNOSES];

        // TODO cleaning - rename
        for (let drugClassIndex in diagnoses) {
            let drugClass = diagnoses[drugClassIndex];

            // look up drug class id if there (to add this item to the set)
            let dcid;
            // drug class id
            if (!tempDrugClasses[drugClass]) {
                dcid = "d" + i;
                i++;
                // diagnoses[dcid] = drugClass;
                tempDiagnoses[dcid] = drugClass;
                diagnosisSet[dcid] = [];
                tempDrugClasses[drugClass] = dcid;
            } else {
                dcid = tempDrugClasses[drugClass];
            }

            diagnosisSet[dcid].push(id);
        }

    }

}

// sort
function groupThenSort(a, b) {
    // if a groupBy is set (e.g. from controller) sort by the grouped by attribute
    let groupOrder = groupBy ? attributeSort(a, b, groupBy, attributes[groupBy].rank) : 0;

    // if no groupOrder, try sortOrder
    //  if no sortOrder, just sort by ids
    if (groupOrder === 0) {
        let sortOrder = sortBy ? attributeSort(a, b, sortBy) : items[a].id - items[b].id;

        // if equal based on sort order, tiebreak with ids
        if (sortBy && sortOrder === 0) {
            return items[a].id - items[b].id;
        }
        return sortOrder;
    }
    return groupOrder;
}

// sort id a and id b by a given attribute with (if given) ranking for that attribute
function attributeSort(a, b, attribute, rank) {
    let itemA = items[a];
    let itemB = items[b];
    let attributeA, attributeB;

    if (attribute === ATTR_NAME) {// case-insensitive
        attributeA = itemA.name.toLowerCase();
        attributeB = itemB.name.toLowerCase();
    } else {
        if (itemA.attributes[attribute]) {
            attributeA = itemA.attributes[attribute][(multigroup ? itemA.groupByOffset : 0)];
        } else {
            attributeA = undefined;
        }

        if (itemB.attributes[attribute]) {
            attributeB = itemB.attributes[attribute][(multigroup ? itemB.groupByOffset : 0)];
        } else {
            attributeB = undefined;
        }
    }

    // check undefined, i.e. missing attributes
    if (attributeA === undefined || attributeB === undefined) {

        if (attributeA === undefined)
            console.log("WARNING: undefined attr: item[" + a + "]['attributes'][" + attribute + "] = undefined");
        if (attributeB === undefined)
            console.log("WARNING: undefined attr: item[" + b + "]['attributes'][" + attribute + "] = undefined");

        if (attributeA === undefined && attributeB === undefined)
            return 0;
        return attributeB === undefined ? -1 : 1;
    }

    if (attributes[attribute].type === ATTR_TYPE_NUMERIC) {
        attributeA = parseFloat(attributeA);
        attributeB = parseFloat(attributeB);
    }

    if (rank) {
        let rankA = rank.indexOf(attributeA);
        let rankB = rank.indexOf(attributeB);

        if (rankA < rankB) {
            return -1;
        } else if (rankA > rankB) {
            return 1;
        }
        // if ranks equal, default to alphanumeric order (below)
    }

    if (attributeA < attributeB) {
        return -1;
    } else if (attributeA > attributeB) {
        return 1;
    } else {
        return 0;
    }
}

// filter - remove decided items if option to remove after decisions is set
function actionFilter(element) {
    let $item = ("#" + element);

    return !(afterAction === AFTER_ACTION_REMOVE && !$item.hasClass("undecided"));

}

// filter - remove items based on a name filter
function nameFilter(element) {

    return !(getFilterOn().length > 0 && items[element].name.toLowerCase().indexOf(getFilterOn().toLowerCase()) === -1);

}

// unified filted - apply action filter and name filter
function unifiedFilter(element, index, array) {
    let keep = actionFilter(element, index, array);

    if (keep) {
        keep = nameFilter(element, index, array);
    }
    toggleItem(("#" + element), keep ? toggleOnDelay * FILTER_DELAY_SCALE : toggleOffDelay / FILTER_DELAY_SCALE, keep);
    return keep;
}

// helper object /////////////////////////////////////////////////////////
function ListItem(id, listID, name, attributes) {
    let visible = {};

    visible.id = id;
    visible.listID = listID;
    visible.__defineGetter__("name", function () {// TODO: note: defineGetter deprecated
        return name[displayName ? displayName : "recorded"];
    });
    visible.attributes = attributes;

    visible.getNames = function () {
        return name;
    };
    visible.setName = function (value) {
        name = value;
    };

    visible.isModified = false;

    return visible;
}

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
// from http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    let objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    let arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        let strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter !== strDelimiter)
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        let strMatchedValue;
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];

        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}

/*
 * convert array of arrays to array of objects (with keys = column names)
 * assumes 0th entry of array is an array of column names
 *
 * e.g.
 *  [
 *      ['id', 'origin'],
 *      ['0', 'list0'],
 *      ['1', 'list0']
 *  ]
 *
 *  ->
 *
 *  [
 *      {
 *          id: 0,
 *          origin: 'list0'
 *      },
 *      {
 *          id: 1,
 *          origin: 'list0'
 *      }
 *  ]
 */
function arrOfArrsToArrOfObjects(arrOfArrs) {
    // 0th row is attribute names in the object
    let ret = [];

    let attributeArr = arrOfArrs[0];

    for (let i = 1; i < arrOfArrs.length; i++) {
        let currentArr = arrOfArrs[i];
        let obj = {};
        for (let j = 0; j < currentArr.length; j++) {

            obj[attributeArr[j]] = currentArr[j].split(",");
        }
        ret.push(obj);
    }

    return ret;
}
