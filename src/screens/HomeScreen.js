import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
} from "react-bootstrap";
import { colors, initialProfile } from "../configs";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signin } from '../redux/authSlice';
import { shopchampRestaurantAPI } from "../Utility/api";
import { Modal_Splash } from "../modal";
import { fetchNormalProfile } from "../redux/profileSlice";
import { toastSuccess } from "../Utility/function";
import { useTranslation } from 'react-i18next';
import { db } from "../db/firestore";

const { three, white } = colors;

function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state)=> state.auth)

  const [formData, setFormData] = useState({email:'',password:''})
  const [loading, setLoading] = useState(true);

  const handleFormChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;
    const newFormData = { ...formData };

    switch (fieldName) {
      default:
        newFormData[fieldName] = fieldValue; // dynamic object referent  (eg. equal 'obj.price')
    }

    setFormData(newFormData);
  };

  useEffect(()=>{
    if(currentUser?.user?.uid){
      handleProfile(currentUser?.user?.uid)
    }
  },[currentUser]);

  async function handleProfile(profileId){
    try {
      const profileDoc = await db.collection('profile').doc(profileId).get();
      const profileInfo = {
        ...initialProfile,
        ...profileDoc.data(),
        id:profileId,
      };
      dispatch(fetchNormalProfile(profileInfo));
      toastSuccess('เข้าสู่ระบบสำเร็จ')
    } catch (error) {
      alert(error)
    } finally {
      navigate("/franchiselist")
      setLoading(false)
    }
  }


  const checkRegisterUser = async() => {
      setLoading(true)
    await shopchampRestaurantAPI.get('/users/checkEmailRegister/'+formData?.email.trim()).then(objRes=>{
      const emailUserUid = objRes?.data?.uid;

      if(emailUserUid){
        dispatch(signin(formData))
      }else{ // Register other app, but not registed vender
        setLoading(false)
        alert(t('home.alertUser'));
      }  

    }).catch(err=>{ // Not found user
        setLoading(false)
        alert(t('home.alertUser'));
      console.log(err);
    });
}


  return (
    <div  style={styles.container} >
        <Modal_Splash show={loading} />
 
        <h6>Shopchamp Franchise</h6>
        <div style={styles.container2} >
                
                <img style={styles.img} src={'/logo512.png'} alt="My Image" />
                <br/>
               
                <h5  ><b>{t('home.welcome')}</b></h5>
                <Form.Floating className="mb-3" style={styles.container4} >
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      onChange={handleFormChange}
                    />
                    <label >{t('home.email')}</label>
                </Form.Floating>
                <Form.Floating className="mb-3" style={styles.container4} >
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleFormChange}
                    />
                    <label >{t('home.password')}</label>
                </Form.Floating>
                {!!formData.email && !!formData.password
                    ?<Button onClick={()=>{checkRegisterUser()}} variant="dark" style={styles.container3} >{t('home.login')}</Button>
                    :<Button onClick={()=>{alert(t('home.check'))}} variant="secondary" style={styles.container3} >{t('home.login')}</Button>
                }
        </div>
    </div>
  );
};

const styles = {
  container : {
    height:'100vh',display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:three,flexDirection:'column'
  },
  container2 : {
    backgroundColor:white,borderRadius:50,padding:20,paddingTop:5,display:'flex',flexDirection:'column',alignItems:'center',width:'25%',minWidth:'300px'
  },
  container3 : {
    width:'100%',borderRadius:20,marginTop:10,paddingTop:30,paddingBottom:30
  },
  container4 : {
    width:'100%'
  },
  container5 : {
    display:'flex',width:'50%',justifyContent:'flex-end',minWidth:320
  },
  img : {
    width: '200px', borderRadius:'1rem'
  }
}

export default HomeScreen;
