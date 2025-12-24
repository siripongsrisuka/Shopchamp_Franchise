import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { goToTop, searchFilterFunction } from "../Utility/function";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import '../styles/CartScreen.css'
import TablePagination from '@mui/material/TablePagination';
import { useTranslation } from 'react-i18next';
import { db } from "../db/firestore";
import { Modal_Loading, Modal_StockCount } from "../modal";
import SearchControl from "./SearchControl";


const initialStock = {
    shopId:'',
    shopName:'',
    profileId:'',
    profileName:'',
    product:[],
    timestamp:new Date(),
    billDate:'',
};

function ReportStockCount({ startDate, endDate }) {
  const { t } = useTranslation();
  const { shop:{ id:shopId } } = useSelector(state=>state.shop)
  const [currentDisplay, setCurrentDisplay] = useState([]); // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [inbound, setInbound] = useState([]);
  const [lastElement, setLastElement] = useState(null);
  const [allElement, setAllElement] = useState(9999);
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(initialStock);
  const [stock_Modal, setStock_Modal] = useState(false);
  const [masterData, setMasterData] = useState([])


  useEffect(()=>{
    setLastElement(null)
    setTimeout(()=>{
        fetchPagination()
    },500)
  },[shopId]);


  async function fetchPagination(){
    setLoading(true)
    if(lastElement){
        db.collection('stockReport')
        .where('shopId','==',shopId)
        .orderBy("timestamp",'desc')
        .startAfter(lastElement)
        .limit(25)
        .get().then((documentSnapshots)=>{
            let arr = []
            if(documentSnapshots.docs.length>0){
                documentSnapshots.forEach((doc)=>{
                    const { timestamp, products, ...rest  }  = doc.data()
                    arr.push({
                        ...rest,
                        timestamp:timestamp.toDate(),
                    })

                })
                let lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                setLastElement(lastVisible)
                // console.log("last", lastVisible.data());
            } else {
                setAllElement(inbound.length)
            }
            setInbound([...inbound,...arr])
            setLoading(false)
        }).catch((err)=>{setLoading(false);alert(err)})
    } else {
        db.collection('stockReport')
        .where('shopId','==',shopId)
        .orderBy("timestamp",'desc')
        .limit(25)
        .get().then((documentSnapshots)=>{
            let arr = []
            if(documentSnapshots.docs.length>0){
                documentSnapshots.forEach((doc)=>{
                    const { timestamp, ...rest  }  = doc.data()
                    arr.push({
                        ...rest,
                        timestamp:timestamp.toDate(),
                    })
                })
                let lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                setLastElement(lastVisible)
            }
            
            setInbound(arr)
            setLoading(false)
        }).catch(()=>{setLoading(false)})
    }
   
  };


  const handleChangePage = (event, newPage) => {
    // start form 0
    if(newPage>page){
        let wantedElement = (newPage+1)*rowsPerPage
        if(wantedElement>inbound.length){
            if(inbound.length<allElement){
                fetchPagination()
                setPage(newPage)
                goToTop()
            } else {
                if(inbound.length-(newPage*rowsPerPage)>0){
                    setPage(newPage)
                    goToTop()
                } else {
                    alert(t('stock.endOfData'))
                }
            }
        } else {
            setPage(newPage)
            goToTop()
        }
    } else {
        setPage(newPage)
        goToTop()
    }
    


};

const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    goToTop()
};



useEffect(()=>{
  let arr = inbound
  if(search){
        arr = searchFilterFunction(arr,search,'profileName')
  }
  let fData = arr.map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
    setCurrentDisplay(fData)
},[page,rowsPerPage,inbound,search])



  return (
    <div  >
        <Modal_StockCount
            show={stock_Modal}
            onHide={()=>{setStock_Modal(false)}}
            current={current}
        />
        <Modal_Loading show={loading} />
        <div style={styles.container} >
            <SearchControl {...{ placeholder:t('stockCount.placeholder'), search, setSearch }} />&emsp;
        </div>
      
      <Table striped bordered hover responsive  variant="light" style={styles.container2}  >
        <thead  >
        <tr>
            <th style={styles.container3} >{t('stock.no')}</th>
            <th style={styles.container4} >{t('stock.time')}</th>
            <th style={styles.container5}>{t('stockCount.countBy')}</th>
            <th style={styles.container5}>{t('stockCount.qtyList')}</th>
            <th style={styles.container5}>{t('stockCount.diff')}</th>
            <th style={styles.container5}>{t('stockCount.detail')}</th>
        </tr>
        </thead>
        <tbody  >
        {currentDisplay.map((item, index) => {
            const { profileName, timestamp, product }  = item;
            return <tr   key={index} >
                        <td style={styles.text}>{index+1}.</td>
                        <td style={styles.text}>{stringDateTimeReceipt(timestamp,t)}</td>
                        <td style={styles.text}>{profileName}</td>
                        <td style={styles.text}>{product.length}</td>
                        <td style={styles.text}>{product.filter(a=>a.diff).length}</td>
                        <td  style={styles.text} >
                            <Button onClick={()=>{setCurrent(item);setStock_Modal(true)}} variant="warning" >{t('stockCount.detail')}</Button>
                        </td>
                    </tr>
        })}

        </tbody>
    </Table>
    <TablePagination
        component="div"
        count={inbound.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
    />
    </div>
  );
}

const styles = {
    container : {
        marginBottom:'2rem',marginRight:'2rem',display:'flex',alignItems:'center',justifyContent:'flex-end',padding:10
    },
    container2 : {
        marginLeft:'1rem'
    },
    container3 : {
        width:'10%', textAlign:'center'
    },
    container4 : {
        width:'30%', textAlign:'center', minWidth:'250px'
    },
    container5 : {
        width:'10%', textAlign:'center', minWidth:'180px'
    },
    text : {
        textAlign:'center'
    },
 
}

export default ReportStockCount;
