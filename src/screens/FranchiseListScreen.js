import React, { useEffect, useState } from "react";
import {
  Button,
  Table
} from "react-bootstrap";
import { useSelector, useDispatch, batch } from "react-redux";
import { colors, initialAdmin, initialAlert, initialFranchise } from "../configs";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Modal_Alert, Modal_OneInput, Modal_Splash } from "../modal";
import { updateCurrentFranchise } from "../redux/authSlice";
import { db } from "../db/firestore";
import { fetchNormalFranchise } from "../redux/franchiseSlice";
import { OneButton, SearchControl } from "../components";
import { formatTime, searchFilterFunction } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { logout } from "../redux/authSlice";

const { white } = colors;

function FranchiseListScreen() {
    const { currentFranchiseId } = useSelector((state)=> state.auth)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { profile } = useSelector((state)=> state.profile);
    const { id:profileId, name, tel } = profile
    const [franchise_Modal, setFranchise_Modal] = useState(false)
    const [loading, setLoading] = useState(true);
    const [ports, setPorts] = useState([]);
    const [franchiseName, setFranchiseName] = useState('');
    const [search, setSearch] = useState('');
    const [display, setDisplay] = useState([]);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant } = alert_Modal;

 
    const IsAdmin = initialAdmin.has(profileId);
    useEffect(()=>{
      batch(()=>{
        if(IsAdmin){ // ถ้าเป็น admin เข้าถึงทุก franchise
          fetchAdminPort()
        } else {
          fetchNormalPort()
        }
        // dispatch(clearBill())
        // dispatch(clearBom())
        // dispatch(clearFranchise())
        // dispatch(clearProduct())
        // dispatch(clearShop())
      })

    },[]);

    useEffect(()=>{
        let arr = ports
        if(search){
          arr = searchFilterFunction(ports,search,'name')
        }
        setDisplay(arr)
    },[search,ports])

    async function fetchNormalPort() {
      try {
        const snapshot = await db.collection('franchise')
          .where('humanResource', 'array-contains', profileId)
          .get();
    
        if (snapshot.docs.length===0) {
          setPorts([]);
          setFranchise_Modal(true);
          return;
        }
    
        const arr = snapshot.docs.map(doc=>{
          const { timestamp, ...rest } = {...initialFranchise,...doc.data()}
          return {
            timestamp:timestamp.toDate(),
            ...rest,
            id:doc.id
          }
        });
    
        setPorts(normalSort('timestamp',arr));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false)
      }
    }
    async function fetchAdminPort(){
        try {
            const snapshot = await db.collection('franchise')
            // .where('humanResource', 'array-contains', profileId)
            .get();
        
            if (snapshot.docs.length===0) {
            setPorts([]);
            setFranchise_Modal(true);
            return;
            }
        
            const arr = snapshot.docs.map(doc=>{
            const { timestamp, ...rest } = {...initialFranchise,...doc.data()}
            return {
                timestamp:timestamp.toDate(),
                ...rest,
                id:doc.id
            }
            });
        
            setPorts(normalSort('timestamp',arr));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false)
        }
    }




    async function backToShop(payload){
        setLoading(true)

        try {
          let franchiseData = payload;
          if(IsAdmin){
            const franchiseDoc = await db.collection('franchise').doc(payload.id).get();
            franchiseData = {
              ...franchiseDoc.data(),
              id:payload.id,
              timestamp:formatTime(franchiseDoc.data().timestamp)
            }
          }
          const franchiseId = payload.id;
  
  
          batch(()=>{
            dispatch(fetchNormalFranchise(franchiseData));
            dispatch(updateCurrentFranchise(franchiseId));
          })
          navigate('/franchisor')
        } catch (error) {
          alert(error)
        } finally {
          setLoading(false)
        }

          
      }

  


  async function submit(){
        if(!franchiseName){
        return alert('กรุณาตั้งชื่อแฟรนไชส์')
        };
        const timestamp = new Date();
        setFranchise_Modal(false);
        setLoading(true);

        const payload = {
            ...initialFranchise,
            timestamp,
            humanResource:[],
            humanRight:[],
            name:franchiseName
        };

        try {
            const franchiseRef = db.collection('franchise').doc();
            await franchiseRef.set(payload);
            
            dispatch(fetchNormalFranchise({...payload,id:franchiseRef.id}));
            dispatch(updateCurrentFranchise(franchiseRef.id));
            navigate('/franchisor');
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
  };

  useEffect(()=>{ // ถ้ามี port เดียว สามารถ ข้าม shot ไปเลย
    const findPort = ports.find(a=>a.id===currentFranchiseId)
    if(findPort){
      backToShop(findPort)
    }
  },[ports,currentFranchiseId])


  function handleSubmit(){

    setFranchise_Modal(false)
  };

  function exit(){
    dispatch(logout()).then(()=>{
      navigate('/')
    })
  };

  return (
    <div style={styles.container} >
      <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
        <Modal_Splash show={loading} />
        <Modal_OneInput
            show={franchise_Modal}
            header={`ตั้งชื่อแฟรนไชส์ของคุณ เพื่อเริ่มต้นใช้งาน`}
            onHide={handleSubmit}
            value={franchiseName}
            onClick={submit}
            placeholder='ตั้งชื่อ'
            onChange={setFranchiseName}
        />
        <div style={styles.container2} >
            <h1>Port Franchise</h1>
        </div>
        <React.Fragment>
          <div style={styles.container6} >
          &emsp;<SearchControl {...{ placeholder:'ค้นหาด้วยชื่อแฟรนไชส์', search, setSearch }} />&emsp;
              <OneButton {...{ text:'เพิ่มแฟรนไชส์', variant:'warning', submit:()=>{setFranchise_Modal(true)} }} />&emsp;
                <Button onClick={()=>{
                  setAlert_Modal({
                    status:true,
                    content:`ยืนยันการออกจากระบบ`,
                    onClick:()=>{exit();setAlert_Modal(initialAlert)},
                    variant:'danger'
                  })
                }} variant="light" ><i class="bi bi-box-arrow-left"></i></Button>&emsp;
          </div>
          <br/>
          <Table striped bordered hover responsive  variant="light" style={styles.container7}  >
              <thead  >
                <tr>
                    <th style={styles.container3} >No.</th>
                    <th style={styles.container4} >แฟรนไชส์</th>
                    <th style={styles.container8} >วันที่สร้าง</th>
                    <th style={styles.container8} >จัดการ</th>
                </tr>
              </thead>
              <tbody  >
              {display.map((item, index) => {
                  const { id, name, timestamp } = item;
                  return <tr  key={id} >
                              <td style={styles.container5} >{index+1}.</td>
                              <td >{name}</td>
                              <td tyle={styles.container5} >{stringDateTimeReceipt(timestamp)}</td>
                              <td style={styles.container5} >
                                <OneButton {...{ text:'เข้าสู่ระบบ', variant:'success', submit:()=>{backToShop(item)} }} />
                              </td>
                          </tr>
              })}
              </tbody>
          </Table>
    </React.Fragment>
    </div>
  );
};

const styles = {
    container : {
      backgroundColor:white,height:'100vh'
    },
    container2 : {
      backgroundColor:white,display:'flex',justifyContent:'center'
    },
    container3 : {
      width:'10%', textAlign:'center'
    },
    container4 : {
      width:'30%', minWidth:'250px', textAlign:'center'
    },
    container5 : {
      textAlign:'center'
    },
    container6 : {
      display:'flex'
    },
    container7 : {
      marginLeft:'1rem'
    },
    container8 : {
      width:'10%', minWidth:'180px', textAlign:'center'
    },

}

export default FranchiseListScreen;
