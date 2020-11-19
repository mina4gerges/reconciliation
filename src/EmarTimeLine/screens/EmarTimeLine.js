import React, { useEffect, useState } from 'react';
import Timeline, { CursorMarker, TimelineMarkers, TodayMarker } from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import axios from 'axios';
import { cloneDeep, concat, find, groupBy, isEmpty, map, mapKeys, orderBy } from 'lodash';
import '../emarTimeLine.css';

const getGroups = data => {

    return map(data, val => {
        const { patId, groupedOrders: medications, fname } = val;

        const firstMedication = medications[0];

        const { Meds_Medication, id } = firstMedication;

        return {
            id,
            patId,
            // title: ``,
            title: <div><span>{Meds_Medication.label}</span><b>{`(${fname})`}</b> </div>,
            height: 40,
        }
    })
}

const getItems = (data, patId) => {
    const foundPatient = find(data, { patId });

    const { groupedOrders: medications } = foundPatient;

    //test for now on the first meds
    const firstMedication = medications[0];

    const { OrderId, id } = firstMedication;

    const medicationDetails = firstMedication.Examd_ExamDetails;

    return map(medicationDetails, (medicationDetail, key) => {

        const { Examd_StartTime, Examd_EndTime } = medicationDetail;

        return {
            id: patId + id + OrderId + key,
            group: id,
            title: '',
            start_time: moment(Examd_StartTime),
            end_time: moment(Examd_EndTime),
            borderColor: '#22A7F0',
            selectedBgColor: 'red',
            bgColor: '#19B5FE',
            itemProps: {
                "data-tip": 'hi'
            }
        }
    })
}

const getAllPatientOrder = allPatients => { //this function groups all orders ( from data[0].MedOrderArray )for each patient
    let allPatientsOrder = [];

    map(cloneDeep(allPatients), eachPatient => {
        map(eachPatient.Orders, val => {//get value of each order data of 0 and 1
            map(val[0].MedOrderArray, val => {
                //  standingOrder flag added to be used in filtartion
                val.standingOrder = isStandingOrder(val);
                // orderPriority to sort order (STAT on the top, Standing, PRN)
                val.orderPriority = addOrderPriority(val);

                val.patId = eachPatient.patId;//add to each order, patId
                val.triage = eachPatient.triage;//add to each order, triage (for ordering)
                allPatientsOrder.push(val);//only push orders
            })
        })
    })

    //order by order priotity (STAT, STANDING,PRN)
    allPatientsOrder = groupBy(orderBy(allPatientsOrder, ["orderPriority"]), 'patId');
    return allPatientsOrder;
}

const isStandingOrder = order => {
    let standingOrder = true;

    const { Meds_Frequency: { value }, Meds_PRN } = order
    if (value === "STAT" || value === "Now" || value === "Once" || !isEmpty(Meds_PRN)) {
        standingOrder = false
    }

    return standingOrder;
}

const addOrderPriority = order => {
    const { Meds_Frequency: { value }, Meds_PRN } = order
    //2 for standing (default)
    let priority = '2';

    if (value === "STAT")
        priority = '1'
    else if (!isEmpty(Meds_PRN))
        priority = '3'

    return priority;
}

const itemRenderer = ({ item, itemContext, getItemProps }) => {

    const backgroundColor = itemContext.selected ? item.selectedBgColor : item.bgColor;

    return (
        <div
            {...getItemProps({
                style: {
                    backgroundColor,
                    color: item.color,
                    borderRadius: 8,
                },
                onMouseDown: () => {
                    console.log("on item click", item);
                }
            })}
        >
            <div>
                {itemContext.title}
            </div>
        </div>
    );
};

export const EmarTimeLine = () => {

    const [originalEmarData, setOriginalEmarData] = useState(null);
    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);

    //set setAlertTypeTitles
    useEffect(() => {

        //get drop down options
        const fetchData = async () => {

            let tempCancelToken = axios.CancelToken.source();

            const axiosParams = {
                FormCode: 'orders',
                UserCode: 'MG',
                DepCode: 'Orders',
                CompCode: 'MedOrder',
                OrdrWDtls: true,
                Source: 'EMAR',
                CaseNbr: null
            }

            try {
                const result = await axios({
                    method: 'post',
                    url: `http://183.183.183.242/EMREngineTestJA/EMRWS.svc/web/EMR_GetEMARData`,
                    data: JSON.stringify(axiosParams),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        authenticationinfo: '5f89495fee0a2146e8a53176'
                    },
                    cancelToken: tempCancelToken.token,
                })

                const eMARResult = result.data.EMR_GetEMARDataResult

                let allPatients = orderBy(mapKeys(JSON.parse(eMARResult), 'patId'), ["triage", "name"], ["asc", "asc"]);

                let allPatientsOrder = getAllPatientOrder(allPatients);//get all orders for all patient; group by
                // patient id

                map(allPatients, eachOrderPatient => {
                    map(allPatientsOrder, (order, patientId) => {
                        if (eachOrderPatient.patId === parseInt(patientId, 10)) {
                            eachOrderPatient.groupedOrders = order;
                        }
                    })
                })

                return allPatients;

            } catch (e) {
                console.error('useEffect : VidalAlertTableTitle', e)
            } finally {
                if (tempCancelToken)
                    tempCancelToken.cancel('Save canceled by the user.');
            }

        };

        fetchData().then(allPatients => setOriginalEmarData(allPatients));

    }, []);

    //init groups
    useEffect(() => {

        setGroups(getGroups(originalEmarData));

    }, [originalEmarData])

    //init items
    useEffect(() => {

        let items = [];

        map(groups, group => {
            const { patId } = group;

            items = concat(items, getItems(originalEmarData, patId))

        });

        setItems(items);

    }, [groups, originalEmarData])

    console.log('originalEmarData', originalEmarData);
    console.log('groups', groups);
    console.log('items', items);

    return (
        <div>
            <Timeline
                groups={groups}
                items={items}
                canMove={false}
                canResize={false}
                itemHeightRatio={0.75}
                sidebarWidth={200}
                stackItems
                itemRenderer={itemRenderer}
                defaultTimeStart={moment().add(-12, 'hour')}
                defaultTimeEnd={moment().add(12, 'hour')}
            >
                <TimelineMarkers>
                    <TodayMarker />
                    <CursorMarker />
                </TimelineMarkers>
            </Timeline>
        </div>
    )
}