import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { addNormalStockLink, deleteNormalLink, fetchStockLink, updateNormalLink } from "../redux/stockLinkSlice";
import { OneButton, SearchControl } from '../components'
import { searchFilterFunction, toastError, toastSuccess } from "../Utility/function";
import { franchiseLinkSave, franchiseLinkDelete, linkSaveBody } from "../api/franchiseApi";
import { apiErrorMessage, newRequestId } from "../api/posApi";
import { Modal_Loading, Modal_StockLink } from "../modal";
import { fetchWarehouse } from "../redux/warehouseSlice";

const initialStockLink = {
    shopId:'',
    stockGroupName:'',
    stockLink:[
        // {
        //     barcode:'',
        //     id:'',
        //     imageId:'',
        //     linkMultiply:1,
        //     name:'',
        //     unit:'',
        // }
    ],
    timestamp:new Date(),
    upgrade:true,
};

function StockLinkScreen() {
    const dispatch = useDispatch();
    const { stockLinks } = useSelector((state)=> state.stockLink);
    const { franchise : { id:franchiseId } } = useSelector((state)=> state.franchise);
    const [stockLink_Modal, setStockLink_Modal] = useState(false);
    const [current, setCurrent] = useState(initialStockLink);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [linkUUID, setLinkUUID] = useState(newRequestId()); // รหัสกันกดซ้ำของกลุ่มใหม่ 1 กลุ่ม (SL-42)

    useEffect(()=>{
        let filtered = stockLinks;
        if(search){
            filtered = searchFilterFunction(stockLinks,search,'stockGroupName'); // เดิมสลับลำดับ argument (พิมพ์ค้นแล้วจอพัง)
        }
        setCurrentDisplay(filtered);
    },[search, stockLinks]);


    useEffect(()=>{
        dispatch(fetchStockLink(franchiseId));
        dispatch(fetchWarehouse(franchiseId));
    },[]);

    function openStockLinkModal(payload = {}){
        setCurrent({...initialStockLink,...payload});
        setStockLink_Modal(true);
    };

    // DEV-0002 ก้อน 9f: `franchise.linkSave` (census 263 264) · `linkDelete` (265)
    //   ชื่อ/หน่วย/บาร์โค้ด/รูปของสมาชิก server คัดจากคลังในฐาน (ST-139) ⇒ จอใช้ stockLink ที่ได้กลับมา
    //   เดิมสร้างแล้วใส่ franchiseId ลงรายการแทนกลุ่ม (ST-049) ⇒ ตอนนี้ใส่กลุ่มที่ server ตอบ
    async function submitStockLink(){
        setStockLink_Modal(false);
        setLoading(true);
        try {
            const body = linkSaveBody({ franchiseId, current, linkUUID });
            const res = await franchiseLinkSave(body);
            const row = { ...current, id: res.linkId, stockGroupName: body.stockGroupName, stockLink: res.stockLink || current.stockLink, upgrade: true };
            if (body.op === 'update') {
              dispatch(updateNormalLink(row));
              toastSuccess('อัพเดทรายการผูกสต๊อกเรียบร้อย');
            } else {
              dispatch(addNormalStockLink(row));
              setLinkUUID(newRequestId());
              toastSuccess('เพิ่มรายการผูกสต๊อกเรียบร้อย');
            }
        } catch (error) {
          toastError(apiErrorMessage(error, 'บันทึกกลุ่มผูกสต๊อกไม่สำเร็จ'))
        } finally{
          setLoading(false);
        }
    };

    async function deleteStockLink(id){
        setStockLink_Modal(false);
        setLoading(true);
        try {
          await franchiseLinkDelete({ franchiseId, linkId: id });
          dispatch(deleteNormalLink(id));
          toastSuccess('ลบรายการผูกสต๊อกเรียบร้อย');
        } catch (error) {
          toastError(apiErrorMessage(error, 'ลบกลุ่มผูกสต๊อกไม่สำเร็จ'))
        } finally{
          setLoading(false);    
        }
    }

    
  return (
    <div style={styles.container} >
      <h1>ผูกสต๊อก</h1>
      <Modal_Loading show={loading} />
      <Modal_StockLink
        show={stockLink_Modal}
        onHide={()=>setStockLink_Modal(false)}
        submit={submitStockLink}
        current={current}
        setCurrent={setCurrent}
        deleteStockLink={deleteStockLink}
      />
      <OneButton {...{ text:'เพิ่มผูกสต๊อก', submit:()=>{openStockLinkModal({})}, variant:'warning' }} />
      <br/><br/>
      <SearchControl {...{ search, setSearch, placeholder:"ค้นหาด้วยชื่อกลุ่ม" }} />
      <br/>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container2}>No.</th>
                <th style={styles.container3}>ชื่อ</th>
                <th style={styles.container3}>สินค้าที่ผูก</th>
                <th style={styles.container3}>จัดการ</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { id, stockGroupName, stockLink,   } = item;
                return <tr  key={id} >
                            <td style={styles.container4}>{index+1}.</td>
                            <td >{stockGroupName}</td>
                            <td style={styles.container4}>
                                {stockLink.map(i=>i.name).join(', ')}
                            </td>
                            <td style={styles.container4}>
                                <OneButton {...{ text:'จัดการ', submit:()=>{openStockLinkModal(item)}, variant:'warning' }} />
                            </td>
                        </tr>
            })}
            </tbody>
        </Table>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
  },
  container2 : {
    width:'10%', minWidth:'80px', textAlign:'center'
  },
  container3 : {
    width:'15%', minWidth:'150px', textAlign:'center'
  },
  container4 : {
    textAlign:'center'
  },
}

export default StockLinkScreen;