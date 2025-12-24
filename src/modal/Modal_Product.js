import React from "react";
import {
  Button,
  Modal,
  Table
} from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import { formatCurrency } from "../Utility/function";

function Modal_Product({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  product
}) {
  const { t } = useTranslation();

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      fullscreen={true}
    >
      <Modal.Header closeButton>
        <h2><b>{t('compare.itemByCategory')}</b></h2>
      </Modal.Header>

      <Modal.Body  >
        <Table   hover responsive  variant="light"   >
            <thead  >
            <tr>
                <th style={styles.container} >No.</th>
                <th style={styles.container2} >{t('compare.list')}</th>
                <th style={styles.container2} >{t('compare.saleQty')}</th>
                <th style={styles.container2}>{t('compare.growth')}(%)</th>
                <th style={styles.container2}>{t('compare.currentMonthSale')}</th>
                <th style={styles.container2}>{t('compare.lastMonthSale')}</th>
            </tr>
            </thead>
            <tbody  >
            {product.map((item, index) => {
                return  <tr   key={index} >
                            <td style={styles.container} >{index+1}.</td>
                            <td >{item.name}</td>
                            <td style={styles.container2} >{item.qty}</td>
                            <td style={{textAlign:'center',color:item.color,width:'13%'}} >{formatCurrency(item.rate)}</td>
                            <td style={styles.container2}>{formatCurrency(item.currentSale)}</td>
                            <td style={styles.container2}>{formatCurrency(item.previousSale)}</td>
                        </tr>
            })}
            </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} style={{minWidth:'150px'}} variant="secondary">{t('compare.close')}</Button>
    </Modal.Footer>
    </Modal>
  );
};

const styles = {
  container : {
      textAlign:'center', width: '9%', minWidth:'50px'
  },
  container2 : {
      textAlign:'center', width:'13%', textAlign:'center',minWidth:'150px'
  }
};

export default Modal_Product;
