import React, { useState } from "react";
import {
  Row,
  Col,
  Modal,
  Form
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { colors } from "../configs";
import { franchiseStaffFind } from "../api/franchiseApi";
import { apiErrorMessage } from "../api/posApi";
import { FooterButton, OneButton } from "../components";
import Modal_Loading from "./Modal_Loading";

const { softWhite, three, white } = colors;

function Modal_FindHuman({
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
    const [profiles, setProfiles] = useState([]);
    const { id:humanId } = current;
    const [loading, setLoading] = useState(false);
    const { franchise:{ id:franchiseId } } = useSelector((state)=> state.franchise);

    function close(){
        setPhoneNumber('')
        onHide()
    }

    function check(){
        if(!humanId)return alert('กรุณาเลือกโปรไฟล์');
        submit()
        setProfiles([])
    };


    // DEV-0002 ก้อน 9f: `franchise.staffFind` (census 282) · ได้แค่ id ชื่อ เบอร์ รูป (เดิม profile ทั้ง doc SF-16)
    async function findProfile(){
        setLoading(true);
        try {
            const res = await franchiseStaffFind({ franchiseId, tel: phoneNumber.trim() });
            setProfiles((res.profiles || []).map(({ alreadyStaff, ...p })=>({ ...p, alreadyStaff })))
            setPhoneNumber('')
        } catch (error) {
            alert(apiErrorMessage(error, 'ค้นบัญชีไม่สำเร็จ'))
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
            {profiles.length>0
                ?<OneButton {...{ text:"ล้าง", submit:()=>{setProfiles([]);setCurrent(prev=>({...prev,id:''}))}, variant:'danger' }} />
                :<OneButton {...{ text:'ค้นหา', submit:findProfile  }} />
            }
            
        </div>
        <Row  >
            {profiles.map((a)=>{
                const { name, id, alreadyStaff } = a;
                let status = humanId===id
                return <Col key={id} md='6' >
                            <div data-testid={`find-human-${id}`} onClick={()=>{const { alreadyStaff:_x, ...p } = a; setCurrent(prev=>({...prev,...p}))}} style={{padding:10,margin:10,borderRadius:20,cursor:'pointer',backgroundColor:status?'var(--sc-active)':'var(--sc-surface-2)'}} >
                                <h4>{name}</h4>
                                {alreadyStaff ? <div style={{fontSize:13,color:'var(--sc-text-2)'}} >อยู่ในรายชื่อแล้ว (จะเปิดสิทธิ์เดิมให้แก้)</div> : null}
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
    container : {
        height:'65vh',overflowY:'auto', padding:0, margin:0
    },
    container2 : {
        display:'flex', position:'sticky', top:0, backgroundColor:'var(--sc-surface)', padding:10
    },
}
export default Modal_FindHuman;
