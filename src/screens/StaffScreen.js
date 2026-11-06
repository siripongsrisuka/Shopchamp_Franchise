import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { Modal_FindHuman, Modal_Human, Modal_Loading } from "../modal";
import { fetchFranchise } from "../redux/franchiseSlice";
import { OneButton } from "../components";
import { chainStoreFranchise } from "../configs";
import { franchiseStaffSave, rightsOf } from "../api/franchiseApi";
import { apiErrorMessage, serverErrorCode } from "../api/posApi";
import { toastError, toastSuccess } from "../Utility/function";

const initialHuman = {
    id:'',
    name:'',
    tel:'',
    rights:[],
};

function StaffScreen() {
    const dispatch = useDispatch();
    const { franchise: { id:franchiseId, humanRight, type } } = useSelector((state)=> state.franchise);
   
    const [human_Modal, setHuman_Modal] = useState(false);
    const [current, setCurrent] = useState(initialHuman);
    const [newHuman_Modal, setNewHuman_Modal] = useState(false);
    const [loading, setLoading] = useState(false);

    const sideBar = useMemo(()=>{

      return chainStoreFranchise.filter(a=>!a.label)
    },[type,chainStoreFranchise])
 
    // DEV-0002 ก้อน 9f: `franchise.staffSave` ทีละคน (census 276 277) · เดิมเขียน humanRight/humanResource ทั้ง array จากค่าเก่า (DI-37 · SF-07)
    //   คนใหม่ = add · มีอยู่แล้ว = update · ลบ = remove · ชื่อ/เบอร์ server คัดจาก profile ในฐาน (SF-02)
    //   สำเร็จหรือ 409 = โหลด doc แฟรนไชส์ใหม่ (คนอื่นอาจแก้ไปก่อน)
    async function manageHuman(){
        setHuman_Modal(false)
        const rightIds = new Set(sideBar.map(a=>a.id))
        const { id, rights } = current;
        const exists = humanRight.some(a=>a.id===id);
        setLoading(true);
        try {
          const res = await franchiseStaffSave({ franchiseId, op: exists ? 'update' : 'add', staffUid: id, rights: rightsOf(rights.filter(a=>rightIds.has(a))) });
          toastSuccess(res.unchanged || res.duplicate ? 'สิทธิ์เป็นแบบนี้อยู่แล้ว' : 'บันทึกสิทธิ์ สำเร็จ');
          dispatch(fetchFranchise(franchiseId));
        } catch (error) {
          toastError(apiErrorMessage(error, 'บันทึกสิทธิ์ไม่สำเร็จ'));
          if (serverErrorCode(error) === 'staff_exists') dispatch(fetchFranchise(franchiseId));
        } finally {
          setLoading(false);
          setCurrent(initialHuman);
        }
    }

    // 200%
    async function deleteHuman(id){
        setHuman_Modal(false);
        setLoading(true);
        try {
          await franchiseStaffSave({ franchiseId, op: 'remove', staffUid: id });
          toastSuccess('ลบบุคลากร สำเร็จ');
          dispatch(fetchFranchise(franchiseId));
        } catch (error) {
          toastError(apiErrorMessage(error, 'ลบบุคลากรไม่สำเร็จ'));
        } finally {
          setLoading(false);
          setCurrent(initialHuman)
        }
    };

    function openHuman(){
      setNewHuman_Modal(false)
      // คนที่อยู่ในรายชื่อแล้ว = เปิดสิทธิ์เดิมของเขา (เดิมเริ่มจากว่าง แล้วบันทึกทับสิทธิ์เดิม SF-32)
      const found = humanRight.find(a=>a.id===current.id);
      if (found) setCurrent({ ...initialHuman, ...found });
      setHuman_Modal(true)
    };

  return (
    <div  style={styles.container}  >
        <Modal_Loading show={loading} />
        <Modal_FindHuman
            show={newHuman_Modal}
            onHide={()=>{setNewHuman_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            submit={openHuman}
        />
        <Modal_Human
            show={human_Modal}
            onHide={()=>{setHuman_Modal(false);setCurrent(initialHuman)}}
            current={current}
            setCurrent={setCurrent}
            deleteItem={deleteHuman}
            submit={manageHuman}
            sideBar={sideBar}
        />
      <h1>บุคลากร</h1>
        <OneButton {...{ text:'+ เพิ่มบุคลากร', submit:()=>{setNewHuman_Modal(true)} }} />
        <br/>
        <br/>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container3}>No.</th>
                <th style={styles.container4}>ชื่อ</th>
                <th style={styles.container4}>เบอร์โทร</th>
                <th style={styles.container4}>อีเมล</th>
                <th style={styles.container4}>สิทธิ์</th>
                <th style={styles.container4}>จัดการ</th>
            </tr>
            </thead>
            <tbody  >
            {humanRight.map((item, index) => {
                const { id, name, tel, rights, email } = item;
                return <tr  key={id} >
                            <td style={styles.container6}>{index+1}.</td>
                            <td >{name}</td>
                            <td style={styles.container6}>{tel}</td>
                            <td >{email}</td>
                            <td style={styles.container6}>{rights.length}</td>
                            <td style={styles.container6}>
                                <OneButton {...{ text:'จัดการ', submit:()=>{setHuman_Modal(true);setCurrent(item)}, variant:'warning' }} />
                            </td>
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
  );
}

const styles = {
  container : {
      minHeight:'100vh',
      scrollY:'auto'
  },

  container3 : {
      width: '5%', textAlign:'center', minWidth:'50px'
  },
  container4 : {
      width: '15%', textAlign:'center', minWidth:'180px'
  },

  container6 : {
      textAlign:'center'
  }
};

export default StaffScreen;