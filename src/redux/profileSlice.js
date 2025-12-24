import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { initialProfile } from '../configs';

const initialState = {
    profile:initialProfile, // 
    modal_Profile:false,
}

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile', async (token) => {
    let data = {}
    await db.collection('profile').doc(token).get().then((doc)=>{
      const { timestamp } = doc.data();
      data =  {...doc.data(),timestamp:timestamp.toDate(),id:doc.id}
    })
    return data;
});

// updateProfile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profile) => {
    await db.collection('profile').doc(profile.id).update(profile)
    return profile
  }
);

export const updateFieldProfile = createAsyncThunk(
  'profile/updateFieldProfile', async ({doc,field}) => {
  await db.collection('profile').doc(doc).update(field)
  return field;
});

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updatemodal_Profile: state => {
      state.modal_Profile = !state.modal_Profile
    },
    fetchNormalProfile: (state,action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchProfile.pending, state => {
      state.modal_Profile = true
    })
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.profile = action.payload
      state.modal_Profile = false
    })
    builder.addCase(fetchProfile.rejected, state => {
      state.modal_Profile = false
    })
    builder.addCase(updateProfile.pending, state => {
      state.modal_Profile = true
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.profile = action.payload
      state.modal_Profile = false
    })
    builder.addCase(updateProfile.rejected, state => {
      state.modal_Profile = false
    })
    builder.addCase(updateFieldProfile.pending, state => {
      state.modal_Profile = true
    })
    builder.addCase(updateFieldProfile.fulfilled, (state, action) => {
        state.profile = {...state.profile,...action.payload}
        state.modal_Profile = false
    })
    builder.addCase(updateFieldProfile.rejected, state => {
    state.modal_Profile = false
    })
  }
})

export const { 
  fetchNormalProfile
} = profileSlice.actions

export default profileSlice.reducer