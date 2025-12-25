import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    bills:[], // 
    modal_Bill:false,
    billDates:[],
    selectedBills:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchBill = createAsyncThunk(
    'bill/fetchBill',
    async ({ franchiseId, billDate, selectedDate }) => {
      let data = [];
  
      // Split billDate into chunks of 10 elements each
      const chunkSize = 10;
      const billDateChunks = [];
      for (let i = 0; i < billDate.length; i += chunkSize) {
        billDateChunks.push(billDate.slice(i, i + chunkSize));
      }
  
      // Use Promise.all to make multiple queries
      const promises = billDateChunks.map(async (chunk) => {
        const query = db.collection('bill')
          .where("franchiseId", "==", franchiseId)
          .where('billDate', 'in', chunk);
  
        try {
          const qsnapshot = await query.get();
          if (qsnapshot.docs.length > 0) {
            qsnapshot.forEach((doc) => {
              const { dateTime,  ...rest } = doc.data()
              data.push({ 
                ...rest, 
                dateTime: formatTime(dateTime),
                id:doc.id, 
                net: Number(rest.moneyMustPaid),
  
              });
            });
          } else {
            console.log('No items found for chunk:', chunk);
          }
        } catch (err) {
          console.error('Error:', err);
        }
      });
  
      // Wait for all queries to complete
      await Promise.all(promises);
      return { data, billDate, selectedDate };
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
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateBills: (state, action) => {
        const { selectedDate } = action.payload
        state.selectedBills = normalSort('dateTime',state.bills.filter(a=>[selectedDate].includes(a.billDate)))
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
    })
    builder.addCase(fetchBill.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.bills = [...state.bills.filter(a=>a.billDate!==today),...data]
        } else {
          state.bills.push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.selectedBills = normalSort('dateTime',state.bills.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_Bill = false
    })
    builder.addCase(fetchBill.rejected, state => {
        state.modal_Bill = false
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