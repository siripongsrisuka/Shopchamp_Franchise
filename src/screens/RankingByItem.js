import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { normalSort, sortController } from "../Utility/sort";
import { formatCurrency, goToTop, searchFilterFunction } from "../Utility/function";
import { SearchAndDownload, TimeControlBill } from "../components";
import * as XLSX from 'xlsx';
import { stringYMDHMS3 } from "../Utility/dateTime";
import Modal_FlatListTwoColumn from "../modal/Modal_FlatListTwoColumn";
import TablePagination from '@mui/material/TablePagination';

const sortOptions = [
  { id: '1', name: 'ยอดขายจาก มาก ไป น้อย', key:'allTotalPrice', type:'normal' },
  { id: '2', name: 'ยอดขายจาก น้อย ไป มาก', key:'allTotalPrice', type:'reverse' },
  { id: '3', name: 'จำนวนจาก มาก ไป น้อย', key:'allQty', type:'normal'  },
  { id: '4', name: 'จำนวนจาก น้อย ไป มาก', key:'allQty', type:'reverse' },
];


function RankingByItem() {
    const { selectedBills, startDate, endDate  } = useSelector((state)=> state.bill);
    const [sort_Modal, setSort_Modal] = useState(false);
    const [currentSort, setCurrentSort] = useState({ id: '1', name: 'ยอดขายจาก มาก ไป น้อย', key:'allTotalPrice', type:'normal' },);
    const { name:sortName  } = currentSort;
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

    const { masterData, allTotalPrice, allQty } = useMemo(()=>{
      let productMap = new Map();

      const thisProduct = selectedBills
        .flatMap(a => a.product)

      for (const { barcode, qty, net:totalPrice, ...rest } of thisProduct) {
        if (productMap.has(barcode)) {
          const item = productMap.get(barcode);
          item.allQty += qty;
          item.allTotalPrice += Number(totalPrice);
        } else {
          productMap.set(barcode, {
            ...rest,
            barcode,
            qty,
            totalPrice,
            allQty: qty,
            allTotalPrice: Number(totalPrice),
          });
        }
      }
      const masterData = Array.from(productMap.values());
      const { totalPrice, qty } = masterData.reduce((acc,item)=>{
        acc.totalPrice += Number(item.allTotalPrice);
        acc.qty += item.allQty;
        return acc
      },{ totalPrice:0, qty:0 })
      return {
        masterData:normalSort('allTotalPrice',masterData),
        allTotalPrice:formatCurrency(totalPrice),
        allQty:formatCurrency(qty)

      }
    },[selectedBills]);

    useEffect(()=>{
        const { key, type } = currentSort;
        const newProduct = sortController(key,masterData,type);
        const results = search
          ?searchFilterFunction(newProduct,search)
          :newProduct

        setResultLength(results.length)
        const fData = results
          .map((item,index)=>{return({...item,no:index+1})}).filter((item,index)=>{return(index >=(page*rowsPerPage) && index <= ((page+1)*rowsPerPage)-1)})
    
        setCurrentDisplay(fData);

    },[page,rowsPerPage,search,masterData,currentSort])


      const exportToXlsx = () => {
        // Define the headers
        const headers = [
          ["No.", "บาร์โค้ด", "รายการ", "จำนวนที่ขาย", "ยอดขาย"]
        ];
      
        // Map the data from the table
        const data = masterData.map((item, index) => [
          `${index + 1}.`,
          item.barcode,
          item.name,
          item.allQty,
          formatCurrency(item.allTotalPrice),
        ]);
      
        // Add the total row with "รวม" spanning two columns
        data.push([
          "รวม",'', // These will be merged
          allQty,
          allTotalPrice,
        ]);
      
        // Create the worksheet and workbook
        const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขายตามสินค้า");
      
 
        worksheet["!merges"] = [
          { s: { r: data.length, c: 0 }, e: { r: data.length, c: 1 } } // Merge first two cells of last row
        ];
      
        // Trigger file download
        XLSX.writeFile(workbook, `ยอดขายตามสินค้า ${stringYMDHMS3(startDate)} - ${stringYMDHMS3(endDate)}.xlsx`);
      };

    function handleSort(item){
      setCurrentSort(item);
      setSort_Modal(false)
    }
      

  return (
    <div  style={styles.container}  >
      <h1>ยอดขายตามสินค้า</h1>
      <Modal_FlatListTwoColumn
          show={sort_Modal}
          header='เลือกการจัดเรียง'
          onHide={()=>{setSort_Modal(false)}}
          onClick={handleSort}
          value={sortOptions}
      />
      <TimeControlBill  />
      <SearchAndDownload {...{ search, setSearch, placeholder:'ค้นหาด้วยชื่อ', exportToXlsx, sort:true, onClick:()=>{setSort_Modal(true)} }} />
      <h5>การจัดเรียง : {sortName}</h5>
      <br/>
      <h4>ค้นพบ : {resultLength} รายการ</h4>
      <Table striped bordered hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container3}>No.</th>
                <th style={styles.container4}>บาร์โค้ด</th>
                <th style={styles.container4}>รายการ</th>
                <th style={styles.container4}>จำนวนที่ขาย</th>
                <th style={styles.container4}>ยอดขาย</th>
            </tr>
            </thead>
            <tbody  >
            {currentDisplay.map((item, index) => {
                const { name, allTotalPrice, allQty, no, barcode } = item;
                return <tr   key={index} >
                            <td style={styles.container6}>{no}.</td>
                            <td style={styles.container6}>{barcode}</td>
                            <td >{name}</td>
                            <td style={styles.container6}>{allQty}</td>
                            <td style={styles.container6}>{formatCurrency(allTotalPrice)}</td>
                        </tr>
            })}
            <tr>
              <td colSpan={3} style={styles.container6} >รวม</td>
              <td style={styles.container6} >{allQty}</td>
              <td style={styles.container6} >{allTotalPrice}</td>
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
      minHeight:'100vh',
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

export default RankingByItem;