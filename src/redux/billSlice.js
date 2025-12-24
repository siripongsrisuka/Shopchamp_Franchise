import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { endCutoff,  manageBill, startCutoff, summary, useToDate } from '../Utility/function';
import { NumberYMD, minusDays, stringYMDHMS3 } from '../Utility/dateTime';
import { initialCheckOut } from '../configs'
import { reverseSort } from '../Utility/sort';
const initialState = {
    bills:[], // 
    normalBill:[],
    voidedBill:[],
    modal_Bill:false,
    billDates:[],
    product:[],
    category:[],
    selectedBill:[],
    selectedVoidedBill:[],
    orders:[], // ออเดอร์ที่ถูกเรียก
    billOrder:[], // เก็บ billId ที่ถูกเรียกดู order
    modal_Order:false,

    importDates:[],
    imports:[],
    selectedImport:[],

    countDates:[],
    counts:[],
    selectedCount:[],

    adjustDates:[],
    adjusts:[],
    selectedAdjust:[],

}


export const fetchBill = createAsyncThunk(
  'product/fetchBill',
  async ({ shopId, billDate, cutOff, startDate, endDate }) => {
    let allData = [];
    const chunkSize = 10;

    // Split billDate into chunks of 10 elements each
    const billDateChunks = [];
    for (let i = 0; i < billDate.length; i += chunkSize) {
      billDateChunks.push(billDate.slice(i, i + chunkSize));
    }

    // Fetch documents recursively with pagination
    const fetchChunkData = async (query, lastVisible) => {
      if (lastVisible) {
        query = query.startAfter(lastVisible);
      }

      const qsnapshot = await query.get();
      const docs = qsnapshot.docs;

      docs.forEach((doc) => {
        const { timestamp, vat, ...rest } = doc.data();
        allData.push({
          ...initialCheckOut,
          id: doc.id,
          ...rest,
          timestamp: timestamp.toDate(),
          vat: Math.round(Number(vat) * 100) / 100,
        });
      });

      if (docs.length > 0) {
        lastVisible = docs[docs.length - 1];
        await fetchChunkData(query, lastVisible); // Recursively fetch next batch
      }
    };

    // Iterate over each chunk and fetch data in batches
    const promises = billDateChunks.map(async (chunk) => {
      const query = db.collection('checkout')
        .where('shopId', '==', shopId)
        .where('billDate', 'in', chunk)
        .limit(500); // Limit per query to control memory usage

      await fetchChunkData(query, null);
    });

    // Wait for all chunks to complete fetching
    await Promise.all(promises);

    // Return the accumulated data
    return { data: reverseSort('timestamp', allData), billDate, cutOff, startDate, endDate };
  }
);

export const fetchImport = createAsyncThunk(
  'bill/fetchImport',
  async ({ shopId, billDate, currentDate }) => {
    const arr = [];
    
    // Custom chunking function
    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // Split the billDate array into chunks of 10
    const chunks = chunkArray(billDate, 10);

    // Process each chunk individually
    for (const chunk of chunks) {
      const qsnapshot = await db.collection('importStock')
        .where('shopId', '==', shopId)
        .where('billDate', 'in', chunk)
        .get();
      
      if (qsnapshot.docs.length > 0) {
        qsnapshot.forEach(doc => {
          const { timestamp, products, ...rest } = doc.data();
          arr.push({
            ...rest,
            timestamp: timestamp.toDate(), // Convert timestamp to Date
            id: doc.id,
            products,
            productSearch: products
          });
        });
      }
    }

    // Return the accumulated data
    return { data: reverseSort('timestamp', arr), billDate, currentDate };
  }
);



