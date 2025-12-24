import React from "react";
import { Modal } from "react-bootstrap";
import { FloatingText, OneButton } from "../components";

function Modal_OneInput({
  backdrop=false, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  header,
  onChange,
  value,
  placeholder='ตั้งชื่อหมวดหมู่สินค้า',
  onClick,
  rightText ='บันทึก'
}) {

  function handleChange(event){
    event.preventDefault()
    onChange(event.target.value)
  }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      className='loading-screen'
    >
      <Modal.Header closeButton>
        <h3>{header}</h3>
      </Modal.Header>
      <Modal.Body style={styles.container}  >
        <FloatingText
            name={placeholder}
            placeholder={placeholder}
            onChange={handleChange}
            value={value}
        />
      </Modal.Body>
      <Modal.Footer>
            <OneButton {...{ text:'ยกเลิก', variant:"secondary", submit:onHide  }} />
            <OneButton {...{ text:rightText, variant:"success", submit:onClick  }} />
      </Modal.Footer>
    </Modal>
  );
};

const styles = {
  container : {
    display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999
  }
}

export default Modal_OneInput;