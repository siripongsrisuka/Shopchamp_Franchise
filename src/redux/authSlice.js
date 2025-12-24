import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { firebaseAuth } from "../db/firestore";

const initialState = {
    currentUser:null,
    Loading_Auth:true,
    token:null,
    path:'',
    currentShopId:'',
    franchiseDisplay:false,
    currentFranchiseId:''
};

export const signup = createAsyncThunk(
  'auth/signup',
  async ({email,password}) => {
    let user ={}
    try{
      user =  await firebaseAuth.createUserWithEmailAndPassword(email.trim(), password);
      
    }catch(err){
      console.log("Error Code:"+err?.code+"\nMessage:"+err?.message)
        switch(err?.code){
            case 'auth/email-already-in-use':
                alert('อีเมลนี้ใช้สมัครบริการแล้ว กรุณาใช้อีเมลอื่น')
                break;
            case 'auth/invalid-email':
                alert('อีเมลนี้ไม่พบในเครื่อข่ายอินเตอร์เน็ต กรุณาใช้อีเมลอื่น')
                break;
            case 'auth/operation-not-allowed':
                alert('ผู้ให้บริการปิดการทำงานของวิธีล็อกอินนี้')
                break;
            case 'auth/weak-password':
                alert('โปรดกรอกรหัสผ่านอย่างน้อย 6 หลัก')
                break;
        }
    }
    
    return user
  }
);

export const signin = createAsyncThunk( 
  'auth/signin',
  async ({email,password}) => {

    console.log("email"+email+"password"+password)
    let user = {}
    try{
      user = await firebaseAuth.signInWithEmailAndPassword(email.trim(), password);
      // user = await firebaseAuth.signInWithEmailAndPassword('siripongsrisukha@gmail.com', '123456');
      // await onesignalHandleSignInUser(objRes.user.uid);
      // dispatch({type:'signIn',payload:{token:objRes.user.uid,currentUser:objRes.user}});

      // console.log('authSlice signin:'+JSON.stringify(user,null,4))
      
    }catch(err){
        console.log("Error Code:"+err.code+"\nMessage:"+err.message)
        switch(err.code){
            case 'auth/invalid-email':
                alert('อีเมลนี้ไม่พบในเครื่อข่ายอินเตอร์เน็ต')
                break;
            case 'auth/user-disabled':
                alert('บัญชีผู้ใช้งานนี้ถูกระงับ')
                break;
            case 'auth/user-not-found':
                alert('ไม่พบบัญชีผู้ใช้งานในระบบ')
                break;
            case 'auth/wrong-password': //เกิดเฉพาะเมื่ออะไรที่ใช้อีเมลล์ซ้ำ
                alert('รหัสผ่านผิด กรุณาลองใหม่อีกครั้ง')
                break;
        }
    }

    return user
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    return firebaseAuth.signOut();
  }
);

export const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers: {
      updateCurrentFranchise: (state, action) => {
        state.currentFranchiseId = action.payload;
      },
      login: (state, action) => {
        state.currentUser = action.payload;
      },
        addShopId: (state, action) => {
          const { currentShopId, franchiseDisplay } = action.payload
        state.currentShopId = currentShopId
        state.franchiseDisplay = franchiseDisplay
      },
    },
    extraReducers: (builder) => {
      builder.addCase(signin.pending, state => {
        state.Loading_Auth = true
      })
      builder.addCase(signin.fulfilled, (state, action) => {
        state.Loading_Auth = false
        state.currentUser = action.payload
      })
      builder.addCase(signin.rejected, state => {
        state.Loading_Auth = false
      })
      builder.addCase(logout.fulfilled, (state, action) => {
        state.currentUser = null;
        // state.Loading_Auth = true;
        state.token = null;
        state.path = '';
        state.currentShopId = '';
      })
    }
})


export const  { login, addShopId, updateCurrentFranchise } = authSlice.actions;
export default authSlice.reducer;