// export const fetchCount = createAsyncThunk(
//   'bill/fetchCount',
//   async ({ shopId, billDate, currentDate }) => {
//     const arr = [];
//     await db.collection('stockReport')
//         .where('shopId', '==', shopId)
//         .where('billDate', 'in', billDate)
//         .get().then((qsnapshot)=>{
//           if(qsnapshot.docs.length>0){
//             qsnapshot.forEach(doc => {
//               const { timestamp,  ...rest } = doc.data();
//               arr.push({
//                   ...rest,
//                   timestamp: timestamp.toDate(), // Convert timestamp to Date
//                   id: doc.id,
//               });
//             });
//           }
//         })
    
//     // Return the accumulated data
//     return { data: reverseSort('timestamp', arr), billDate, currentDate };
//   }
// );

export const fetchCount = createAsyncThunk(
  'bill/fetchCount',
  async ({ shopId, billDate, currentDate }) => {
    const arr = [];

    // Custom chunking function
    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // Split the billDate array into chunks of 10
    const chunks = chunkArray(billDate, 10);

    // Process each chunk individually
    for (const chunk of chunks) {
      const qsnapshot = await db.collection('stockReport')
        .where('shopId', '==', shopId)
        .where('billDate', 'in', chunk)
        .get();
      
      if (qsnapshot.docs.length > 0) {
        qsnapshot.forEach(doc => {
          const { timestamp, ...rest } = doc.data();
          arr.push({
            ...rest,
            timestamp: timestamp.toDate(), // Convert timestamp to Date
            id: doc.id,
          });
        });
      }
    }

    // Return the accumulated data
    return { data: reverseSort('timestamp', arr), billDate, currentDate };
  }
);

// export const fetchAdjust = createAsyncThunk(
//   'bill/fetchAdjust',
//   async ({ shopId, billDate, currentDate }) => {
//     const arr = [];
//     await db.collection('adjustStock')
//         .where('shopId', '==', shopId)
//         .where('billDate', 'in', billDate)
//         .get().then((qsnapshot)=>{
//           if(qsnapshot.docs.length>0){
//             qsnapshot.forEach(doc => {
//               const { timestamp,  ...rest } = doc.data();
//               arr.push({
//                   ...rest,
//                   timestamp: timestamp.toDate(), // Convert timestamp to Date
//                   id: doc.id,
//               });
//             });
//           }
//         })
    
//     // Return the accumulated data
//     return { data: reverseSort('timestamp', arr), billDate, currentDate };
//   }
// );

export const fetchAdjust = createAsyncThunk(
  'bill/fetchAdjust',
  async ({ shopId, billDate, currentDate }) => {
    const arr = [];

    // Custom chunking function
    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // Split the billDate array into chunks of 10
    const chunks = chunkArray(billDate, 10);

    // Process each chunk individually
    for (const chunk of chunks) {
      const qsnapshot = await db.collection('adjustStock')
        .where('shopId', '==', shopId)
        .where('billDate', 'in', chunk)
        .get();

      if (qsnapshot.docs.length > 0) {
        qsnapshot.forEach(doc => {
          const { timestamp, ...rest } = doc.data();
          arr.push({
            ...rest,
            timestamp: timestamp.toDate(), // Convert timestamp to Date
            id: doc.id,
          });
        });
      }
    }

    // Return the accumulated data
    return { data: reverseSort('timestamp', arr), billDate, currentDate };
  }
);



