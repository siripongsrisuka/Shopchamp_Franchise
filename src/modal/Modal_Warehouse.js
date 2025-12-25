import React, { useState, useRef } from "react";
import {
  Button,
  Row,
  Col,
  Modal,
  Image,
  Table,
  Form
} from "react-bootstrap";
import { colors, initialAlert } from "../configs";
import { DeleteButton, FooterButton, InputArea, InputText, OneButton, RootImage } from "../components";
import Modal_Alert from "./Modal_Alert";
import { manageCategory, findInArray,checkAddCategory,checkCategory2, twoDigitNumber, formatCurrency, } from "../Utility/function";
import Modal_FlatListTwoColumn from "./Modal_FlatListTwoColumn";
import { useSelector } from "react-redux";
import { reverseSort } from "../Utility/sort";
import Modal_TwoInput from "./Modal_TwoInput";

const { darkGray, softWhite,  } = colors;

const options = [
    { id: '1', name: 'เปิดใช้งาน' , value:true },
    { id: '2', name: 'ปิดใช้งาน' , value:false },
];

function Modal_Warehouse({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  size='lg',
  warehouseCategory,
  submit,
  current,
  setCurrent,
  deleteItem
}) {
    const { name, sku, barcode, detail, imageId, id, unit, category, broths, brothStatus,
      price,
      pointStatus,
      stockCountStatus,
      customQtyStatus,
      customPriceStatus,
      priceLevelStatus,
      priceLevel
     } = current;
    const [category_Modal, setCategory_Modal] = useState(false) //category modal
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [alert_Modal, setAlert_Modal] = useState(initialAlert);
    const { status, content, onClick, variant} = alert_Modal;


  // 200%
  async function confirm(){
      if(!name)return ('กรุณาใส่ชื่อ');
      if(!price)return ('กรุณาใส่ราคา');
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

    const handleInputChange = (field) => (event) => {
      setCurrent((prevState) => ({
        ...prevState,
        [field]: event.target.value,
      }));
    };

    const initialNewPriceLevel = { qty:'', price:'', status:false };
    const [newPriceLevel, setNewPriceLevel] = useState(initialNewPriceLevel);
    const [priceLevel_Modal, setPriceLevel_Modal] = useState(false);

    const addPriceLevel = () =>{
        const { qty, price } = newPriceLevel;
        if(!qty) return alert('กรุณาใส่จำนวนสินค้า');
        if(!price) return alert('กรุณาใส่ราคาสินค้า');
        if(priceLevel.some(a=>a.qty === Number(qty))) return alert('จำนวนสินค้าซ้ำกัน ไม่สามารถเพิ่มระดับราคานี้ได้');
        setCurrent(prev=>({...prev,priceLevel:reverseSort('qty',[...priceLevel,{ qty:Number(qty), price:Number(price) }])}))
        setNewPriceLevel(initialNewPriceLevel);
        setPriceLevel_Modal(false);

    };
    

    const deletePriceLevel = (data) =>{
        const { price, qty } = data;
        setAlert_Modal({ status:true, content:`ลบเรทราคา ${price}`, onClick:()=>{setAlert_Modal(initialAlert);setCurrent(prev=>({...prev,priceLevel:reverseSort('qty',prev.priceLevel.filter(a=>a.qty !== qty))}))}, variant:'danger' })
    };

    function closePriceLevelModal(){
        setPriceLevel_Modal(false)
        setNewPriceLevel(initialNewPriceLevel)
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
        <h2><b>สร้างสินค้า</b></h2>
        
      </Modal.Header>
      <Modal.Body  >
          <Modal_TwoInput
              show={priceLevel_Modal}
              header='เพิ่มระดับราคา'
              onHide={closePriceLevelModal}
              onChange1={(value)=>{setNewPriceLevel(prev=>({...prev,qty:value}))}}
              value1={newPriceLevel.qty}
              placeholder1='จำนวนสินค้า'
              onChange2={(value)=>{setNewPriceLevel(prev=>({...prev,price:value}))}}
              value2={newPriceLevel.price}
              placeholder2='ราคาต่อชิ้น'
              onClick={addPriceLevel}
              rightText ='เพิ่มระดับราคา'
          />
          <Modal_Alert
              show={status}
              onHide={()=>{setAlert_Modal(initialAlert)}}
              onClick={onClick}
              content={content}
              header='คำเตือน'
              variant={variant}
          />
          <Modal_FlatListTwoColumn 
            show={category_Modal}
            header='เลือกหมวดหมู่ที่ต้องการ'
            onHide={()=>{setCategory_Modal(false)}}
            onClick={(value)=>{setCurrent(prev=>({...prev,category:manageCategory(selectedCategory,category||[],value)}));setCategory_Modal(false)}}
            value={selectedCategory}
          />

        <Row style={styles.container2}>
            <Col sm='3' >รูปสินค้า</Col>
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
              placeholder="ชื่อสินค้า"
              onChange={handleInputChange('name')}
              value={name}
              strict={true}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='price'
              placeholder="ราคาขาย"
              onChange={handleInputChange('price')}
              value={price}
              strict={true}
            />
        </Col>
        <Row  >
          <Col md='3' >
              ราคาขายส่ง
          </Col>
          <Col md='9' >
              <Form.Select 
                  aria-label="Default select example" 
                  value={priceLevelStatus} 
                  onChange={(event)=>{setCurrent(prev=>({...prev,priceLevelStatus: event.target.value==='true' ? true : false }))}}
                  style={{width:'200px'}} 
              >
                  {options.map((item,index)=>{
                      return <option key={index} value={item.value}>{item.name}</option>
                  })}
              </Form.Select>
              <br/>
              {priceLevelStatus
                  ?<React.Fragment>
                        <OneButton {...{ text:'เพิ่มระดับราคา', submit:()=>{setPriceLevel_Modal(true)} }} />
                        <br/><br/>
                        {priceLevel.length >0
                            ?<Table striped bordered hover responsive  variant="light"   >
                                  <thead  >
                                  <tr>
                                      <th style={styles.container4}>จำนวน</th>
                                      <th style={styles.container5}>ราคาต่อชิ้น</th>
                                      <th style={styles.container5}>ราคาขาย</th>
                                      <th style={styles.container5}>ลบ</th>
                                  </tr>
                                  </thead>
                                  <tbody  >
                                    {priceLevel.map((item, index) => {
                                        const { qty, price } = item;
                                        return <tr   key={index} >
                                                    <td style={styles.container6}>{formatCurrency(qty)}</td>
                                                    <td style={styles.container6}>{formatCurrency(price)}</td>
                                                    <td style={styles.container6}>{formatCurrency(qty * price)}</td>
                                                    <td style={styles.container6}>
                                                      <DeleteButton {...{ text:'ลบ', submit:()=>{deletePriceLevel(item)} }} />
                                                    </td>
                                                </tr>
                                    })}
                                  </tbody>
                              </Table>
                            :null
                        }
                  </React.Fragment>
                  :null
              }
            

          </Col>
      </Row>
      <br/>
        <Col sm='12'>
            <InputText
              name='unit'
              placeholder="หน่วย"
              onChange={handleInputChange('unit')}
              value={unit}
              strict={true}
            />
        </Col>
        <Col sm='12'>
            <InputText
              name='barcode'
              placeholder="บาร์โค้ด"
              onChange={handleInputChange('barcode')}
              value={barcode}
            />
        </Col>
        <Row  >
          <Col md='3' >
              สะสมแต้ม
          </Col>
          <Col md='9' >
          <Form.Select 
              aria-label="Default select example" 
              value={pointStatus} 
              onChange={(event)=>{setCurrent(prev=>({...prev,pointStatus: event.target.value==='true' ? true : false }))}}
              style={{width:'200px'}} 
          >
              {options.map((item,index)=>{
                  return <option key={index} value={item.id}>{item.name}</option>
              })}
          </Form.Select>
          </Col>
      </Row>
      <br/>
      <Row  >
          <Col md='3' >
              นับสต๊อก
          </Col>
          <Col md='9' >
          <Form.Select 
              aria-label="Default select example" 
              value={stockCountStatus} 
              onChange={(event)=>{setCurrent(prev=>({...prev,stockCountStatus: event.target.value==='true' ? true : false }))}}
              style={{width:'200px'}} 
          >
              {options.map((item,index)=>{
                  return <option key={index} value={item.value}>{item.name}</option>
              })}
          </Form.Select>
          </Col>
      </Row>
      <br/>
      <Row  >
          <Col md='3' >
              กำหนดจำนวนเอง
          </Col>
          <Col md='9' >
          <Form.Select 
              aria-label="Default select example" 
              value={customQtyStatus} 
              onChange={(event)=>{setCurrent(prev=>({...prev,customQtyStatus: event.target.value==='true' ? true : false }))}}
              style={{width:'200px'}} 
          >
              {options.map((item,index)=>{
                  return <option key={index} value={item.value}>{item.name}</option>
              })}
          </Form.Select>
          </Col>
      </Row>
      <br/>
            <Row  >
          <Col md='3' >
              กำหนดราคาขายเอง
          </Col>
          <Col md='9' >
          <Form.Select 
              aria-label="Default select example" 
              value={customPriceStatus} 
              onChange={(event)=>{setCurrent(prev=>({...prev,customPriceStatus: event.target.value==='true' ? true : false }))}}
              style={{width:'200px'}} 
          >
              {options.map((item,index)=>{
                  return <option key={index} value={item.value}>{item.name}</option>
              })}
          </Form.Select>
          </Col>
      </Row>
      <br/>
        <Row style={styles.container2} >
            <Col sm='3' >
              กำหนดหมวดหมู่สินค้า
              <DeleteButton {...{ text:'ล้างหมวดหมู่', submit:()=>{setCurrent(prev=>({...prev,category:[]}))} }} />
            </Col>
            <Col sm='9'>
            {warehouseCategory?.length >0
                    ?category.length >0
                        ?category.map((item,index)=>{
                            let res = []
                            const { level, name, } = item;
                            const value = findInArray(warehouseCategory,'level',level).value
                            const selectedSmart = findInArray(warehouseCategory,'level',level+1) // เพื่อตรวจดูว่ามันมีชั้นถัดไปไหม
                            if(selectedSmart && selectedSmart.level){ // ใช้ตรวจสอบว่าชั้นถัดไป มีตรงกับ above ก่อนหน้ามั้ย
                                res = checkCategory2(category,selectedSmart)
                            }
                            return(
                              <div key={index} sm='6'  >
                                <Button variant="light" onClick={()=>{setSelectedCategory(value);setCategory_Modal(true)}} style={styles.container} >
                                  <div style={styles.container3} >
                                    <h4><b>{name}</b></h4>
                                    <h6 style={styles.text}>หมวดหมู่ระดับ {level}</h6>
                                  </div>
                                </Button>
                                {category.length === index +1  // เพื่อให้แสดงเฉพาะตัวสุดท้าย
                                    ?res.length >0
                                        ?<Button variant="light" onClick={()=>{setSelectedCategory(res);setCategory_Modal(true)}} style={styles.container} >
                                          <div style={styles.container3} >
                                            <h4><b>--ยังไม่ได้กำหนด--</b></h4>
                                            <h6 style={styles.text}>หมวดหมู่ระดับ {level+1}</h6>
                                          </div>
                                        </Button>
                                        :null
                                    :null
                                }
                              </div>
                            )
                        })
                        :<div sm='6' onClick={()=>{setSelectedCategory(checkAddCategory(warehouseCategory,findInArray(warehouseCategory,'level',1),category,()=>{setCategory_Modal(true)}))}}  style={styles.container3} >
                            <Button variant="light"  style={styles.container} >
                              <div style={styles.container3} >
                                <h4><b>--ยังไม่ได้กำหนด--</b></h4>
                                <h6 style={styles.text}>หมวดหมู่ระดับ 1</h6>
                              </div>
                            </Button>
                        </div>
                    :<div sm='6'  style={styles.container3} >
                        <Button variant="light"  style={styles.container} >
                          <div style={styles.container3} >
                            <h4><b>--ยังไม่ได้กำหนด--</b></h4>
                          </div>
                        </Button>
                    </div>
                }
            </Col>
        </Row>
  
        {id
            ?<Row style={styles.container2} >
                <Col sm='3' >
                  ลบรายการสินค้า
                </Col>
                <Col sm='9' >
                  <DeleteButton {...{ text:'ลบรายการสินค้า', submit:()=>{setAlert_Modal({ status:true, content:`ลบ ${name}`, onClick:()=>{setAlert_Modal(initialAlert);deleteItem(id)}, variant:'danger' })} }} />
                </Col>
            </Row>
            :null
        }
        
        {/* ================= End of Restautrant ================== */}
      </Modal.Body>
      <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};

const styles = {
    container : {
        border: '1px solid #dee2e6',borderRadius:20,backgroundColor:softWhite,padding:0,width:'100%',marginBottom:'1rem'
    },
    container2 : {
      marginBottom:'1rem'
    },
    container3 : {
      padding:10
    },
    container4 : {
      width:'50px', textAlign:'center'
    },
    container5 : {
      width:'15%', minWidth:'150px', textAlign:'center'
    },
    container6 : {
      width:'25%', minWidth:'200px', textAlign:'center'
    },
    container7 : {
      textAlign:'center'
    },
    image : {
      width:'100%',maxWidth:250,height:undefined,aspectRatio:1 , objectFit: 'cover'
    },
    text : {
      color:darkGray
    }
}

export default Modal_Warehouse;
