import { v4 as uuidv4 } from 'uuid';
import { stringYMDHMS3, stringYMDHMS, minusDays, plusDays, stringDateTimeShort, NumberYMD } from './dateTime';
import { normalSort } from './sort';
import { toast } from 'react-toastify';

export function toastSuccess(text='🟢 Updated successful!'){
  toast.success(text);
};

  export function includesOutInArray(arr,propertise,value){
    let res = []
    for(const item of arr){
      if(!item[propertise].includes(value)){
        res.push(item)
      }
    }
    return res
  };

export function mapInArray(arr,propertise,key,value){
  return arr.map((item)=>{
    return item[propertise] === key
        ?value
        :item
  })
};
  


export function transformData(input) {

  let result = [];

  input.forEach(item => {
    if (item.label) {
      // Create a new group for items related to the label
      result.push({
        topic: item.label,
        value: []
      });
    } else if (item.topic && item.to) {
      // Push the items with 'topic' and 'to' into the last group's value array
      if (result.length > 0) {
        result[result.length - 1].value.push({
          name: item.topic,
          to: item.to
        });
      }
    }
  });

  return result;
}

export function formatTime(dateInput) {
  let date;

  if (dateInput instanceof Date) {
    return dateInput;
  }

  // Check if the input is in the {seconds, nanoseconds} format
  if (dateInput && typeof dateInput === 'object' && 'seconds' in dateInput && 'nanoseconds' in dateInput) {
    date = new Date(dateInput.seconds * 1000 + dateInput.nanoseconds / 1000000);
  } else if(dateInput && typeof dateInput === 'object' && '_seconds' in dateInput && '_nanoseconds' in dateInput){
    date = new Date(dateInput._seconds * 1000 + dateInput._nanoseconds / 1000000);
  } else {
    // Assume the input is already a Date object or a string date
    date = new Date(dateInput);
  }

  // Format the date
  return new Date(date)
};

export function getPeriod({ period, startDate, endDate }){
    let periodData = []
    switch (period) {
      case 'day':
        let currentDate = [] // วันทั้งหมดที่เลือก
        let start = startDate
        do {
            currentDate.push(start)
            start = plusDays(start,1)
        }
        while (NumberYMD(start) <= NumberYMD(endDate));
        periodData = currentDate.map(a=>({startDate:a,endDate:a}))
        
        break;
      case 'week':
        periodData = groupDatesByWeek(startDate,endDate)
        break;
      case 'month':
        periodData = groupDatesByMonth(startDate,endDate)
        
        break;
    
      default:
        break;
    }
    return periodData
}

export   function removeSpacesAndCapitalize(text) {
  const noSpaces = text.replace(/\s+/g, '');
  return noSpaces.charAt(0).toUpperCase() + noSpaces.slice(1);
}

export   const formatCurrency = (number) => number?.toLocaleString(undefined, { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
});

export function groupDatesByMonth(startDate, endDate) {
  const start = new Date(startDate); // Parse the start date
  const end = new Date(endDate);     // Parse the end date
  const result = [];
  let currentMonth = [];
  let current = new Date(start);
  let monthStartDate = new Date(current); // Track the start date of each month

  // Handle the case where start and end are in the same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    while (current <= end) {
      currentMonth.push(current.toString()); // Add the current date in full format
      current.setDate(current.getDate() + 1); // Move to the next day
    }
    result.push({
      startDate: monthStartDate.toString(), // Start of the month in full format
      endDate: end.toString(),               // End date in full format
      currentMonth: [...currentMonth]        // Dates in the full format
    });
    return result; // Return early if start and end are in the same month
  }

  // Reset current to the start date for normal iteration
  current = new Date(start);

  while (current <= end) {
    currentMonth.push(current.toString()); // Add the current date in full format

    // If the current date is the last day of the month or the end date
    if (current.getMonth() !== (new Date(current.getTime() + 86400000)).getMonth() || current.getTime() === end.getTime()) {
      result.push({
        startDate: monthStartDate.toString(), // Start of the month in full format
        endDate: current.toString(),          // End of the month in full format
        currentMonth: [...currentMonth]       // Dates in the full format
      });
      currentMonth = []; // Reset for the next month
      current.setDate(current.getDate() + 1); // Move to the next day
      monthStartDate = new Date(current); // Set next month's start date
    } else {
      current.setDate(current.getDate() + 1); // Move to the next day
    }
  }

  return result; // Return the result
}

