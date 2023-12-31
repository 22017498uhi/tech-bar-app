import React, { useState, useEffect, useContext } from 'react';

import { firestore } from "../services/firebase";

import { collection, onSnapshot, query, doc, where } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import appContext from '../context/context';



ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);


function ReportsUI() {

    const [feedbackData, setFeedbackData] = useState({});

    const [checkInsData, setCheckInsData] = useState({});

    const [stageData, setStageData] = useState({});

    const { selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components


    useEffect(() => {

        const locationRef = doc(firestore, "locations", selectedAppLocation?.id);

        //******Feedback Related Stuff****** */
        let unsubscribefeedback;
        let feedbackQuery = query(collection(firestore, "feedbacks"), where("location", "==", locationRef));
        unsubscribefeedback = onSnapshot(feedbackQuery, (snapshot) => {
            const feedbackCounts = {
                'positive': 0,
                'neutral': 0,
                'negative': 0
            };

            snapshot.docs.forEach((doc) => {
                let feedback = doc.data().value;
                if (feedbackCounts.hasOwnProperty(feedback)) {
                    feedbackCounts[feedback]++;
                }
            })

            setFeedbackData({
                labels: Object.keys(feedbackCounts),
                datasets: [
                    {
                        data: Object.values(feedbackCounts),
                        backgroundColor: ['#90A72B', '#4C86B2', '#BE4633']

                    },
                ],
            });

        })

        /******** Checkins - Per month and Grouped by Stage **********/
        let unsubscribegroupbystate;
        let groupstatequery = query(collection(firestore, "checkIns"), where("location", "==", locationRef));
        unsubscribegroupbystate = onSnapshot(groupstatequery, (snapshot) => {
            let stageCounts = {
                'in_queue': 0,
                'serving': 0,
                'completed': 0,
                'cancelled': 0
            };


            var checkInsData = [];

            snapshot.docs.forEach((doc) => {
                const stage = doc.data().stage;
                if (stageCounts.hasOwnProperty(stage)) {
                    stageCounts[stage]++;
                }

                checkInsData.push({ ...doc.data(), timestampDate: doc.data().timestamp.toDate() })

            })


            //sort from earliest to latest
            //sort the chatrooms newest to oldest. firebase doesnot support sort when query is on differnt field. i.e user
            checkInsData.sort((a, b) => {
                return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
            })

            const checkInsByMonth = {};


            checkInsData.forEach((checkin) => {
                const timestamp = checkin.timestamp.toDate();
                const monthYear = `${timestamp.getMonth() + 1}/${timestamp.getFullYear()}`;

                if (checkInsByMonth.hasOwnProperty(monthYear)) {
                    checkInsByMonth[monthYear]++;
                } else {
                    checkInsByMonth[monthYear] = 1;
                }
            })


            setCheckInsData({
                labels: Object.keys(checkInsByMonth),
                datasets: [
                    {
                        label: 'Check-Ins per Month',
                        data: Object.values(checkInsByMonth),
                        backgroundColor: '#4DA1A9',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            });


            setStageData({
                labels: Object.keys(stageCounts),
                datasets: [
                    {
                        data: Object.values(stageCounts),
                        backgroundColor: ['#D95000', '#0D77BE', '#89A11D', '#485259'],
                    },
                ],
            });

        })

        return () => {
            unsubscribefeedback();
            unsubscribegroupbystate();
        }

        // eslint-disable-next-line
    }, []);

    return (
        <div>
            <div> <h2 className="text-center mt-2 mb-4">Reports Dashboard ({selectedAppLocation.label})</h2></div>

            <div className='d-flex justify-content-around mx-5'>

                <div className='card mx-2' >
                    <div className='card-header text-center'><h4>Check-in by Stage</h4></div>
                    <div className='card-body'>{Object.keys(stageData).length > 0
                        && <Doughnut data={stageData} options={{
                            plugins: {
                                datalabels: {
                                    color: '#fff',
                                    font: {
                                        size: 16
                                    }
                                }
                            }
                        }} />}</div>
                </div>

                <div className='card  mx-2' >
                    <div className='card-header text-center'> <h4>Feedback</h4></div>
                    <div className='card-body'> {Object.keys(feedbackData).length > 0
                        && <Pie data={feedbackData} options={{
                            plugins: {
                                datalabels: {
                                    color: '#fff',
                                    font: {
                                        size: 16
                                    }
                                }
                            }
                        }} />}</div>
                </div>

            </div>

            <div className='card mx-5 mt-5'>
                <div className='card-header text-center'> <h4>Number of Check-Ins per Month</h4> </div>
                <div className='card-body'>  {Object.keys(checkInsData).length > 0
                    && <Bar data={checkInsData} options={{
                        plugins: {
                            datalabels: {
                                color: '#fff',
                                font: {
                                    size: 16
                                }
                            }
                        }
                    }} />} </div>
            </div>

        </div>
    )

}


export default ReportsUI;