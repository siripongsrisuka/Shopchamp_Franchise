import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { franchiseBranchList } from '../api/franchiseApi';
import { apiErrorMessage } from '../api/posApi';
import { toastError } from '../Utility/function';


const initialState = {
    shops:[], // 
    modal_Shop:false,
    shopsFranchiseId:'', // แฟรนไชส์ของรายการที่โหลดอยู่ (กันเห็นสาขาของแฟรนไชส์ก่อนหน้า DI-04)

}

// DEV-0002 ก้อน 9f: `franchise.branchList` (census 287) · คำตอบมีแค่ id name tel dateTime ⇒ ไม่มีรายชื่อ/รหัสพนักงานวิ่งผ่าน network (FD-B2)
export const fetchShopFranchise = createAsyncThunk(
  'shop/fetchShopFranchise', async (franchiseId, { rejectWithValue }) => {
    try {
      const res = await franchiseBranchList(franchiseId);
      const shops = (res.branches || []).map((b) => ({ id: b.id, name: b.name, tel: b.tel, dateTime: b.dateTime || '' }));
      return { shops, franchiseId };
    } catch (error) {
      const message = apiErrorMessage(error, 'โหลดรายการสาขาไม่สำเร็จ');
      toastError(message);
      return rejectWithValue({ message });
    }
});


export const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    updateModal_Shop: state => {
      state.modal_Shop = !state.modal_Shop
    },
    addNormalShop: (state, action) => {
      state.shops.push(action.payload);
    },

  },
  extraReducers: builder => {
    builder.addCase(fetchShopFranchise.pending, state => {
      state.modal_Shop = true
    })
    builder.addCase(fetchShopFranchise.fulfilled, (state, action) => {
      state.shops = action.payload.shops
      state.shopsFranchiseId = action.payload.franchiseId
      state.modal_Shop = false
    })
    builder.addCase(fetchShopFranchise.rejected, state => {
      state.modal_Shop = false
    })
  }
})

export const { 
  updateModal_Shop,
  addNormalShop
} = shopSlice.actions

export default shopSlice.reducer