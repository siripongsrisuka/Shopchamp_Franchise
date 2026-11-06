import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Table
} from "react-bootstrap";
import { useSelector, useDispatch, batch } from "react-redux";
import { colors, initialAlert, initialFranchise } from "../configs";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Modal_Alert, Modal_OneInput, Modal_Splash } from "../modal";
import { updateCurrentFranchise } from "../redux/authSlice";
import { fetchNormalFranchise } from "../redux/franchiseSlice";
import { franchiseList, franchiseCreate, franchiseGet } from "../api/franchiseApi";
import { apiErrorMessage, newRequestId } from "../api/posApi";
import { clearBill } from "../redux/billSlice";
import { clearWarehouse } from "../redux/warehouseSlice";
import { OneButton, SearchControl } from "../components";
import { searchFilterFunction, toastError } from "../Utility/function";
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

 
    // DEV-0002 ก้อน 9f: ทีมงานหรือไม่ = server ตัดสิน (`franchise.list` คืน byAdmin) · ไม่ใช้ชุด uid ที่ฝังในเว็บแล้ว
    const [createUUID, setCreateUUID] = useState(newRequestId()); // รหัสกันกดซ้ำของการสร้าง 1 ครั้ง (FL-40)
    useEffect(()=>{
      fetchPorts()
    },[]);

    useEffect(()=>{
        let arr = ports
        if(search){
          arr = searchFilterFunction(ports,search,'name')
        }
        setDisplay(arr)
    },[search,ports])

    // census 272 273: `franchise.list` (สมาชิก = ของฉัน · ทีมงาน = ทั้งหมด)
    async function fetchPorts() {
      try {
        const res = await franchiseList();
        const arr = (res.franchises || []).map(({ timestamp, ...rest })=>({
          ...rest,
          timestamp: timestamp ? new Date(timestamp) : null,
        }));
        if (arr.length===0) {
          setPorts([]);
          setFranchise_Modal(true);
          return;
        }
        setPorts(normalSort('timestamp',arr));
      } catch (error) {
        toastError(apiErrorMessage(error, 'โหลดรายการแฟรนไชส์ไม่สำเร็จ'));
      } finally {
        setLoading(false)
      }
    }

    // census 274: เปิดแฟรนไชส์ = `franchise.get` ทุกคน (รายการมีแค่ชื่อ/รูป ไม่มี doc ทั้งก้อน)
    async function backToShop(payload){
        setLoading(true)
        try {
          const res = await franchiseGet(payload.id);
          const franchiseData = { ...initialFranchise, ...res.franchise, id: payload.id };
          batch(()=>{
            if (currentFranchiseId !== payload.id) {
              dispatch(clearBill());
              dispatch(clearWarehouse());
            }
            dispatch(fetchNormalFranchise(franchiseData));
            dispatch(updateCurrentFranchise(payload.id));
          })
          navigate('/franchisor')
        } catch (error) {
          dispatch(updateCurrentFranchise(''));
          toastError(apiErrorMessage(error, 'เปิดแฟรนไชส์ไม่สำเร็จ'))
        } finally {
          setLoading(false)
        }
      }

  // census 275: `franchise.create` · ผู้สร้างเป็นสมาชิกสิทธิ์ครบ (DI-45) · ทีมงานสร้าง = ยังไม่มีสมาชิก ⇒ พาไปจอกำหนดสิทธิ์ (คำถามข้อ 7)
  async function submit(){
        const name = franchiseName.trim();
        if(!name){
        return alert('กรุณาตั้งชื่อแฟรนไชส์')
        };
        setFranchise_Modal(false);
        setLoading(true);
        try {
            const res = await franchiseCreate({ franchiseUUID: createUUID, name });
            setCreateUUID(newRequestId());
            setFranchiseName('');
            batch(()=>{
              dispatch(clearBill());
              dispatch(clearWarehouse());
              dispatch(fetchNormalFranchise({ ...initialFranchise, name, id: res.franchiseId }));
              dispatch(updateCurrentFranchise(res.franchiseId));
            })
            navigate(res.byAdmin ? '/franchisor/staff' : '/franchisor');
        } catch (error) {
            toastError(apiErrorMessage(error, 'สร้างแฟรนไชส์ไม่สำเร็จ'));
        } finally {
            setLoading(false);
        }
  };

  // เปิดค้างแฟรนไชส์ไหนไว้ = เข้าให้เลย · ครั้งเดียวต่อการโหลดรายการ (เดิมยิงซ้ำเมื่อ currentFranchiseId เปลี่ยนหลังกดเข้า)
  const autoEntered = useRef(false);
  useEffect(()=>{ // ถ้ามี port เดียว สามารถ ข้าม shot ไปเลย
    if(autoEntered.current || ports.length===0) return;
    autoEntered.current = true;
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
                }} variant="light" data-testid="franchise-list-logout" aria-label="ออกจากระบบ" ><i className="bi bi-box-arrow-left"></i></Button>&emsp;
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
                              <td tyle={styles.container5} >{timestamp ? stringDateTimeReceipt(timestamp) : '-'}</td>
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
      backgroundColor:'var(--sc-bg)',minHeight:'100vh'
    },
    container2 : {
      backgroundColor:'var(--sc-bg)',display:'flex',justifyContent:'center'
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
