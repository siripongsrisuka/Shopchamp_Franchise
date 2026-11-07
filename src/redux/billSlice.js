import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { franchiseBreakdown, dayRanges, mergeFranchiseBreakdown } from '../api/franchiseApi';
import { apiErrorMessage, serverErrorCode } from '../api/posApi';

const emptySales = () => mergeFranchiseBreakdown([]);

const initialState = {
    sales: emptySales(), // ผล `franchise.breakdown` ของช่วงที่เลือก {totals, shops, hours, items}
    modal_Bill:false,
    billDates:[], // คงชื่อเดิม · เก็บกุญแจของช่วงที่โหลดแล้ว 1 ตัว `<franchiseId>|<fromDay>|<toDay>`
    startDate:new Date(),
    endDate:new Date(),
    voided:{ count:0, net:0 }, // ใบยกเลิกในช่วง (ไม่อยู่ในยอด · WR-04)
    billError:'',
}

// DEV-0002 Pack เคาะ 2026-11-07: ยอดแฟรนไชส์ใช้สูตรกลางตัวเดียวกับรายงานร้าน
//   เดิม (ก้อน 9f รอบแรก): โหลดบิลทั้งช่วงจาก `franchise.billList` แล้ว 3 จอบวก moneyMustPaid / product.net เอง
//   ตอนนี้: `franchise.breakdown` คิดที่ server (logic.salesBreakdown ต่อสาขา) · เว็บไม่มีสูตรยอด · ช่วงเกิน 31 วัน = ยิงทีละช่วงแล้วบวกสตางค์
//   ❌ ไม่แคชรายวัน: ทุกครั้งที่กดค้นหาโหลดช่วงที่เลือกใหม่ทั้งช่วง
export const fetchBill = createAsyncThunk(
    'bill/fetchBill',
    async ({ franchiseId, startDate, endDate }, { rejectWithValue }) => {
      const ranges = dayRanges(startDate, endDate);
      if (!ranges.length) return rejectWithValue({ message: 'วันเริ่มต้องไม่หลังวันสิ้นสุด', code: 'range_invalid' });
      try {
        const results = await Promise.all(ranges.map((r) => franchiseBreakdown({ franchiseId, fromDay: r.fromDay, toDay: r.toDay })));
        const sales = mergeFranchiseBreakdown(results);
        const key = `${franchiseId}|${ranges[0].fromDay}|${ranges[ranges.length - 1].toDay}`;
        return { sales, key, voided: { count: Number(sales.totals.voidQty) || 0, net: Number(sales.totals.voidTotal) || 0 } };
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
      state.sales = emptySales();
      state.billDates = [];
      state.voided = { count:0, net:0 };
      state.billError = '';
      state.startDate = new Date();
      state.endDate = new Date();
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
        const { sales, key, voided } = action.payload;
        state.sales = sales
        state.billDates = [key]
        state.voided = voided
        state.billError = ''
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
  updateStartDate, 
  updateEndDate
} = billSlice.actions

export default billSlice.reducer