export const billSlice = createSlice({
  name: 'resBill',
  initialState,
  reducers: {
    clearBill: state => {
      state.bills =[]
      state.normalBill = []
      state.voidedBill = []
      state.billDates = []
      state.product = []
      state.category = []
      state.selectedBill = []
      state.selectedVoidedBill = []
      state.orders = []
      state.billOrder = []
    },
    updateModal_Bill: state => {
      state.modal_Bill = !state.modal_Bill
    },
    updateDashBoard: (state, action) => {
        const { product , category } = action.payload;
        state.product = product
        state.category = category
    },
    updateBills: (state, action) => {
      const { startDate, endDate, cutOff } = action.payload
      state.selectedBill = state.normalBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
      state.selectedVoidedBill = state.voidedBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
    }, 
    updateImport: (state, action) => {
      const { currentDate } = action.payload
      const dateIds = new Set(currentDate)
      state.selectedImport = state.imports.filter(a=>dateIds.has(a.billDate))
    }, 
    updateCount: (state, action) => {
      const { currentDate } = action.payload
      const dateIds = new Set(currentDate)
      state.selectedCount = state.counts.filter(a=>dateIds.has(a.billDate))
    }, 
    updateAdjust: (state, action) => {
      const { currentDate } = action.payload
      const dateIds = new Set(currentDate)
      state.selectedAdjust = state.adjusts.filter(a=>dateIds.has(a.billDate))
    }, 
  },
  extraReducers: builder => {
    builder.addCase(fetchBill.pending, state => {
      state.modal_Bill = true
    })
    builder.addCase(fetchBill.fulfilled, (state, action) => {
      const { data, billDate, cutOff, startDate, endDate } = action.payload;
        let duplicate = billDate.some((item)=>{return(Number(item)>=NumberYMD(minusDays(new Date(),1)))})
        if(duplicate){
          const { bills, normalBills, voidedBills } = manageBill(state.bills,data)
          state.bills = bills
          state.normalBill = normalBills
          state.voidedBill = voidedBills
        } else {
          state.bills = [...state.bills,...data]
          state.normalBill = [...state.normalBill,...data.filter((item)=>{return(!Boolean(item.void))})]
          state.voidedBill = [...state.voidedBill,...data.filter((item)=>{return(item.void===true )})]
        }
        state.selectedBill = state.normalBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.selectedVoidedBill = state.voidedBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.billDates = [...state.billDates,...billDate.filter((item)=>{return(item < stringYMDHMS3(new Date()))})] 
        state.modal_Bill = false
    })
    builder.addCase(fetchBill.rejected, state => {
        state.modal_Bill = false
    })

    builder.addCase(fetchImport.pending, state => {
      state.modal_Bill = true
    })
    builder.addCase(fetchImport.fulfilled, (state, action) => {
      const { data, billDate, currentDate} = action.payload;
     
        state.imports = [...state.imports,...data]
        const dateIds = new Set(currentDate)
        state.selectedImport = state.imports.filter(a=>dateIds.has(a.billDate))
        state.importDates = [...state.importDates,...billDate] 
        state.modal_Bill = false
    })
    builder.addCase(fetchImport.rejected, state => {
        state.modal_Bill = false
    })
    builder.addCase(fetchCount.pending, state => {
      state.modal_Bill = true
    })
    builder.addCase(fetchCount.fulfilled, (state, action) => {
      const { data, billDate, currentDate} = action.payload;
     
        state.counts = [...state.counts,...data]
        const dateIds = new Set(currentDate)
        state.selectedCount = state.counts.filter(a=>dateIds.has(a.billDate))
        state.countDates = [...state.countDates,...billDate] 
        state.modal_Bill = false
    })
    builder.addCase(fetchCount.rejected, state => {
        state.modal_Bill = false
    })
    builder.addCase(fetchAdjust.pending, state => {
      state.modal_Bill = true
    })
    builder.addCase(fetchAdjust.fulfilled, (state, action) => {
      const { data, billDate, currentDate} = action.payload;
     
        state.adjusts = [...state.adjusts,...data]
        const dateIds = new Set(currentDate)
        state.selectedAdjust = state.adjusts.filter(a=>dateIds.has(a.billDate))
        state.adjustDates = [...state.adjustDates,...billDate] 
        state.modal_Bill = false
    })
    builder.addCase(fetchAdjust.rejected, state => {
        state.modal_Bill = false
    })
  }
})

export const { updateModal_Bill, updateDashBoard, updateBills, clearBill, updateImport,
  updateCount, updateAdjust
} = billSlice.actions

export default billSlice.reducer