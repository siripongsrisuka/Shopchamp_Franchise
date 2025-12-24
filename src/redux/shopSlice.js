import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { formatTime } from '../Utility/function';


const initialState = {
    shops:[], // 
    modal_Shop:false,

}

export const fetchShopFranchise = createAsyncThunk(
  'shop/fetchShopFranchise', async (docId) => {
    let data = []
    const shopRef = db.collection('shop').where('franchiseId','==',docId)
    await shopRef.get().then((docs)=>{
      docs.forEach((doc)=>{
        const { cutOff, dateTime, ...rest } = doc.data();
        data.push({
          ...rest,
          id:doc.id,
          cutOff:formatTime(cutOff),
          dateTime:formatTime(dateTime),
        })
      })
      
    })
    return data;
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
      state.shops = action.payload
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