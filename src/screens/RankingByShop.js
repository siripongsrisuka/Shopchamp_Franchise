import React, { useState, useMemo, useEffect} from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { stringYMDHMS3 } from "../Utility/dateTime";
import { normalSort } from "../Utility/sort";
import { formatCurrency, goToTop, searchFilterFunction } from "../Utility/function";
import { SearchAndDownload, TimeControlBill } from "../components";
import * as XLSX from 'xlsx';
import TablePagination from '@mui/material/TablePagination';


function RankingByShop() {
    const { shops } = useSelector((state)=> state.shop);
    const { sales, startDate, endDate  } = useSelector((state)=> state.bill);
    const [search, setSearch] = useState('');

    const [resultLength, setResultLength] = useState(0);
    const [currentDisplay, setCurrentDisplay] = useState([]) // จำนวนที่แสดงในหนึ่งหน้า
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const handleChangePage = (event, newPage) => {
        setPage(newPage); // start form 0
        goToTop()
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        goToTop()
    };

    // DEV-0002 Pack เคาะ 2026-11-07: ยอดต่อสาขามาจาก server `franchise.breakdown` (สูตรกลาง · ไม่นับใบยกเลิก · วันตาม cutOff ของสาขา)
    //   แถว = สาขาตอนนี้ทุกสาขา (ไม่มียอด = 0) + ร้านที่ออกจากแฟรนไชส์แล้วแต่มีบิลในช่วง (เดิมไม่มีแถว แต่ยอดอยู่ใน Dashboard)
    //   แถวรวม Busket Size = ยอดรวม ÷ ใบเสร็จรวม (เดิมเอา Busket Size ของทุกสาขามาบวกกัน)
    const { masterData, totalPrice, average, length } = useMemo(()=>{
      const rowOf = new Map((sales.shops || []).map((r)=>[r.shopId, r]));
      const current = shops.map((a)=>{
        const r = rowOf.get(a.id) || {};
        return { ...a, allTotalPrice: Number(r.totalSale) || 0, length: Number(r.billQty) || 0, average: Number(r.average) || 0 };
      });
      const known = new Set(shops.map((a)=>a.id));
      const left = (sales.shops || []).filter((r)=>!known.has(r.shopId)).map((r)=>({
        id: r.shopId, name: `${r.shopId} (ไม่ใช่สาขาแล้ว)`, allTotalPrice: r.totalSale, length: r.billQty, average: r.average,
      }));
      const display = normalSort('allTotalPrice',[...current, ...left]);
      const t = sales.totals || {};
      return {
        masterData:display.map(a=>({...a,average:formatCurrency(a.average),allTotalPrice:formatCurrency(a.allTotalPrice)})),
        totalPrice:formatCurrency(Number(t.totalSale) || 0),
        average:formatCurrency(Number(t.average) || 0),
        length:formatCurrency(Number(t.billQty) || 0)
      }
    },[sales,shops]);


      useEffect(()=>{
    
          const results = search
            ?searchFilterFunction(masterData,search)
            :masterData
  
          setResultLength(results.length)
          const fData = results
            .map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
      
          setCurrentDisplay(fData);
  
      },[page,rowsPerPage,search,masterData])


      const exportToXlsx = () => {
        // Define the headers
        const headers = [
          ["No.", "สาขา", "ยอดขาย", "ใบเสร็จ", "Busket Size"]
        ];
      
        // Map the data from the table
        const data = masterData.map((item, index) => [
          `${index + 1}.`,
          item.name,
          item.allTotalPrice,
          item.length,
          item.average,
        ]);
      
        // Add the total row with "รวม" spanning two columns
        data.push([
          "รวม",'', // These will be merged
          totalPrice,
          length,
          average,
        ]);
      
        // Create the worksheet and workbook
        const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขายตามสาขา");
      
 
        worksheet["!merges"] = [
          { s: { r: data.length, c: 0 }, e: { r: data.length, c: 1 } } // Merge first two cells of last row
        ];
      
        // Trigger file download
        XLSX.writeFile(workbook, `ยอดขายตามสาขา ${stringYMDHMS3(startDate)} - ${stringYMDHMS3(endDate)}.xlsx`);
      };

  return (
    <div  style={styles.container}  >
      <h1>ยอดขายตามร้านค้า</h1>
      <TimeControlBill />
      <SearchAndDownload {...{ placeholder:'ค้นหาด้วยชื่อสาขา', search, setSearch, exportToXlsx:()=>{exportToXlsx()} }} />
      <br/>
      <h4>ค้นพบ : {resultLength} รายการ</h4>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container3}>No.</th>
                <th style={styles.container4}>สาขา</th>
                <th style={styles.container4}>ยอดขาย</th>
                <th style={styles.container4}>ใบเสร็จ</th>
                <th style={styles.container4}>Busket Size</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { id, name, allTotalPrice, length, average } = item;
                return <tr   key={id} >
                            <td style={styles.container6}>{index+1}.</td>
                            <td >{name}</td>
                            <td style={styles.container6}>{allTotalPrice}</td>
                            <td style={styles.container6}>{length}</td>
                            <td style={styles.container6}>{average}</td>
                        </tr>
            })}
            <tr>
              <td colSpan={2} style={styles.container6} >รวม</td>
              <td style={styles.container6} >{totalPrice}</td>
              <td style={styles.container6} >{length}</td>
              <td style={styles.container6} >{average}</td>
            </tr>
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
}

const styles = {
  container : {
      height:'100vh',
      scrollY:'auto'
  },
  container2 : {
      display:'flex',justifyContent:'flex-end',marginBottom:'1rem'
  },
  container3 : {
      width: '5%', textAlign:'center'
  },
  container4 : {
      width: '15%', textAlign:'center', minWidth:'200px'
  },
  container6 : {
      textAlign:'center'
  }
};

export default RankingByShop;