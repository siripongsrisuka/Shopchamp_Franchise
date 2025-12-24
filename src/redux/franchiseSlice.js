import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { initialFranchise } from '../configs';

const initialState = {
    franchise:initialFranchise, // 
    modal_Franchise:false,
};

export const fetchFranchise = createAsyncThunk(
  'franchise/fetchFranchise', async (token) => {
    let data = {}
    const franchiseRef = db.collection('franchise').doc(token);
    await franchiseRef.get().then((doc)=>{
      data = {...doc.data(),id:doc.id}
    })
    return data
});

export const franchiseSlice = createSlice({
  name: 'franchise',
  initialState,
  reducers: {
    updateNormalFieldFranchise: (state, action) => {
      Object.assign(state.franchise,action.payload)
    },
    clearFranchise: state => {
      state.franchise = initialFranchise
    },
    fetchNormalFranchise: (state,action) => {
      state.franchise =  action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchFranchise.pending, state => {
        state.modal_Franchise = true
    })
    builder.addCase(fetchFranchise.fulfilled, (state, action) => {
        state.franchise = action.payload
        state.modal_Franchise = false
    })
    builder.addCase(fetchFranchise.rejected, state => {
        state.modal_Franchise = false
    })
  }
})

export const { 
  fetchNormalFranchise, 
  clearFranchise, 
  updateNormalFieldFranchise
} = franchiseSlice.actions

export default franchiseSlice.reducer