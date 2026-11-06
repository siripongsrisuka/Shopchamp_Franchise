import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { normalSort } from '../Utility/sort';
import { franchiseBillList, dayRanges } from '../api/franchiseApi';
import { apiErrorMessage, serverErrorCode } from '../api/posApi';

const initialState = {
    bills:[], // 
    modal_Bill:false,
    billDates:[], // คงชื่อเดิม · ตอนนี้เก็บกุญแจของช่วงที่โหลดแล้ว 1 ตัว `<franchiseId>|<fromDay>|<toDay>`
    selectedBills:[],
    startDate:new Date(),
    endDate:new Date(),
    voided:{ count:0, net:0 }, // ใบยกเลิกในช่วง (ไม่อยู่ในยอด · WR-04)
    billError:'',
}

// DEV-0002 ก้อน 9f: `franchise.billList` (census 288 · function pos_heavy)
//   เดิม: bill where franchiseId == x and billDate in [วันปฏิทิน] ทีละ 10 วัน แล้วกรองด้วย billDate (WR-01)
//   ตอนนี้: server คืนบิลในวันธุรกิจ fromDay..toDay ตาม cutOff ของแต่ละสาขา · ไม่มีใบยกเลิก · ช่วงละไม่เกิน 31 วัน ⇒ ช่วงยาวยิงหลายก้อนต่อกัน
//   ❌ ไม่แคชรายวันแบบเดิม: วันของบิลตัดสินที่ server ⇒ ทุกครั้งที่กดค้นหาโหลดช่วงที่เลือกใหม่ทั้งช่วง
export const fetchBill = createAsyncThunk(
    'bill/fetchBill',
    async ({ franchiseId, startDate, endDate }, { rejectWithValue }) => {
      const ranges = dayRanges(startDate, endDate);
      if (!ranges.length) return rejectWithValue({ message: 'วันเริ่มต้องไม่หลังวันสิ้นสุด', code: 'range_invalid' });
      try {
        const results = await Promise.all(ranges.map((r) => franchiseBillList({ franchiseId, fromDay: r.fromDay, toDay: r.toDay })));
        const data = [];
        const voided = { count: 0, net: 0 };
        for (const res of results) {
          for (const b of res.bills || []) data.push({ ...b, net: Number(b.net) || 0 });
          if (res.voided) { voided.count += Number(res.voided.count) || 0; voided.net += Number(res.voided.net) || 0; }
        }
        const key = `${franchiseId}|${ranges[0].fromDay}|${ranges[ranges.length - 1].toDay}`;
        return { data, key, voided };
      } catch (error) {
        return rejectWithValue({ message: apiErrorMessage(error, 'โหลดยอดขายไม่สำเร็จ'), code: serverErrorCode(error) });
      }
    }
  );



export const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    clearBill: state => {
      state.bills = [];
      state.billDates = [];
      state.selectedBills = [];
      state.voided = { count:0, net:0 };
      state.billError = '';
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateBills: state => {
        state.selectedBills = normalSort('dateTime',[...state.bills])
    }, 
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBill.pending, state => {
      state.modal_Bill = true
      state.billError = ''
    })
    builder.addCase(fetchBill.fulfilled, (state, action) => {
        const { data, key, voided } = action.payload;
        const sorted = normalSort('dateTime',[...data])
        state.bills = sorted
        state.billDates = [key]
        state.voided = voided
        state.billError = ''
        state.selectedBills = [...sorted]
        state.modal_Bill = false
    })
    builder.addCase(fetchBill.rejected, (state, action) => {
        state.modal_Bill = false
        state.billError = (action.payload && action.payload.message) || 'โหลดยอดขายไม่สำเร็จ'
    })
  }
})

export const { 
  clearBill, 
  updateBills, 
  updateStartDate, 
  updateEndDate
} = billSlice.actions

export default billSlice.reducer