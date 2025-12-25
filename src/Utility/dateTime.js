export const getHoursMinute = (today) => {
    const day = new Date(today)
    const cDateTime =
        day.getHours().toString().padStart(2,"0")+":"+
        day.getMinutes().toString().padStart(2,"0") 

    return cDateTime;  //00:25 น.
};

export const stringReceiptNumber = (receipts) => {
    const date = new Date()
    const cDateTime =
        date.getFullYear().toString().padStart(4,"0")+"" +
        parseInt(date.getMonth()+1).toString().padStart(2,"0") +""+
        receipts.toString().padStart(6,"0")

    return cDateTime;  // 202309000123
};


export function plusDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}   //plusDays(new Date(), 14)

export const stringYMDHMS = (day) => {
    const today = new Date(day);
    const cDateTime =
        today.getFullYear().toString().padStart(4,"0")+
        parseInt(today.getMonth()+1).toString().padStart(2,"0") +
        today.getDate().toString().padStart(2,"0") +
        today.getHours().toString().padStart(2,"0")+
        today.getMinutes().toString().padStart(2,"0")+
        today.getSeconds().toString().padStart(2,"0");

    return cDateTime;  // 20210627002526
};

export const stringDateTimeShort = (dateTime) => {
    const today = new Date(dateTime);
    const cDateTime =
        today.getDate().toString().padStart(2,"0") + "/"+
        parseInt(today.getMonth()+1).toString().padStart(2,"0") +"/"+
        today.getFullYear().toString().padStart(4,"0")

    return cDateTime;  // 27/06/2021
}

export const stringDateTimeReceipt = (date) => {
    const day = new Date(date)
    const cDateTime =
        day.getDate().toString().padStart(2,"0") + "/"+
        parseInt(day.getMonth()+1).toString().padStart(2,"0") +"/"+
        day.getFullYear().toString().padStart(4,"0")+" " +
        day.getHours().toString().padStart(2,"0")+":"+
        day.getMinutes().toString().padStart(2,"0")+":"+
        day.getSeconds().toString().padStart(2,"0");

    return cDateTime;  // 27/06/2021 00:25:26
}

export const stringFullDate = (day,t) => {
    const today = new Date(day);
    let xx = parseInt(today.getMonth()+1).toString().padStart(2,"0")
    switch (xx) {
        case '01':
            xx = t('month.jan')
            break;
        case '02':
            xx = t('month.feb')
            break;
        case '03':
            xx = t('month.mar')
            break;
        case '04':
            xx = t('month.apr')
            break;
        case '05':
            xx = t('month.may')
            break;
        case '06':
            xx = t('month.jun')
            break;
        case '07':
            xx = t('month.jul')
            break;
        case '08':
            xx = t('month.aug')
            break;
        case '09':
            xx = t('month.sep')
            break;
        case '10':
            xx = t('month.oct')
            break;
        case '11':
            xx = t('month.nov')
            break;
        case '12':
            xx = t('month.dec')
            break;
        default:
            break;
    }

    let year = Number(today.getFullYear().toString().padStart(4,"0")) 
    const cDateTime =
        today.getDate().toString().padStart(2,"0") + "  "+
        xx +" "+
        year+"   " 
    return cDateTime;  // 12/ม.ค./2021 
}

export function getWeek(date) {
    var day = date.getDay()
    let startDate = date
    let endDate = date
    if(day == 0){
        endDate = plusDays(date,7)
    } else if(day == 1){
        startDate = minusDays(date,0)
        endDate = plusDays(date,6)
    }else if(day == 2){
        startDate = minusDays(date,1)
        endDate = plusDays(date,5)
    }else if(day == 3){
        startDate = minusDays(date,2)
        endDate = plusDays(date,4)
    }else if(day == 4){
        startDate = minusDays(date,3)
        endDate = plusDays(date,3)
    }else if(day == 5){
        startDate = minusDays(date,4)
        endDate = plusDays(date,2)
    }else {
        startDate = minusDays(date,1)
    }
    let lastDay = getLastDayOfYear(date)
    if(endDate > lastDay){
        endDate = lastDay
    }
    return {startDate:startDate,endDate:endDate}
}


export function getLastDayOfYear(date) {
    const currentYear = date.getFullYear();
    return new Date(currentYear, 11, 31); // 11 represents December (months are 0-indexed)
};

export const NumberYMD = (date) => {
    const cDateTime =
        date.getFullYear().toString().padStart(4,"0")+
        parseInt(date.getMonth()+1).toString().padStart(2,"0") +
        date.getDate().toString().padStart(2,"0") 

    return Number(cDateTime);  // 20210627
};

export function minusDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}  

export const stringYMDHMS3 = (day) => {
    const cDateTime =
        day.getFullYear().toString().padStart(4,"0")+
        parseInt(day.getMonth()+1).toString().padStart(2,"0") +
        day.getDate().toString().padStart(2,"0")

    return String(cDateTime);  // 20210627
};

export const firstDayOfMonth = (today=new Date()) =>{
    return new Date(today.getFullYear(), today.getMonth(), 1);
};

export const lastDayOfMonth = (today=new Date()) =>{
    return new Date(today.getFullYear(), today.getMonth()+1, 0);
};

const translates = {
    '1':'01:00 ',
    '2':'02:00 ',
    '3':'03:00 ',
    '4':'04:00 ',
    '5':'05:00 ',
    '6':'06:00 ',
    '7':'07:00 ',
    '8':'08:00 ',
    '9':'09:00 ',
    '10':'10:00 ',
    '11':'11:00 ',
    '12':'12:00 ',
    '13':'13:00 ',
    '14':'14:00 ',
    '15':'15:00 ',
    '16':'16:00 ',
    '17':'17:00 ',
    '18':'18:00 ',
    '19':'19:00 ',
    '20':'20:00 ',
    '21':'21:00 ',
    '22':'22:00 ',
    '23':'23:00 ',
    '0':'00:00 ',
  };

export function translateClock(value,clock){
    return translates[value]+clock
};

export const stringDateTime3 = (today) => {
    // const today = new Date();
    let xx = 10
    if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '01'){
        xx = 'ม.ค.'
    } else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '02'){
        xx = 'ก.พ.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '03'){
        xx = 'มี.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '04'){
        xx = 'เม.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '05'){
        xx = 'พ.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '06'){
        xx = 'มิ.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '07'){
        xx = 'ก.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '08'){
        xx = 'ส.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '09'){
        xx = 'ก.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '10'){
        xx = 'ต.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '11'){
        xx = 'พ.ย.'
    }else{
        xx = 'ธ.ค.'
    }

    let year = Number(today.getFullYear().toString().padStart(4,"0")) + 543
    const cDateTime =
        today.getDate().toString().padStart(2,"0") + "  "+
        xx +" "+
        year+"   " 
    return cDateTime;  // 27/06/2021 
}

