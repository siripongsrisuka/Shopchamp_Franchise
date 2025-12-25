import React from "react";
import { Modal } from "react-bootstrap";
import { FloatingText, OneButton } from "../components";

function Modal_TwoInput({
    backdrop=false, // true/false/static
    animation=true,
    show,
    onHide,
    centered=true,
    header,
    onChange1,
    value1,
    placeholder1='ตั้งชื่อหมวดหมู่สินค้า',
    onChange2,
    value2,
    placeholder2='ตั้งชื่อหมวดหมู่สินค้า',
    onClick,
    rightText ='บันทึก'
}) {

    function handleChange1(event){
        event.preventDefault()
        onChange1(event.target.value)
    }

    function handleChange2(event){
        event.preventDefault()
        onChange2(event.target.value)
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
        <Modal.Header closeButton>{header}</Modal.Header>
        <Modal.Body style={styles.container}  >
        <FloatingText
            name={placeholder1}
            placeholder={placeholder1}
            onChange={handleChange1}
            value={value1}
        />
        <br/>
        <FloatingText
            name={placeholder2}
            placeholder={placeholder2}
            onChange={handleChange2}
            value={value2}
        />
        </Modal.Body>
        <Modal.Footer>
            <OneButton {...{ text:'ยกเลิก', variant:"secondary", submit:onHide  }} />
            <OneButton {...{ text:rightText, variant:"success", submit:onClick  }} />
        </Modal.Footer>
    </Modal>
    );
}
const styles = {
    container : {
        display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',zIndex:999
    }
}

export default Modal_TwoInput;
