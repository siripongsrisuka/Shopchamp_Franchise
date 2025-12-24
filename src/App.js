import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route,  } from 'react-router-dom';

import { 
  HomeScreen,
  FranchiseListScreen,
  FranchisorScreen,
  DashboardScreen,
  BranchScreen
} from './screens';
import { useSelector, useDispatch } from 'react-redux';
import { login } from './redux/authSlice';
import { firebaseAuth } from './db/firestore';
import { useTranslation } from 'react-i18next';
import 'rsuite/dist/rsuite.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  const { i18n } = useTranslation();
  const { currentUser } = useSelector( state => state.auth);
  const { language } = useSelector( state => state.device);
  const dispatch = useDispatch();

  
  useEffect(() => {
    i18n.changeLanguage(language.brev)
    let unsubscribe;
    async function checkAuth (){
      unsubscribe = await firebaseAuth.onAuthStateChanged(user => {
        if(!!user?.uid){ // ไม่มี 
          dispatch(login(user));
        } else {
          let obj =  firebaseAuth.signInWithEmailAndPassword('anonymoususer@gmail.com', '123123')
          // let obj =  firebaseAuth.signInWithEmailAndPassword('siripongsrisukha@gmail.com', '123456')
          dispatch(login(obj));
        }
      })
    }

    if (!currentUser?.user) {
      checkAuth()
    }
  },[]);

  // useEffect(() => {
    
  //   // alert('checkAuth')
  //   let unsubscribe;
  //   async function checkAuth (){
  //     unsubscribe = await firebaseAuth.onAuthStateChanged(user => {
  //       if(!!user?.uid){ // ไม่มี 
  //         dispatch(login(user));
  //       } else {
  //         let obj =  firebaseAuth.signInWithEmailAndPassword('anonymoususer@gmail.com', '123123')
  //         // let obj =  firebaseAuth.signInWithEmailAndPassword('siripongsrisukha@gmail.com', '123456')
  //         dispatch(login(obj));
  //       }
  //     })
  //   }

  //   if (currentUser == null) {
  //     checkAuth()
  //     // dispatch(logout())
  //   }
  //   if (currentUser !== null) {

  //   }

  //   return () => {
  //     // unsubscribe;   // error with close listener for prevent memory leak , will edit later !!!
  //   }
  // },[currentUser]);


  return (
    <Router>
      <div>
          <Routes>
              <Route path='/' element={<HomeScreen/>} />
              <Route path='franchiseList' element={<FranchiseListScreen/>} />
              <Route path='franchisor' element={<FranchisorScreen/>} >
                  <Route index  element={<DashboardScreen/>} />
                  <Route path='branch'  element={<BranchScreen/>} />
              </Route>

          </Routes>
      </div>
    </Router>
  );
}

export default () => {
  return  <Suspense fallback="...loading">
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </Suspense>
};