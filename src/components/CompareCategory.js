import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { endCutoff, formatCurrency, goToTop, startCutoff, summary } from "../Utility/function";
import { normalSort } from "../Utility/sort";
import { stringYMDHMS, stringYMDHMS3 } from "../Utility/dateTime";
import TablePagination from '@mui/material/TablePagination';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import Download from "./Download";
import { Modal_Product } from "../modal";

function CompareCategory({ setStartDate, setEndDate, startDate, endDate }) {
  const { t } = useTranslation();
  const { shop } = useSelector((state)=> state.shop)
  const { smartCategory, cutOff } = shop;
  const { selectedBill } = useSelector((state)=> state.bill)
  const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [masterCategory, setMasterCategory] = useState([]);
  const [masterProduct, setMasterProduct] = useState([]);
  const [product_Modal, setProduct_Modal] = useState(false);
  const [product, setProduct] = useState([]);

  const getDates = () => {
    const today = new Date()
    
    // First day of the previous month
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Last day of the previous month
    const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // First day of the current month
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
    // Attempt to get the same date last month
    let sameDateLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    // Check if the same date is valid for last month
    if (lastDayOfPreviousMonth.getDate()<today.getDate()) {
      // Set to last day of the previous month if invalid
      sameDateLastMonth = lastDayOfPreviousMonth
    }
  
    return {
      firstDayOfPreviousMonth,
      lastDayOfPreviousMonth,
      firstDayOfCurrentMonth,
      sameDateLastMonth,
    };
  };
  const { firstDayOfPreviousMonth, lastDayOfPreviousMonth, firstDayOfCurrentMonth, sameDateLastMonth } = getDates();

  useEffect(()=>{
    
        setStartDate(firstDayOfPreviousMonth)
        setEndDate(new Date())
  },[])

  useEffect(()=>{
    let previousMonthBill = selectedBill.filter((item)=>{return(stringYMDHMS(item.timestamp) > stringYMDHMS(startCutoff(new Date(firstDayOfPreviousMonth),new Date(cutOff))) && stringYMDHMS(item.timestamp) <= stringYMDHMS(endCutoff(new Date(lastDayOfPreviousMonth),new Date(cutOff))))})
    let thisMonthBill = selectedBill.filter((item)=>{return(stringYMDHMS(item.timestamp) > stringYMDHMS(startCutoff(new Date(firstDayOfCurrentMonth),new Date(cutOff))) && stringYMDHMS(item.timestamp) <= stringYMDHMS(endCutoff(new Date(),new Date(cutOff))))})
    let thisLastMonthBill  = selectedBill.filter((item)=>{return(stringYMDHMS(item.timestamp) > stringYMDHMS(startCutoff(new Date(firstDayOfPreviousMonth),new Date(cutOff))) && stringYMDHMS(item.timestamp) <= stringYMDHMS(endCutoff(sameDateLastMonth,new Date(cutOff))))})
    
    let previousMonthProduct = previousMonthBill.flatMap(a=>a.product).filter(b=>b.process!=='cancel')
    let thisMonthProduct = thisMonthBill.flatMap(a=>a.product).filter(b=>b.process!=='cancel')
    let thisLastMonthProduct = thisLastMonthBill.flatMap(a=>a.product).filter(b=>b.process!=='cancel')

    let layerCategory = (smartCategory[0]?.value||[]).map(a=>{
        let previousMonthSale = summary(previousMonthProduct.filter(b=>b.category[0]===a.id),'totalPrice')
        let thisMonthSale = summary(thisMonthProduct.filter(b=>b.category[0]===a.id),'totalPrice')
        let thisMonthQty = summary(thisMonthProduct.filter(b=>b.category[0]===a.id),'qty')
        let thisLastMonthSale = summary(thisLastMonthProduct.filter(b=>b.category[0]===a.id),'totalPrice')
        return {
            ...a,
            previousMonthSale,
            thisMonthSale,
            thisMonthQty,
            thisLastMonthSale,
            color:thisMonthSale>thisLastMonthSale?'green':thisMonthSale===thisLastMonthSale?'grey':'red',
            rate:thisLastMonthSale>0?(thisMonthSale-thisLastMonthSale)*100/thisLastMonthSale:0
        }
    });

    let newProducts = []
    for(const { name, id, totalPrice, category } of thisLastMonthProduct){
        let findProduct = newProducts.find(a=>a.id===id)
        if(findProduct){
            findProduct.previousSale += Number(totalPrice)
        } else {
            newProducts.push({ name, id, previousSale:Number(totalPrice), currentSale:0, category, qty:0 })
        }
    }
    for(const { name, id, totalPrice, qty, category } of thisMonthProduct){
        let findProduct = newProducts.find(a=>a.id===id)
        if(findProduct){
            findProduct.currentSale += Number(totalPrice)
            findProduct.qty += qty
        } else {
            newProducts.push({ name, id, currentSale:Number(totalPrice), previousSale:0, qty, category })
        }
    }
    newProducts = newProducts.map(a=>{
        return {
            ...a,
            color:a.currentSale>a.previousSale?'green':a.currentSale===a.previousSale?'grey':'red',
            rate:a.previousSale>0?(a.currentSale-a.previousSale)*100/a.previousSale:0
        }
    })
    setMasterCategory(normalSort('thisMonthSale',layerCategory))
    setMasterProduct(normalSort('currentSale',newProducts))
  },[selectedBill]);


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
    let fData = masterCategory.map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      setCurrentDisplay(fData)
  },[page,rowsPerPage,masterCategory])

  const exportToXlsx = () => {
    const data = masterCategory.map((item) => ({
          [t('compare.list')]: item.name,
          [t('compare.saleQty')]: item.thisMonthQty,
          [t('compare.growth')]: item.rate,
          [t('compare.currentMonthSale')]: item.thisMonthSale,
          [t('compare.lastMonthSale')]: item.thisLastMonthSale,
          [t('compare.lastMonthSales')]: item.previousMonthSale,
        }))
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('compare.compare'));
  
    const fileName = `${t('compare.compare')}${stringYMDHMS3(startDate)}-${stringYMDHMS3(endDate)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  function openProduct(categoryId){
    let filterCategory = masterProduct.filter(a=>a.category[0]===categoryId)
    setProduct_Modal(true)
    setProduct(filterCategory)
  }

  return (
    <div  >
        <Modal_Product
            show={product_Modal}
            onHide={()=>{setProduct_Modal(false)}}
            product={product}
        />
        <div style={{display:'flex',justifyContent:'flex-end'}} >
            <Download exportToXlsx={exportToXlsx} />
        </div>
        <br/>
        <Table   hover responsive  variant="light" style={styles.container3}  >
            <thead  >
            <tr>
                <th style={styles.container} >{t('reportCategory.no')}</th>
                <th style={styles.container2} >{t('compare.list')}</th>
                <th style={styles.container2} >{t('compare.saleQty')}</th>
                <th style={styles.container2}>{t('compare.growth')}(%)</th>
                <th style={styles.container2}>{t('compare.currentMonthSale')}</th>
                <th style={styles.container2}>{t('compare.lastMonthSale')}</th>
                <th style={styles.container2}>{t('compare.lastMonthSales')}</th>
                <th style={styles.container2}>{t('compare.detail')}</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { no, name, rate, thisMonthSale, thisLastMonthSale, previousMonthSale, thisMonthQty } = item;
                return  <tr   key={index} >
                            <td style={styles.container} >{no}.</td>
                            <td >{name}</td>
                            <td style={styles.container2} >{thisMonthQty}</td>
                            <td style={{textAlign:'center',color:item.color,width:'13%'}} >{formatCurrency(rate)}</td>
                            <td style={styles.container2}>{formatCurrency(thisMonthSale)}</td>
                            <td style={styles.container2}>{formatCurrency(thisLastMonthSale)}</td>
                            <td style={styles.container2}>{formatCurrency(previousMonthSale)}</td>
                            <td style={styles.container2}>
                                <Button onClick={()=>{openProduct(item.id)}} variant="warning" style={{width:'100px'}} >{t('compare.watch')}</Button>
                            </td>
                        </tr>
            })}
            </tbody>
        </Table>
        <TablePagination
            component="div"
            count={masterCategory.length}
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
        textAlign:'center', width: '9%', minWidth:'50px'
    },
    container2 : {
        textAlign:'center', width:'13%', textAlign:'center',minWidth:'150px'
    },
    container3 : {
        marginLeft:'1rem'
    }
};

export default CompareCategory;
