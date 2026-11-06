import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { formatTime, toastError } from '../Utility/function';
import { reverseSort } from '../Utility/sort';
import { franchiseLinkList } from '../api/franchiseApi';
import { apiErrorMessage } from '../api/posApi';

const initialState = {
    stockLinks:[],
    currentProducts:[],
    modal_StockLinks:false,
    refProduct:{},

}

// DEV-0002 ก้อน 9f: `franchise.linkList` (census 283) · ตัวคูณเป็นตัวเลข เรียงจาก server (SL-27)
//   thunk ลบ/เพิ่ม/แก้ตรงเดิม 3 ตัว (census 284 285 286) ไม่มีจอเรียก ⇒ เอาออก · จอเขียนผ่าน `franchise.linkSave` `linkDelete`
export const fetchStockLink = createAsyncThunk(
  'stockLink/fetchStockLink',
  async (franchiseId, { rejectWithValue }) => {
    try {
      const res = await franchiseLinkList(franchiseId);
      const rows = (res.links || []).map(({ timestamp, ...rest }) => ({ ...rest, timestamp: formatTime(timestamp) }));
      return reverseSort('timestamp', rows);
    } catch (error) {
      const message = apiErrorMessage(error, 'โหลดกลุ่มผูกสต๊อกไม่สำเร็จ');
      toastError(message);
      return rejectWithValue({ message });
    }
  }
);

export const stockLink = createSlice({
  name: 'stockLink',
  initialState,
  reducers: {
    updateNormalLink: (state, action) => {
      let item = state.stockLinks.find(a=>a.id === action.payload.id)
      if (item) Object.assign(item,action.payload)
    },
    deleteNormalLink: (state, action) => {
      const index = state.stockLinks.findIndex(a => a.id === action.payload);
      if (index >= 0) state.stockLinks.splice(index, 1); // Directly remove the item (Immer handles immutability)
    },
    updateStockDisplay: (state, action) => {
      const updatedIds = action.payload;
      state.stocks = state.stocks.map(item =>
        updatedIds.includes(item.id)
          ? { ...item, memo: item.memo + 1 }
          : item
      );
    },
    addProduct: (state, action) => {
        const linkIds = new Set([...state.stockLinks.flatMap(a=>a.stockLink).map(b=>b.id),...state.currentProducts.map(a=>a.id)])
        if(linkIds.has(action.payload.id)){
          alert('ตรวจพบรายการซ้ำ')
        } else {
          state.currentProducts.push(action.payload)
        }
    },
    deleteProduct: (state, action) => {
        state.currentProducts = state.currentProducts.filter(a=>a.id!==action.payload)
    },
    refProduct: (state, action) => {
        state.currentProducts = state.currentProducts.map(a=>{
            return a.id === action.payload
                ?{...a,linkMultiply:1}
                :{...a,linkMultiply:''}
        })
        state.refProduct = state.currentProducts.find(a=>a.linkMultiply===1)
    },
    updateProduct: (state, action) => {
        const { id, qty } = action.payload;
        let item = state.currentProducts.find(a=>a.id === id)
        item.linkMultiply = qty
    },
    addNormalStockLink: (state, action) => {
      state.stockLinks = [...state.stockLinks.filter(a=>a.id!==action.payload.id),action.payload]
      state.currentProducts = []
      state.refProduct = {}
  },
  },
  extraReducers: builder => {
    builder.addCase(fetchStockLink.pending, state => {
      state.modal_StockLinks = true
    })
    builder.addCase(fetchStockLink.fulfilled, (state, action) => {
      state.stockLinks = action.payload;
      state.modal_StockLinks = false
    })
    builder.addCase(fetchStockLink.rejected, state => {
      state.modal_StockLinks = false
    })
  }
})

export const { updateStockDisplay, addProduct, deleteProduct, refProduct, updateProduct, 
  addNormalStockLink, deleteNormalLink, updateNormalLink } = stockLink.actions

export default stockLink.reducer