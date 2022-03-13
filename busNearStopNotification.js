import axios from "axios";
import jsSHA from "jssha";

async function checkBusNearStopState(city, routeName, targetStopName, direction, taskInterval, taskTotalRunTime) {

    console.log(`Checking the bus ${routeName} state in ${city} City ...`)

    // get the target stop's stop sequence
    let targetStopSequence = undefined;
    targetStopSequence = await getTargetStopSequence(city, routeName, targetStopName, direction)

    // run the task lasting for taskTotalRunTime
    let startTime = new Date().getTime();
    if (targetStopSequence != undefined) {

        let task = setInterval(() => {
            if (new Date().getTime() - startTime > taskTotalRunTime) {
                clearInterval(task);
                console.log(`Checking Task Completed !`)
                return;
            }

            // check the bus state
            checkIfBusComingSoon(targetStopSequence, city, routeName, direction)

        }, taskInterval)
    }
}

async function getTargetStopSequence(city, routeName, targetStopName, direction) {

    const getBusStopSequenceListOfBusApiUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/${city}/${routeName}?$filter=Direction eq ${direction} \
    and RouteName/Zh_tw eq '${routeName}'`;

    // find the stop sequence of target stop
    const response = await axios.get(getBusStopSequenceListOfBusApiUrl, {
        headers: getAuthorizationHeader(),
    })
    let stopListOf672 = response.data[0].Stops;
    let StopSequence = stopListOf672.find((stopInfo) => stopInfo.StopName.Zh_tw == targetStopName).StopSequence
    return StopSequence
}

async function checkIfBusComingSoon(targetStopSequence, city, routeName, direction) {
    if (targetStopSequence == undefined)
        return;

    const getBusRealTimeNearStopApiUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/${city}/${routeName}?$filter=Direction eq ${direction}`;

    const response = await axios.get(getBusRealTimeNearStopApiUrl, {
        headers: getAuthorizationHeader(),
    })

    // console.log(response.data)

    // check the bus is stop at previos 3 to 5 stops
    let busIsComing = false
    response.data.forEach((bus) => {
        if (bus.StopSequence >= targetStopSequence - 5 && bus.StopSequence <= targetStopSequence - 3) {
            busIsComing = true;
        }
    })

    // notification
    if (busIsComing) {
        console.log("The bus is coming soon !!")
    } else {
        console.log("The bus is far away !!")
    }
}

//Example code from ptxmotc
const getAuthorizationHeader = function () {
    let AppID = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
    let AppKey = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';

    let GMTString = new Date().toGMTString();
    let ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    let HMAC = ShaObj.getHMAC('B64');
    let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

    return { 'Authorization': Authorization, 'X-Date': GMTString };
}

// user config
const city = 'Taipei';
const routeName = 672;
const targetStopName = '博仁醫院';
const direction = 1;
const taskInterval = 5000; //minsec
const taskTotalRunTime = 50000 //minsec

checkBusNearStopState(city, routeName, targetStopName, direction, taskInterval, taskTotalRunTime)




