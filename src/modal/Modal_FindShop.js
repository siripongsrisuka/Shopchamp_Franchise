import React, { useState } from "react";
import {
  Row,
  Col,
  Modal,
  Form
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { colors } from "../configs";
import { FooterButton, OneButton } from "../components";
import Modal_Loading from "./Modal_Loading";
import { franchiseBranchFind } from "../api/franchiseApi";
import { apiErrorMessage } from "../api/posApi";

const { softWhite, three, white } = colors;

function Modal_FindShop({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  submit,
  current,
  setCurrent
}) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [shops, setShops] = useState([]);
    const { id:humanId } = current;
    const [loading, setLoading] = useState(false);
    const { franchise:{ id:franchiseId } } = useSelector((state)=> state.franchise);

    function close(){
        setPhoneNumber('')
        onHide()
    }

    function check(){
        if(!humanId)return alert('กรุณาเลือกโปรไฟล์');
        submit(current)
        setShops([])
    };


    // DEV-0002 ก้อน 9f: `franchise.branchFind` (census 281) · ได้แค่ id name tel และสังกัดเดิม ⇒ รหัสพนักงานไม่ออกจาก server (FD-B2)
    async function findProfile(){
        setLoading(true);
        try {
            const res = await franchiseBranchFind({ franchiseId, tel: phoneNumber.trim() });
            setShops(res.shops || [])
            setPhoneNumber('')
        } catch (error) {
            alert(apiErrorMessage(error, 'ค้นร้านไม่สำเร็จ'))
        } finally {
            setLoading(false);
        }
    };


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      size={size}
    >
      <Modal.Header closeButton>
        <h2><b>โปรไฟล์</b></h2>
      </Modal.Header>
        <Modal_Loading show={loading} />
      <Modal.Body style={styles.container} >
        <div style={styles.container2} >
            <Form.Control 
                type="text" 
                placeholder={`ใส่เบอร์โทร`} 
                onChange={(event)=>{setPhoneNumber(event.target.value)}}
                value={phoneNumber}
            />&emsp;
            {shops.length>0
                ?<OneButton {...{ text:"ล้าง", submit:()=>{setShops([]);setCurrent(prev=>({...prev,id:''}))}, variant:'danger' }} />
                :<OneButton {...{ text:'ค้นหา', submit:findProfile  }} />
            }
            
        </div>
        <Row  >
            {shops.map((a)=>{
                const { name, id, inThisFranchise, franchiseId:otherFranchiseId } = a;
                let status = humanId===id
                return <Col key={id} md='6' >
                            <div data-testid={`find-shop-${id}`} onClick={()=>{setCurrent(prev=>({...prev,...a}))}} style={{padding:10,margin:10,borderRadius:20,cursor:'pointer',backgroundColor:status?'var(--sc-active)':'var(--sc-surface-2)'}} >
                                <h4>{name}</h4>
                                {inThisFranchise
                                    ?<div style={styles.note} >เป็นสาขาของแฟรนไชส์นี้อยู่แล้ว</div>
                                    :otherFranchiseId
                                        ?<div style={styles.note} >อยู่แฟรนไชส์อื่น (ผูกแล้วจะถามยืนยันการย้าย)</div>
                                        :null
                                }
                            </div>
                        </Col>
            })}
        </Row>
      </Modal.Body>
      <FooterButton {...{ onHide:close, submit:check }} />
    </Modal>
  );
};

const styles = {
    note : {
        fontSize:13, color:'var(--sc-text-2)'
    },
    container : {
        height:'65vh',overflowY:'auto', padding:0, margin:0
    },
    container2 : {
        display:'flex', position:'sticky', top:0, backgroundColor:'var(--sc-surface)', padding:10
    },
}
export default Modal_FindShop;
