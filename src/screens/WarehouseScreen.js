import React, { useState, useEffect } from "react";
import {
  Table,
} from "react-bootstrap";
import { initialProduct, initialWarehouseItem } from "../configs";
import { useSelector, useDispatch } from "react-redux";
import { compareArrays, formatCurrency, goToTop, searchMultiFunction, summary, toastSuccess, totalField } from "../Utility/function";
import Modal_Loading from "../modal/Modal_Loading";
import '../styles/CartScreen.css'
import "react-datepicker/dist/react-datepicker.css";
import TablePagination from '@mui/material/TablePagination';
import { Modal_Warehouse } from "../modal";
import { db, prepareFirebaseImage2, webImageDelete } from "../db/firestore";
import { CategoryControl, OneButton, RootImage, SearchAndDownload } from "../components";
import { stringYMDHMS3 } from "../Utility/dateTime";
import * as XLSX from 'xlsx';
import { addNormalWarehouse, deleteNormalWarehouse, fetchWarehouse, updateNormalWarehouse } from "../redux/warehouseSlice";
import firebase from 'firebase/app';

function WarehouseScreen() {
  const dispatch = useDispatch();
  const { franchise : { id:franchiseId, warehouseCategory }, modal_Franchise } = useSelector((state)=> state.franchise);
  const { warehouse } = useSelector(state=>state.warehouse);
  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [warehouse_Modal, setWarehouse_Modal] = useState(false);
  const [current, setCurrent] = useState(initialWarehouseItem);
  const [loading, setLoading] = useState(false);
  const [oldImage, setOldImage] = useState('');
  const [categorySetting, setCategorySetting] = useState([]);
  const [search, setSearch] = useState('');
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
      if(warehouse.length===0){
        dispatch(fetchWarehouse(franchiseId))
      }
  },[]);

  // 200%
  useEffect(()=>{
      const length = categorySetting.length;
      const thisField = totalField(categorySetting,'id');
      let result = []
      for(const item of warehouse){
          if(length >=1){
              if(compareArrays(item.category.map(a=>a.id).slice(0,length),thisField)){
                  result.push(item)
              }
          } else {
              result.push(item)
          }
      }
      if(search){
        result = result.map(a=>({...a,sku:String(a.sku),barcode:String(a.barcode)}))
        result = searchMultiFunction(result,search,['name','sku','barcode'])
      }

      setResultLength(result.length)

      const fData = result.map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      setCurrentDisplay(fData)
  },[page,rowsPerPage,warehouse,categorySetting,search])

  // 200%
  async function submit(){
    setWarehouse_Modal(false)
    const { imageId, id } = current;
    setLoading(true);
    const payload = {
      ...current
    };

    //1. check รูปภาพ
    if (imageId && !imageId.startsWith('https')) {
      const imageUrl = await prepareFirebaseImage2(imageId,'/franchise/',franchiseId)
      payload.imageId = imageUrl
      if(oldImage){
        await webImageDelete(oldImage)
      }
    }
    try {
        if(id){
          const warehouseRef = db.collection('warehouseItem').doc(id);
          await warehouseRef.update(payload);
          dispatch(updateNormalWarehouse(payload));
          toastSuccess('อัปเดตรายการสินค้า สำเร็จ');
        } else {
          payload.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          payload.franchiseId = franchiseId;
          payload.stock = 0;
          const warehouseRef = db.collection('warehouseItem').doc();
          await warehouseRef.set(payload);
          dispatch(addNormalWarehouse({
            ...payload,
            id:warehouseRef.id
          }))
          toastSuccess('สร้างรายการสินค้า สำเร็จ');
        }

    } catch (error) {
      alert(error)
    } finally {
      setLoading(false)
      setCurrent(initialProduct)
      setOldImage('')
    }
  };

  // 200%
  async function deleteItem(id){
      setWarehouse_Modal(false)
      setLoading(true);
      try {
        const warehouseRef = db.collection('warehouseItem').doc(id);
        await warehouseRef.delete();
        dispatch(deleteNormalWarehouse(id));
        toastSuccess('ลบรายการสินค้า สำเร็จ');
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
        setCurrent(initialProduct)
        setOldImage('')
      }
  };

  // 200%
  function openWarehouse(item){
      setWarehouse_Modal(true);
      const thisCategory = new Set(item.category.map(a=>a.id))
      const category = warehouseCategory.flatMap(a=>a.value).filter(b=>thisCategory.has(b.id))
      setCurrent({ ...item, category });
      setOldImage(item.imageId)
  };

  const exportToXlsx = () => {
    // ---------------------
    // 1. Define headers
    // ---------------------
    const headers = [
      [
        "No.",
        "barcode",
        "สินค้า",
        "ราคา",
        "หน่วย",
        "หมวดหมู่",
      ],
    ];

    // ---------------------
    // 2. Map data rows
    // ---------------------
    const data = warehouse.map((item, index) => {
      const {
        name,
        price,
        unit,
        barcode,
        category,
      } = item;

      const row = [
        index + 1,
        barcode,
        name,
        price,
      ];

      row.push(unit, category[0]?.name || "");
      return row;
    }
    );

    // ---------------------
    // 3. Create sheet & workbook
    // ---------------------
    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "คลังสินค้า");

    // ---------------------
    // 4. Export file
    // ---------------------
    XLSX.writeFile(
      workbook,
      `คลังสินค้า ${stringYMDHMS3(new Date())}.xlsx`
    );
  }


  return (
    <div style={styles.container} >
        <Modal_Loading show={modal_Franchise||loading} />
        <Modal_Warehouse
            show={warehouse_Modal}
            onHide={()=>{setWarehouse_Modal(false);setCurrent(initialProduct)}}
            warehouseCategory={warehouseCategory}
            submit={submit}
            current={current}
            setCurrent={setCurrent}
            deleteItem={deleteItem}
        />
       
        <h2>คลังสินค้าส่วนกลาง</h2>
        <OneButton {...{ text:'เพิ่มรายการ', submit:()=>{setWarehouse_Modal(true)} }} />
        <br/><br/>
        <SearchAndDownload {...{ placeholder:"ค้นหาด้วยชื่อหรือSKUหรือบาร์โค้ด" , search, setSearch, exportToXlsx }} />
        <br/>
  
        <CategoryControl {...{ warehouseCategory, categorySetting, setCategorySetting }} />
        <br/>
        <h4>ค้นพบ {resultLength} รายการ</h4>
        <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr  >
                <th style={styles.container4}>No.</th>
                {/* <th style={styles.container5}>รูปภาพ</th> */}
                <th style={styles.container5}>barcode</th>
                <th style={styles.container6}>สินค้า</th>
                <th style={styles.container6}>ราคา</th>
                <th style={styles.container5}>หน่วย</th>
                <th style={styles.container5}>หมวดหมู่</th>
            </tr>
            </thead>
            <tbody  >
            
            {currentDisplay.map((item, index) => {
                const { imageId, name, price, unit, barcode, category } = item;
                return <tr onClick={()=>{openWarehouse(item)}} key={index} style={styles.container9} >
                            <td style={styles.container7}>{index+1}.</td>
                            {/* <td style={styles.container7} >
                              {imageId
                                  ?<img style={styles.container8} src={imageId} />
                                  :<RootImage style={styles.container8}  />
                              }
                            </td> */}
                            <td style={styles.container7}>{barcode}</td>
                            <td style={styles.container7}>{name}</td>
                            <td style={styles.container7}>{price}</td>
                            <td style={styles.container7}>{unit}</td>
                            <td style={styles.container7}>{category[0]?.name}</td>
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
  container2 : {
      display:'flex',justifyContent:'flex-end'
  },
  container4 : {
    width: '5%', textAlign:'center', minWidth:'70px'
  },
  container5 : {
    width: '15%', textAlign:'center', minWidth:'150px'
  },
  container6 : {
    width: '15%', textAlign:'center', minWidth:'200px'
  },
  container7 : {
    textAlign:'center'
  },
  container8 : {
    width:'5rem',height:'5rem',objectFit: 'cover',borderRadius:'1rem'
  },
  container9 : {
    cursor:'pointer'
  }

};

export default WarehouseScreen;
