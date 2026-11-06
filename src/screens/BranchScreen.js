import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { Modal_FindShop, Modal_Loading } from "../modal";
import { useSelector, useDispatch } from "react-redux";
import { fetchShopFranchise } from "../redux/shopSlice";
import { formatTime, goToTop, searchFilterFunction, toastError, toastSuccess } from "../Utility/function";
import { franchiseBranchAttach } from "../api/franchiseApi";
import { apiErrorMessage, serverErrorCode } from "../api/posApi";
import { stringDateTime3 } from "../Utility/dateTime";
import { OneButton, SearchControl } from "../components";
import TablePagination from '@mui/material/TablePagination';

function BranchScreen() {
    const dispatch = useDispatch();
    const { franchise : { id:franchiseId }, access } = useSelector((state)=> state.franchise);
    const { shops } = useSelector((state)=> state.shop);
    // ปุ่มผูกสาขา = ทีมงานเท่านั้น ตามเดิม · ทีมงานหรือไม่ server ตัดสิน (`franchise.get` › access.byAdmin) แทนชุด uid ในเว็บ
    const isAdmin = !!(access && access.byAdmin);

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


    // DEV-0002 ก้อน 9f: `franchise.branchAttach` (census 268) · เขียน shop.franchiseId ช่องเดียวที่ server
    //   ร้านอยู่แฟรนไชส์อื่น = 409 ไม่ย้ายเงียบ (DI-13) ⇒ ถามก่อน แล้วส่ง moveFromFranchiseId ตรงค่าปัจจุบัน
    async function handleChangeToFranchise(item, moveFromFranchiseId){
        setNewShop_Modal(false);
        setLoading(true);
        try {
            const body = { franchiseId, shopId: item.id };
            if (moveFromFranchiseId) body.moveFromFranchiseId = moveFromFranchiseId;
            const res = await franchiseBranchAttach(body);
            dispatch(fetchShopFranchise(franchiseId));
            toastSuccess(res.unchanged ? 'ร้านนี้เป็นสาขาอยู่แล้ว' : 'เปลี่ยนโปรไฟล์เป็นสาขา สำเร็จ');
        } catch (error) {
            const env = error && error.response && error.response.data;
            const current = env && typeof env.currentFranchiseId === 'string' ? env.currentFranchiseId : '';
            if (serverErrorCode(error) === 'shop_in_other_franchise' && current && !moveFromFranchiseId
                && window.confirm(`ร้าน ${item.name || ''} เป็นสาขาของแฟรนไชส์อื่นอยู่ ต้องการย้ายมาแฟรนไชส์นี้ไหม`)) {
                return await handleChangeToFranchise(item, current);
            }
            toastError(apiErrorMessage(error, 'ผูกสาขาไม่สำเร็จ'));
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
        {isAdmin && <OneButton {...{ text:'+ เพิ่มสาขาใหม่', submit:()=>{setNewShop_Modal(true)}, variant:'warning' }}/>}
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