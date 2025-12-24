import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    language:{ id:1, name:'ไทย', brev:'th', image:'🇹🇭'},
    modal_Language:false,

}


export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    updateLanguage: (state,action) => {
      state.language = action.payload
    },

  },
  extraReducers: builder => {
   
  }
})

export const { updateLanguage,
} = deviceSlice.actions

export default deviceSlice.reducer