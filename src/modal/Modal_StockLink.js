import React, { useMemo, useRef, useState } from "react";
import {
  Button,
  Row,
  Col,
  Modal,
  Image,
} from "react-bootstrap";
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";
import { useSelector } from "react-redux";
import { DeleteButton, InputText, OneButton } from "../components";
import { id } from "date-fns/locale";

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
    upgrade:true
};

function Modal_StockLink({
    backdrop=true, // true/false/static
    animation=true,
    show,
    onHide,
    centered=true,
    size='lg',
    submit,
    current,
    setCurrent,
    deleteStockLink
}) {
    const { warehouse } = useSelector(state=>state.warehouse);
    const { stocklinks = [] } = useSelector(state=>state.stockLink);
    const { stockGroupName = '', stockLink = [], id } = current;
    const [product_Modal, setProduct_Modal] = useState(false);
    const [availableStock, setAvailableStock] = useState([]); // available stock 

    const links = useMemo(()=>{ // set of linked stock ids
        return new Set(stocklinks.flatMap(item=>item.stockLink).map(i=>i.id))
    },[stocklinks]);


    function confirm(){
        if(!stockGroupName) return alert('กรุณาใส่ชื่อกลุ่มผูกสต๊อก');
        if(stockLink.length===0) return alert('กรุณาเพิ่มรายการผูกสต๊อก');
        if(stockLink.some(a=>!a.linkMultiply || a.linkMultiply<=0)) return alert('กรุณาใส่จำนวนที่ผูกสต๊อกให้ถูกต้อง');   
        if(stockLink.filter(a=>a.linkMultiply==1).length===0) return alert('กรุณาเลือกสินค้าที่ใช้เป็นอ้างอิง 1 รายการ');
        if(stockLink.filter(a=>a.linkMultiply==1).length>1) return alert('กรุณาเลือกสินค้าที่ใช้เป็นอ้างอิงได้เพียง 1 รายการเท่านั้น');   
        submit()
    };

    function openWarehouse(){
        setProduct_Modal(true);
        const available = warehouse.filter(a=>!links.has(a.id))
        setAvailableStock(available)
    };

    function handleStockLink(item){
        const { id, barcode, imageId, name, unit,  } = item
        setCurrent(prev=>({...prev,stockLink:[...prev.stockLink,{ id, barcode, imageId, name, unit, linkMultiply:'' }]}));
        setProduct_Modal(false);

    };

    return (
    <Modal
        backdrop={backdrop}
        animation={animation}
        show={show}
        onHide={onHide}
        centered={centered}
        // fullscreen='xxl-down'
        fullscreen={true}
        size={size}
    >
        <Modal_FlatListTwoColumn
            show={product_Modal}
            onHide={()=>setProduct_Modal(false)}
            title="เพิ่มรายการผูกสต๊อก"
            value={availableStock}
            onClick={handleStockLink}

        />
        <Modal.Header closeButton>ผูกสต๊อก</Modal.Header>
        <Modal.Body>
            <OneButton {...{ text:"เพิ่มสินค้า", submit:openWarehouse }} />
            <br/><br/>
            <InputText
                label="ชื่อกลุ่มผูกสต๊อก :"
                placeholder="ชื่อกลุ่มผูกสต๊อก :"
                value={stockGroupName}
                onChange={e=>setCurrent(prev=>({...prev,stockGroupName:e.target.value}))}
            />
            <br/>
            {stockLink.map((item,index)=>(
                <Row key={item.id} style={{ marginBottom:10, alignItems:'center' }} >
                    <Col xs={1} >{index+1}.</Col>
                    <Col xs={5} >
                        {item.name}
                    </Col>
                    <Col xs={3} >
                        <input
                            type="number"
                            placeholder="จำนวนที่ผูกสต๊อก"
                            value={item.linkMultiply}
                            onChange={e=>setCurrent(prev=>{
                                const newStockLink = prev.stockLink.map(a=>{
                                    return a.id === item.id
                                        ?{...a,linkMultiply:e.target.value}
                                        :a
                                })
                                return {...prev,stockLink:newStockLink}
                            })}
                            style={{ width:'100%' }}
                        />
                    </Col>
                    <Col xs={3} >
                        <Button
                            variant="danger"
                            onClick={()=>{
                                setCurrent(prev=>{
                                    const newStockLink = prev.stockLink.filter(a=>a.id!==item.id)
                                    return {...prev,stockLink:newStockLink}
                                })
                            }}
                        >
                            ลบ
                        </Button>
                    </Col>
                </Row>
            ))}
            <br/>
        {id
            ?<DeleteButton {...{ text:"ลบผูกสต๊อกนี้", submit:()=>{
                    if(window.confirm('คุณต้องการลบผูกสต๊อกนี้ใช่หรือไม่?')){
                        deleteStockLink(current.id)
                    }
            } }} />
            :null
        }
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>  ยกเลิก</Button>
            <Button variant="primary" onClick={confirm}>  ตกลง</Button>
        </Modal.Footer>
    </Modal>
  );
}

export default Modal_StockLink;