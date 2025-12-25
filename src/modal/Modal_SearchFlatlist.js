import React, { useState, useMemo } from "react";
import { Row, Col, Button, Modal, Form } from "react-bootstrap";
import { colors } from "../configs";
import { searchFilterFunction } from "../Utility/function";
import { FooterButton } from "../components";

const { darkTransparent2 } = colors;

function Modal_SearchFlatlist({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  header='',
  onClick,
  payload,
  thisKey = 'id',
  alertContent = 'กรุณาเลือกต้นแบบ BOM',
  searchKey = 'name'
}) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState({});
    const display = useMemo(()=>{
        if(!search){
            return payload
        }
        return searchFilterFunction(payload,search,searchKey)
    },[search,payload,searchKey]);

    function submit(){
        if(!selected[thisKey])return alert(alertContent);
        onClick(selected)
        close()
    };

    function close(){
        onHide()
        setSearch('')
        setSelected({})
    };

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={close}
      centered={centered}
      size="lg"
      style={{backgroundColor:darkTransparent2}}
    >
      <Modal.Header closeButton  >
        <b>{header}</b>
      </Modal.Header>
      <Modal.Body  >
        <Form.Control 
            type="text" 
            placeholder='ค้นหาเมนูด้วยชื่อ'
            onChange={(event)=>{setSearch(event.target.value)}}
            value={search}
        />
        <Row style={styles.container4} >
          <h6>ค้นพบ : {display.length} รายการ</h6>
            {display?.map((item,index)=>{
                const status = item[thisKey]===selected[thisKey]
                return(
                  <Col key={index} sm='6' style={styles.container} >
                    <Button onClick={()=>{setSelected(item)}} 
                        variant={status?'success':'light'}
                        style={styles.container2}
                     >
                        {item?.name}
                    </Button>
                  </Col>
                )
            })}
        </Row>
      </Modal.Body>
      <FooterButton {...{ onHide, submit }} />
    </Modal>
  );
};

const styles = {
    container : {
        display:'flex'
    },
    container2 : {
      width:'100%',marginBottom:10, display:'flex'
    },
    container4 : {
        minHeight:'55vh',maxHeight:'55vh',marginTop:'1rem', overflowY:'auto'
    }
}

export default Modal_SearchFlatlist;