export function groupDatesByWeek(startDate, endDate) {
  const start = new Date(startDate); // Parse the start date
  const end = new Date(endDate);     // Parse the end date
  const result = [];
  let currentWeek = [];
  let current = new Date(start);
  let weekStartDate = new Date(current); // Track the start date of each week

  while (current <= end) {
    currentWeek.push(current.toString()); // Add the current date in full format

    // If the current date is Sunday (end of the week) or it's the end date
    if (current.getDay() === 0 || current.getTime() === end.getTime()) {
      result.push({
        startDate: weekStartDate.toString(), // Start of the week in full format with timezone
        endDate: current.toString(),         // End of the week in full format with timezone
        currentWeek: [...currentWeek]        // Dates in the full format
      });
      currentWeek = []; // Reset for the next week
      current.setDate(current.getDate() + 1); // Move to the next day
      weekStartDate = new Date(current); // Set next week's start date
    } else {
      current.setDate(current.getDate() + 1); // Move to the next day
    }
  }

  // Handle remaining days if end date doesn't end on Sunday
  if (currentWeek.length > 0) {
    result.push({
      startDate: weekStartDate.toString(), 
      endDate: new Date(current.getTime() - 86400000).toString(), // End date is the last day processed
      currentWeek: [...currentWeek]
    });
  }

  return result;
}

export function mergeArrays(arr1, arr2) {
  // Step 1: Create a new array to store the merged objects
  const newArr = setDifference(arr1,arr2)
  let mergedArray = [...newArr,...arr2];


  // Step 5: The new array now contains the merged objects without duplicates
  return mergedArray;
};

export   const goToTop = () => {
  window.scrollTo({
      top: 0,
      behavior: 'smooth',
  });
};

export function createLabel(hr){
  let hour = Math.floor(hr)
  let arr = []
  for (let i = 0; i <= 23; i++) {
    let newHour = hour +i
    if(newHour > 23){
      arr.push(String(newHour - 24))
    } else {
      arr.push(String(newHour))
    }
  }
  return arr
};

export function aggregateQuantities2(input) {
  let withOption = input.filter(a=>a.option.length>0)
  let withOutOption = input.filter(a=>a.option.length===0)
  const output = {};

  // Iterate through the input array
  withOutOption.forEach(item => {
      // If ID already exists in output, add the quantity to it
      if (output[item.id]) {
          output[item.id].qty += item.qty;
          output[item.id].totalPrice += Number(item.totalPrice);
      } else { // If ID doesn't exist, create a new entry
          output[item.id] = { ...item,totalPrice:Number(item.totalPrice)};
      }
  });

  // Convert the output object back to an array
  return [...Object.values(output),...withOption]
};

export const  setDifference = (setA,setB) => setA.filter(objA => !setB.some(objB => objB.id === objA.id));

export function arrayToNewArray(arr,proterties){
  let res = []
  for(const item of arr){
    res = [...res,item[proterties]]
  }
  return res
};

export function haveCommonElement(arr1, arr2) { // เช็ค 2 array ที่มีสมาชิกเหมือนกันอย่างน้อย 1 ตัว
  return arr1.some(item1 => arr2.includes(item1));
} // return เป็น true/false

  export function checkCategory2(allSelectedCategory,thisLevel){ // เพื่อหาดูว่ามี value กี่ตัว(ใน level mี่ต่ำกว่า) ที่มี aboveId ตรงกับ level ก่อนหน้า
    const { level, value } = thisLevel;
    const above = findInArray(allSelectedCategory,'level',level-1)
    let res = []
    if(level ===1){ // แปลว่าแสดงทั้งหมดใน value นั้นๆ
      res = value
    } else {
      if(above && above.id){ //ต้องเช็คว่ามี level ก่อนหน้า แสดงอยู่มั้ย
        res = filterInCompareArray(value,'aboveId',[...above.aboveId,above.id])
      }
    }
    return res;
  };

  export function summary(arr,propertise){
    let sum = arr?.reduce((a, b) => Number(a) + (Number(b[propertise]) || 0), 0);
    return sum
  };

  export function filterInCompareArray(arr,propertise,value){
    let res = []
    for(const item of arr){
      if(compareArrays(item[propertise],value)){
        res.push(item)
      }
    }
    return res
};

