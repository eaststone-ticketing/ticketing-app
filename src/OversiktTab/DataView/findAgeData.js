//Takes an array of strings and sees if they can be converted to dates
//If a string can not be converted to a date, return null

const date = new Date();


//Checks if the year is valid for our purposes, there are no, and should never be, tickets dated earlier than 1800.
function isValidYear(year){
    if (year > 1800 && year < date.getFullYear()){
        return true
    } else {
        return false
    }
}

function isValidMonthDay(month, day){

    let maxNumberOfDaysInMonth;

            const monthDays = {31: ["01", "03", "05", "07", "08", "10", "12"], 30: ["04", "06", "09", "11"], 29: ["02"]}

            //This sets our max number and also returns empty if the middle digits are not a valid month
            if (monthDays[31].includes(month)){
                maxNumberOfDaysInMonth = 31
            } else if (monthDays[30].includes(month)){
                maxNumberOfDaysInMonth = 30
            } else if (monthDays[29].includes(month)){
                maxNumberOfDaysInMonth = 29
            } else {
                return false
            }

    if (Number(month) < 12 && Number(month) > 0 && day > 0 && day < maxNumberOfDaysInMonth){
        return true
    } else{
        return false
    }
}

function cleanData(data){

    const numbersOnly = data.map((point) => point.replace(/\D/g,''));
    return numbersOnly
}

function findAgeData(data){
    const cleanedData = cleanData(data);

    return cleanedData.map((datapoint) => {
        if (datapoint.length === 6){
            //The challenge here is that we don't know if the format is DDMMYY or YYMMDD

            //We split the string into three equal parts
            const pair1 = datapoint.slice(0,2)
            const pair2 = datapoint.slice(2,4)
            const pair3 = datapoint.slice(4)

            //Early return if pair2 is not a month as neither format is valid in that case
            //Also if any of the pairs is 00 or somehow negative
            if (Number(pair2) > 12 || Number(pair2) <= 0 || Number(pair1) <= 0 || Number(pair3) <= 0){
                return null
            }

            //Depending on pair2 (should be a month) we will have a different max number of days that could be a month
            //We want this number because if it is exceeded, then we can know it is a year and not a date.
            let maxNumberOfDaysInMonth;

            const monthDays = {31: ["01", "03", "05", "07", "08", "10", "12"], 30: ["04", "06", "09", "11"], 29: ["02"]}

            //This sets our max number and also returns empty if the middle digits are not a valid month
            if (monthDays[31].includes(pair2)){
                maxNumberOfDaysInMonth = 31
            } else if (monthDays[30].includes(pair2)){
                maxNumberOfDaysInMonth = 30
            } else if (monthDays[29].includes(pair2)){
                maxNumberOfDaysInMonth = 29
            } else {
                return null
            }

            //This part checks if one of our number pairs exceed the max number of days in the month and returns dates accordingly
            //We add "19" to the year here as the first two digits because we only have the last two digits of the year.
            //The purpose of the date we are generating is to estimate age, so it is just the difference that matters
            //Thus having the wrong century is fine. (a + x) - (a + y) = x - y
            if (Number(pair1) > maxNumberOfDaysInMonth && Number(pair3) < maxNumberOfDaysInMonth){

                return new Date(`19${pair1}-${pair2}-${pair3}`)
            } else if (Number(pair3) > maxNumberOfDaysInMonth && Number(pair1) < maxNumberOfDaysInMonth) {
                return new Date(`19${pair3}-${pair2}-${pair1}`)
            }
        }

        if (datapoint.length === 8){
            
            const candidate1 = datapoint.slice(0,4)
            const candidate2 = datapoint.slice(4)

            if (isValidYear(candidate1) && isValidYear(candidate2)){
                return null;
                //In this case we can not know YYYYMMDD from DDMMYYYY
            }

            if (isValidYear(candidate1) && !isValidYear(candidate2)){
                const month = datapoint.slice(4,6)
                const day = datapoint.slice(6)
                if (isValidMonthDay(month, day)){
                    return new Date(`${candidate1}-${month}-${day}`)
                }
            }

            if (isValidYear(candidate2) && !isValidYear(candidate1)){
                const month = datapoint.slice(2,4)
                const day = datapoint.slice(0,2)
                if (isValidMonthDay(month, day)){
                    return new Date(`${candidate2}-${month}-${day}`)
                }
            }
        }
    })

}