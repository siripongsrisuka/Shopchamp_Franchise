import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { Modal_FindShop, Modal_Loading } from "../modal";
import { useSelector, useDispatch } from "react-redux";
import { addNormalShop } from "../redux/shopSlice";
import { formatTime, goToTop, searchFilterFunction, toastSuccess } from "../Utility/function";
import { db } from "../db/firestore";
import { stringDateTime3 } from "../Utility/dateTime";
import { OneButton, SearchControl } from "../components";
import TablePagination from '@mui/material/TablePagination';
import { initialAdmin } from "../configs";

function BranchScreen() {
    const dispatch = useDispatch();
    const { franchise : { id:franchiseId } } = useSelector((state)=> state.franchise);
    const { shops } = useSelector((state)=> state.shop);
    const { profile:{ id:profileId } } = useSelector((state)=> state.profile);

    const [newShop_Modal, setNewShop_Modal] = useState(false);
    const [thisProfile, setThisProfile] = useState({ name:'', id:'', imageId:'', tel:''});
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [resultLength, setResultLength] = useState(0);

    const handleChangePage = (event, newPage) => {
        setPage(newPage); // start form 0
        goToTop()
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        goToTop()
    };


    useEffect(()=>{
        let arr = shops
        if(search){
            arr = searchFilterFunction(shops,search,'name')
        }
        setResultLength(arr.length)
        const fData = arr.map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
        setCurrentDisplay(fData)
    },[shops,search,page,rowsPerPage]);


    async function handleChangeToFranchise(item){
        setNewShop_Modal(false);
        setLoading(true);
        try {
            const updatedField = {
                franchiseId:franchiseId,
            };
            const shopData = await db.runTransaction(async (transaction) => {
                const shopRef = db.collection('shop').doc(item.id);
                const shopDoc = await transaction.get(shopRef);
                const shopData = shopDoc.data();
                transaction.update(shopRef, updatedField);
                return {
                    ...shopData,
                    ...updatedField,
                    id:item.id,
                };
            });
            dispatch(addNormalShop(shopData));
            toastSuccess('เปลี่ยนโปรไฟล์เป็นสาขา สำเร็จ');
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };


  return (
    <div  style={styles.container} >
        <Modal_Loading show={loading} />

        <Modal_FindShop
            show={newShop_Modal}
            onHide={()=>{setNewShop_Modal(false)}}
            current={thisProfile}
            setCurrent={setThisProfile}
            submit={handleChangeToFranchise}
        />
        <h1>สาขาทั้งหมด</h1>
        {initialAdmin.has(profileId) && <OneButton {...{ text:'+ เพิ่มสาขาใหม่', submit:()=>{setNewShop_Modal(true)}, variant:'warning' }}/>}
        <br/><br/>
        <SearchControl {...{ search, setSearch, placeholder:'ค้นหาด้วยชื่อสาขา' }} />
        <br/>
        <h4>ค้นพบ {resultLength} สาขา</h4>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container3}>No.</th>
                <th style={styles.container7}>สาขา</th>
                <th style={styles.container4}>เบอร์โทรสาขา</th>
                <th style={styles.container4}>วันที่สร้าง</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item) => {
                const { no, id, name, tel, dateTime = '' } = item;
                return <tr  key={id} >
                            <td style={styles.container6}>{no}.</td>
                            <td >{name}</td>
                            <td style={styles.container6}>{tel}</td>
                            <td style={styles.container6}>{stringDateTime3(new Date(formatTime(dateTime)))}</td>
                        </tr>
            })}
            </tbody>
        </Table>
        <TablePagination
            component="div"
            count={resultLength}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </div>
  );
};

const styles = {
    container : {
        minHeight:'100vh'
    },
    container3 : {
        width: '5%', textAlign:'center', minWidth:'50px'
    },
    container4 : {
        width: '15%', textAlign:'center', minWidth:'180px'
    },
    container6 : {
        textAlign:'center'
    },
    container7 : {
        width: '25%', textAlign:'center', minWidth:'250px'
    },
    image : {
        width:'100px',borderRadius:'5rem',objectFit: 'cover'
    }
}

export default BranchScreen;