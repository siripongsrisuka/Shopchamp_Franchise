import React, { useRef } from "react";
import {
  Button,
  Row,
  Col,
  Modal,
  Image,
} from "react-bootstrap";
import { FooterButton, InputText, RootImage } from "../components";

function Modal_Franchise({
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
    const { name, imageId } = current;


    function confirm(){
        if(!name) return alert('กรุณาใส่ชื่อ');
        submit()
    };

    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
      fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
      const file = e.target.files[0]; // Get the selected file
  
      if (file) {
        // Create a FileReader to read the file
        const reader = new FileReader();
        reader.onloadend = async () => {
          // setImage(reader.result); // Set the image data as the result of FileReader
         setCurrent(prev=>({...prev,imageId:reader.result}))
        };
  
        reader.readAsDataURL(file); // Convert file to a base64 string
      }
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
      <Modal.Header closeButton>
        <h2><b>โปรไฟล์</b></h2>
      </Modal.Header>
      <Modal.Body  >
        <Row style={styles.container}>
            <Col sm='3' >โลโก้แบรนด์</Col>
            <Col sm='9' >
                <form >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }} // Hide the default file input
                    />
                    <Button onClick={handleButtonClick} variant="light">
                      {imageId
                          ?<Image style={styles.image} src={imageId} />
                          :<RootImage style={styles.image} />
                      }
                    </Button>
                  </form>
            </Col>
        </Row>
        <Col sm='12'>
            <InputText
              name='Name'
              placeholder="ชื่อแบรนด์"
              onChange={(event)=>{setCurrent(prev=>({...prev,name:event.target.value}))}}
              value={name}
              strict={true}
            />
        </Col>
   
      </Modal.Body>
      <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};

const styles = {
    container : {
        marginBottom:'1rem'
    },
    container2 : {
        width:'100%',maxWidth:300,height:undefined,aspectRatio:1
    },
    image : {
      width:'100%',maxWidth:300,height:undefined,aspectRatio:1 , objectFit: 'cover'
    },
    
}

export default Modal_Franchise;
