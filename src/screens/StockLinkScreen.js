import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { addNormalStockLink, deleteNormalLink, fetchStockLink, updateNormalLink } from "../redux/stockLinkSlice";
import { OneButton, SearchControl } from '../components'
import { db } from "../db/firestore";
import { searchFilterFunction, toastSuccess } from "../Utility/function";
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

    useEffect(()=>{
        let filtered = stockLinks;
        if(search){
            filtered = searchFilterFunction(search,stockLinks,'stockGroupName');
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

    async function submitStockLink(){
        // dispatch action to add or update stock link
        setStockLink_Modal(false);

        setLoading(true);
        const { id } = current;
        try {
               if(id){
                  const stockLinkRef = db.collection('stockLink').doc(id);
                  await stockLinkRef.update({ ...current });
                  dispatch(updateNormalLink(current));
                  toastSuccess('อัพเดทรายการผูกสต๊อกเรียบร้อย');
                    // update existing stock link
                    // dispatch(updateStockLink(current));
                }else{
                  const stockLinkRef = db.collection('stockLink').doc();
                  await stockLinkRef.set({ ...current, id:stockLinkRef.id, franchiseId });
                  dispatch(addNormalStockLink(franchiseId));
                  toastSuccess('เพิ่มรายการผูกสต๊อกเรียบร้อย');
                    // add new stock link
                    // dispatch(addStockLink(current));
                } 
        } catch (error) {
          alert(error)
        } finally{
          setLoading(false);
        }
    };

    async function deleteStockLink(id){
        // dispatch action to delete stock link
        setStockLink_Modal(false);
        setLoading(true);
        try {
          const stockLinkRef = db.collection('stockLink').doc(id);
          await stockLinkRef.delete();
          dispatch(deleteNormalLink(id));
          toastSuccess('ลบรายการผูกสต๊อกเรียบร้อย');
        } catch (error) {
          alert(error)
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