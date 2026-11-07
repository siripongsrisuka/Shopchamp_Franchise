import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialFranchise } from '../configs';
import { franchiseGet, isReadOnlyAccess } from '../api/franchiseApi';
import { apiErrorMessage, serverErrorCode } from '../api/posApi';

// DEV-0002 ก้อน 9f: อ่านผ่าน `franchise.get` (census 289) · ไม่อ่าน Firestore ตรง
//   access = สิทธิ์ของผู้เรียกที่ server ตัดสิน ({rights, byAdmin}) · แทนชุด uid ทีมงานที่เคยฝังในเว็บ (configs/initialAdmin.js)
//   ❌ ไม่ persist access: เปิดจอใหม่ถาม server ทุกครั้ง
const initialState = {
    franchise:initialFranchise, //
    access:null, // null = ยังไม่รู้ · {rights:[], byAdmin?:true} (root) · {rights:[], watcher:true, readOnly:true} (watcher)
    accessError:'', // ข้อความเมื่อ franchise.get ไม่ผ่าน (403 ไม่ใช่สมาชิก · 404 ยังไม่เปิดใช้งาน)
    accessErrorCode:'',
    modal_Franchise:false,
};

export const fetchFranchise = createAsyncThunk(
  'franchise/fetchFranchise', async (franchiseId, { rejectWithValue }) => {
    try {
      const res = await franchiseGet(franchiseId);
      return { franchise: { ...initialFranchise, ...res.franchise, id: res.franchise.id || franchiseId }, access: res.access || { rights: [] } };
    } catch (error) {
      return rejectWithValue({ message: apiErrorMessage(error, 'เปิดแฟรนไชส์ไม่สำเร็จ'), code: serverErrorCode(error) });
    }
});

/** selector · แฟรนไชส์ที่เปิดอยู่เป็นโหมดดูอย่างเดียว (watcher) ไหม · ยังไม่รู้ access = ไม่ (ปุ่มเขียนยังผูกสิทธิ์/server ปัดซ้ำ) */
export const selectReadOnly = (state) => isReadOnlyAccess(state && state.franchise && state.franchise.access);

export const franchiseSlice = createSlice({
  name: 'franchise',
  initialState,
  reducers: {
    updateNormalFieldFranchise: (state, action) => {
      Object.assign(state.franchise,action.payload)
    },
    clearFranchise: state => {
      state.franchise = initialFranchise
      state.access = null
      state.accessError = ''
      state.accessErrorCode = ''
    },
    fetchNormalFranchise: (state,action) => {
      state.franchise =  action.payload
      state.access = null
      state.accessError = ''
      state.accessErrorCode = ''
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchFranchise.pending, state => {
        state.modal_Franchise = true
    })
    builder.addCase(fetchFranchise.fulfilled, (state, action) => {
        state.franchise = action.payload.franchise
        state.access = action.payload.access
        state.accessError = ''
        state.accessErrorCode = ''
        state.modal_Franchise = false
    })
    builder.addCase(fetchFranchise.rejected, (state, action) => {
        state.modal_Franchise = false
        state.accessError = (action.payload && action.payload.message) || 'เปิดแฟรนไชส์ไม่สำเร็จ'
        state.accessErrorCode = (action.payload && action.payload.code) || ''
    })
  }
})

export const {
  fetchNormalFranchise,
  clearFranchise,
  updateNormalFieldFranchise
} = franchiseSlice.actions

export default franchiseSlice.reducer