export function startCutoff(startDate,cutOff){
  let res = new Date()
  let cutOfftime = manageCutOff(cutOff,new Date())
  if(NumberYMD(res)===NumberYMD(startDate)){ // เป็นวันเดียวกัน
      if(stringYMDHMS(cutOfftime) > stringYMDHMS(new Date())){
        res = manageCutOff(cutOff,minusDays(startDate,1)) 
      } else {
        res = manageCutOff(cutOff,startDate) 
      }
  } else {
    res = manageCutOff(cutOff,startDate) 
  }
  return res
}
export function endCutoff(endDate,cutOff){

  let res = new Date()
  let cutOfftime = manageCutOff(cutOff,new Date())
  if(NumberYMD(res)===NumberYMD(endDate)){ // เป็นวันเดียวกัน
      if(stringYMDHMS(cutOfftime) > stringYMDHMS(new Date())){
        res = manageCutOff(cutOff,endDate) 
      } else {
        res = manageCutOff(cutOff,plusDays(endDate,1)) 
      }
  } else {
    res = manageCutOff(cutOff,plusDays(endDate,1)) 
  }
  return res
}


export function manageCutOff(cutOff,date){
  let day = new Date(date)
    day.setHours(cutOff.getHours());
    day.setMinutes(cutOff.getMinutes());
return day
};


  export function findTotalPrice(option,channelId,net,qty){
    let allChosen = []
    for(const a of option){
        a.choice.forEach((item)=>{
            if(item.chose===true){
                allChosen.push(item)
            }
        })
    }
    let totalPrice = 0  // คือ totalprice ของเมนูย่อย
    allChosen.forEach((item)=>{
        totalPrice += Number(findInArray(item.price,'id',channelId)?.price|| 0)
    })

    return (Number(net)+ totalPrice)*qty
  };


export const searchFilterFunction = (arr,search,properties='name') => {
  let display = []
  if (search) {
    const newData = arr.filter(function (item) {
      const itemData = item[properties]
        ? item[properties].toUpperCase()
        : "".toUpperCase();
      const textData = search.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
  display = newData;
  } else {
      display = arr
  }
  return display
};

export const searchMultiFunction = (arr, search, properties = ['name']) => {
  if (!search) return arr; // If no search term, return original array

  const searchUpper = search.toUpperCase();
  return arr.filter(item => {
    // Handle single property as a string or multiple properties as an array
    const itemValues = Array.isArray(properties) 
      ? properties.map(prop => item[prop] ? item[prop].toUpperCase() : "") 
      : [item[properties] ? item[properties].toUpperCase() : ""];
    
    // Check if any of the property values include the search text
    return itemValues.some(value => value.indexOf(searchUpper) > -1);
  });
};



export function totalField(arr,field){
  let newArr = []
  arr.forEach((item)=>{
      newArr.push(item[field])
  })
  return newArr
};


export function leanProduct(product){
  const { BOM, addOn, category, id, option, qty, totalPrice, name } = product;
  return {
      BOM, addOn, category, id, option, qty, totalPrice, name,
      tempId:uuidv4(),
      process:'ordered',
      productStaffs:[],
  }
};


export function useToDate(date) {
  if (date instanceof Date) {
      return date;
  }

  try {
      return date.toDate();
  } catch (err) {
      return new Date();
  }
};

export function manageBill(arr1,arr2){
  let bills = mergeArrays(arr1,arr2)
  let normalBills = []
  let voidedBills = []
  bills.forEach(obj => {
    if (obj.void === true) {
      voidedBills.push(obj);
    } else {
      normalBills.push(obj);
    }
  });
  return {bills, normalBills, voidedBills}
};



export const useToLocale = (value) => value?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})||'';
export const useToLocale2 = (value) => value?.toLocaleString()||'';

