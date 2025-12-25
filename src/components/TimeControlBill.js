import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NumberYMD, plusDays, stringYMDHMS3 } from "../Utility/dateTime";
import { fetchBill, updateEndDate, updateBills, updateStartDate } from "../redux/billSlice";
import TimeContainer from "./TimeContainer";

function TimeControlBill() {
    const dispatch = useDispatch()
    const { franchise:{ id:franchiseId } } = useSelector((state)=> state.franchise);

    const { billDates, modal_Bill, startDate, endDate } = useSelector((state)=> state.bill);

    useEffect(()=>{
        if(billDates.length===0){
            search()
        }
    },[]);

    function search(){
        let oldSearch = []
        let newSearch = []
        let start = startDate
        do {
            oldSearch.push(stringYMDHMS3(start))
            start = plusDays(start,1)
        }
        while (NumberYMD(start) <= NumberYMD(endDate));

        for(const item of oldSearch){
            if(!billDates.includes(item)){
                newSearch.push(item)
            }
        }
        if(newSearch.length >0){
            dispatch(fetchBill({
                franchiseId,
                billDate:newSearch,
                selectedDate:oldSearch 
            }))
        } else {
            dispatch(updateBills({ selectedDate:oldSearch }))
        }
    };

    return <TimeContainer
            search={search}
            show={modal_Bill}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
};


export default TimeControlBill;
