import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { initialProfile } from '../configs';
import { postApi, ENDPOINTS } from '../api/posApi';

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

// แก้โปรไฟล์ → API profile.manage op update (ใบ DEV-0002 · สัญญา profile.manage.yaml)
//   สัญญารับเฉพาะ name tel email imageId wallPaper ของตัวเอง (uid จาก token) · ช่องอื่นไม่ส่ง
//   ยังไม่มีจอเรียก 2 thunk นี้
const PROFILE_FIELDS = ['name', 'tel', 'email', 'imageId', 'wallPaper'];
const pickProfileFields = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => PROFILE_FIELDS.includes(k)));

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profile) => {
    await postApi(ENDPOINTS.profileManage, { op: 'update', ...pickProfileFields(profile) })
    return profile
  }
);

export const updateFieldProfile = createAsyncThunk(
  'profile/updateFieldProfile', async ({doc,field}) => {
  await postApi(ENDPOINTS.profileManage, { op: 'update', ...pickProfileFields(field) })
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