export function managePromotion(products){
    return products.map((item)=>{
      return item.promotion.status
        ?item.promotion.type==='bath'
            ?{...item,price:item.price[0].price,net:item.price[0].price-Number(item.promotion.value)}
            :{...item,price:item.price[0].price,net:(item.price[0].price*(100-Number(item.promotion.value)))/100}
        :{...item,price:item.price[0].price,net:item.price[0].price}
    })
}


  export function someInArray(arr,propertise,value){
    return arr.some(item=>item[propertise] === value)
  };

  export function findInArray(arr,propertise,value){
    return arr.find(item=>item[propertise] === value)
  };
  
  export function filterInArray(arr,propertise,value){
    return arr.filter(item=>item[propertise] === value)
  };

  export function filterChoice(option){
    let choice = []
    for(const item of option){
        choice = [...choice,...filterInArray(item.choice,'chose',true)]
    }
    return choice
  };

  export function filterDeleteInArray(arr,propertise,value){
    return arr.filter(item=>item[propertise] !== value)
  };
  
  
  export function compareArrays(a, b){
    return  a.length === b.length && a.every((element, index) => element === b[index]);
  } 




  export function manageCategory(thisLevel_Value,allSelectedCategory,selectedCategory){
    const newCategory = []
    for(const item of allSelectedCategory){
      if(!someInArray(thisLevel_Value,'id',item.id)){ // เอาไว้ลบ ตัวอื่นใน level เดียวกันออก
        newCategory.push(item)
      }
    }
    return [...newCategory,selectedCategory].filter(a=>a.level <= selectedCategory.level)
  };

  export function manageDashboard({ selectedBill, smartCategory}){
    let newProduct = []
    let newCategory = []
  
    for(const item of selectedBill){
      let thisProduct = item.product.filter(a=>a.process!=='cancel')
      
      for(const product of thisProduct){
        const { id, qty, totalPrice, category } = product;

        // 1. แยกตามสินค้า
        let checkProduct = findInArray(newProduct,'id',id)  // สำหรับการเรียง product
        if(checkProduct && checkProduct.id){
          checkProduct.allQty = checkProduct.allQty + qty
          checkProduct.allTotalPrice = checkProduct.allTotalPrice + Number(totalPrice)
        } else {
          newProduct.push({...product,allQty:qty,allTotalPrice:Number(totalPrice)})
        }

        //2. แยกตามหมวดหมู๋
        if(category.length===0){
            let checkCategory = findInArray(newCategory,'id','x') // หมวดหมู่ชั่นที่ 1
            if(checkCategory && checkCategory.id){
              checkCategory.allQty += qty
              checkCategory.allTotalPrice += Number(totalPrice)
            } else {
              newCategory.push({id:'x',allQty:qty,allTotalPrice:Number(totalPrice),name:'ไม่มีหมวดหมู่'})
            }
        } else {
          let checkCategory = findInArray(newCategory,'id',category[0]) // หมวดหมู่ชั่นที่ 1
          if(checkCategory && checkCategory.id){
            checkCategory.allQty += qty
            checkCategory.allTotalPrice += Number(totalPrice)
          } else {
            newCategory.push({id:category[0],allQty:qty,allTotalPrice:Number(totalPrice),name:findInArray(smartCategory[0]?.value,'id',category[0])?.name||'ไม่ทราบหมวดหมู่'})
          }
        }

      }
    }

    return {
      category:newCategory,
      product:newProduct,
    }
  };


  export function manageSummary({ selectedBill, smartCategory, selectedVoidBill, channel, t }){
  
    let thisDiscount = 0
    let thisServiceCharge = 0
    let thisVat = 0
    let thisFine = 0
    let thisPayment = []
    let thisProduct = []
    let thisCategory = []
    let thisCashier = [];
    let thisSelectedQty = selectedBill.length;
    let thisVoidQty = selectedVoidBill.length;
    let saleRate = 0;
    let thisTotalNet = 0;
    let thisTotalPrice = 0;
    let thisRounding = 0;
    let thisTotalCash = 0;
    let thisTotalChange = 0;
    let thisSaleChannel = [];
    let thisCampaign = []
    
  
    for(const { discount, serviceCharge, vat, fine, paymentChannel, product, net, profileName, rounding, change, priceId, tableId, tableName, campaign  } of selectedBill){
      if(rounding){
        thisRounding += Number(rounding)
      }
      if(change){
        thisTotalChange += Number(change)
      }
      if(discount){
          thisDiscount += Number(discount)
        }
        if(serviceCharge){
          thisServiceCharge += Number(serviceCharge)
        }
        if(vat){
          thisVat += Number(vat)
        }
        if(fine){
          thisFine += Number(fine)
        }


        // let findChannel = thisSaleChannel.find(a=>a.id===priceId)
        // if(findChannel && findChannel.id){
        //   findChannel.totalNet += net
        //   findChannel.count ++
        // } else {
        //   thisSaleChannel.push({ id:priceId, count:1, totalNet:net, name:findInArray(channel,'id',priceId)?.name||''})
        // }

        if (tableId === 1 || tableId.length === 20) {
          let findChannel = thisSaleChannel.find(a => a.tableId === 1);
          if (findChannel) {
              findChannel.totalNet += net;
              findChannel.count++;
          } else {
            thisSaleChannel.push({ id:1, tableId:1, count:1, totalNet:net, name:findInArray(channel,'id',priceId)?.name||''})
          }
      } else if (tableId.length > 20) {
        let findChannel = thisSaleChannel.find(a => a.name === 'Pick Up');
          if (findChannel) {
              findChannel.totalNet += net;
              findChannel.count++;
          } else {
            thisSaleChannel.push({ id:'pickup', tableId:'pickup', count:1, totalNet:net, name:'Pick Up'})
          }
      } else {
          let findChannel = thisSaleChannel.find(a => a.tableId === tableId);
          if (findChannel) {
              findChannel.totalNet += net;
              findChannel.count++;
          } else {
            const { name } = channel.find(a=>a.id===tableId) || { name:tableName }
            thisSaleChannel.push({ id:tableId, tableId, count:1, totalNet:net, name})
          }
      };

      for(const { id, name, discount } of campaign){
        let findCampaign = thisCampaign.find(a=>a.id===id)
        if(findCampaign && findCampaign.id){
          findCampaign.discount += Number(discount)
          findCampaign.qty ++
        } else {
          thisCampaign.push({ name, qty:1, discount:Number(discount), id})
        }
      }

        


        let findCashier = thisCashier.find(a=>a.name===profileName)
        if(findCashier && findCashier.name){
          findCashier.totalNet += net
          findCashier.count ++
        } else {
          thisCashier.push({ name:profileName, count:1, totalNet:net})
        }
        for(const a of paymentChannel){
          let findPayment = thisPayment.find(b=>b.id===a.id)
          if(findPayment && findPayment.id){
            findPayment.amount += Number(a.amount)-Number(a?.change||0)
            findPayment.qty ++
          } else {
            thisPayment.push({...a,amount:Number(a.amount)-Number(a?.change||0),qty:1})
          }
        }
        if(paymentChannel.length===0){
          let findPayment = thisPayment.find(b=>b.id==='noId')
          if(findPayment && findPayment.id){
            findPayment.amount += net
            findPayment.qty ++
          } else {
            thisPayment.push({name:t('reportPayment.noPayment'),amount:net,qty:1,id:'noId'})
          }
        }
        for(const { id, name, qty, totalPrice, category } of product){
          let findProduct = thisProduct.find(a=>a.id===id)
          if(findProduct && findProduct.id){
            findProduct.thisQty += qty
            findProduct.thisTotalPrice += Number(totalPrice)
            findProduct.count ++
          } else {
            thisProduct.push({
              id,
              name,
              thisQty:qty, // จำนวนทั้งหมดที่สั่ง
              count:1, // จำนวนครั้งที่สั่งต่อ 1 บิล = 1 ครั้ง
              thisTotalPrice:Number(totalPrice) // ยอดขายทั้งหมด
            })
          }
          if(category.length===0){
              let findCategory = thisCategory.find(a=>a.id==='id') // หมวดหมู่ชั่นที่ 1
              if(findCategory && findCategory.id){
                findCategory.thisQty += qty
                findCategory.thisTotalPrice += Number(totalPrice)
              } else {
                thisCategory.push({
                  id:'id',
                  thisQty:qty,
                  thisTotalPrice:Number(totalPrice),
                  name:'ไม่มีหมวดหมู่'
                })
              }
          } else {
            let firstCategory = category[0];
            let findCategory = thisCategory.find(a=>a.id===firstCategory) // หมวดหมู่ชั่นที่ 1
            if(findCategory && findCategory.id){
              findCategory.thisQty += qty
              findCategory.thisTotalPrice += Number(totalPrice)
            } else {
              thisCategory.push({
                id:firstCategory,
                thisQty:qty,
                thisTotalPrice:Number(totalPrice),
                name:findInArray(smartCategory[0]?.value,'id',firstCategory)?.name||'ไม่ทราบหมวดหมู่'
              })
            }
          }
        }
    }
    thisTotalNet = summary(selectedBill,'net');
    thisTotalPrice = summary(thisCategory,'thisTotalPrice')
    thisTotalCash = summary(thisPayment.filter(a=>a.id===1),'amount')
    if(thisSelectedQty>0){
      saleRate = thisTotalNet/thisSelectedQty
    }
    
  
    return {
      thisDiscount,
      thisServiceCharge,
      thisVat,
      thisFine,
      thisPayment,
      thisProduct,
      thisCategory,
      thisCashier,
      thisSelectedQty,
      thisVoidQty,
      saleRate,
      thisTotalNet,
      thisTotalPrice,
      thisRounding,
      thisTotalCash,
      thisTotalChange,
      thisSaleChannel,
      thisCampaign
    }
  };
