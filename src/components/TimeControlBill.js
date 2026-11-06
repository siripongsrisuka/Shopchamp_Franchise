import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBill, updateEndDate, updateStartDate } from "../redux/billSlice";
import { dayRanges } from "../api/franchiseApi";
import TimeContainer from "./TimeContainer";

// DEV-0002 ก้อน 9f: ค้นหา = ยิง `franchise.billList` ช่วงที่เลือก (วันธุรกิจตาม cutOff ของสาขา · ไม่นับใบยกเลิก)
//   เปิดจอแล้วยังไม่เคยโหลดช่วงนี้ของแฟรนไชส์นี้ = โหลดเอง (เดิมโหลดเมื่อยังไม่มีวันไหนในแคชเลย · แคชข้ามแฟรนไชส์ได้ DI-04)
function TimeControlBill() {
    const dispatch = useDispatch()
    const { franchise:{ id:franchiseId } } = useSelector((state)=> state.franchise);

    const { billDates, modal_Bill, startDate, endDate, voided, billError } = useSelector((state)=> state.bill);

    useEffect(()=>{
        const r = dayRanges(startDate, endDate);
        const key = r.length ? `${franchiseId}|${r[0].fromDay}|${r[r.length-1].toDay}` : '';
        if(franchiseId && !billDates.includes(key)){
            search()
        }
    },[franchiseId]);

    function search(){
        if(!franchiseId) return;
        dispatch(fetchBill({ franchiseId, startDate, endDate }))
    };

    return <>
        <TimeContainer
            search={search}
            show={modal_Bill}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(date) => dispatch(updateStartDate(date))}
            onChangeEnd={(date) => dispatch(updateEndDate(date))}
        />
        {billError
            ?<div data-testid="bill-error" style={styles.error} >{billError}</div>
            :voided && voided.count > 0
                ?<div data-testid="bill-voided" style={styles.note} >ไม่นับใบยกเลิก {voided.count} ใบ ({Number(voided.net).toLocaleString()} บาท)</div>
                :null
        }
    </>
};

const styles = {
    error : { color:'var(--sc-danger)', padding:'6px 4px', fontSize:14 },
    note : { color:'var(--sc-text-2)', padding:'6px 4px', fontSize:13 },
}

export default TimeControlBill;
