import React from "react";
import {
  Button,
  Modal,
  Table
} from "react-bootstrap";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { initialCheckOut } from "../configs";
import { aggregateQuantities2, formatCurrency } from "../Utility/function";
import { useTranslation } from 'react-i18next';


function Modal_Receipt({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  data,
}) {
    const { t } = useTranslation();
    const { timestamp, receiptNumber, product, net, discount, totalPrice, qty,
        fine, rounding, tableName, serviceCharge, vat, paymentChannel, receive, change, currentInfo, campaign } = {...initialCheckOut,...data};

    let productForPrint = aggregateQuantities2(product)
    let thisCurrent = currentInfo?currentInfo.filter(a=>a.showOnReceipt):[];

  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
      // size={size}
      fullscreen={true}
    >
       
      <Modal.Header closeButton>
        <h2><b>{t('mReceipt.receipt')}</b></h2>
      </Modal.Header>

      <Modal.Body  >
            <h6>{t('mReceipt.date')} {stringDateTimeReceipt(timestamp)}</h6>
            <h6>{t('mReceipt.receiptNumber')} : {receiptNumber}</h6>
            {thisCurrent.length>0
                ?thisCurrent.map(({ name, value })=>{
                    return <h6>{name} : {value}</h6>
                    
                })
                :<h6>{t('mReceipt.customer')} : {tableName}</h6>
            }
            <h6>{t('mReceipt.qty')} : {qty}</h6>
            <h6>{t('mReceipt.totalPrice')} : {formatCurrency(totalPrice)||0}</h6>
            {campaign.map(({ name, discount })=>{
                    return <h6>{name} : {discount}</h6>
                    
                })}
            <h6>{t('mReceipt.discount')} : {discount||0}</h6>
            <h6>{t('mReceipt.fine')} : {fine||0}</h6>
            <h6>{t('mReceipt.serviceCharge')} : {serviceCharge||0}</h6>
            <h6>{t('mReceipt.vat')} : {vat||0}</h6>
            <h6>{t('mReceipt.rounding')} : {formatCurrency(rounding) ||0}</h6>
            <h6>{t('mReceipt.net')} : {formatCurrency(net)}</h6>
            <h6>{t('mReceipt.paymentType')}  : {paymentChannel.map(a=>a.name).join(',')}</h6>
            <h6>{t('mReceipt.receive')}  : {formatCurrency(receive) ||0}</h6>
            <h6>{t('mReceipt.change')} : {formatCurrency(change) ||0}</h6>
                <React.Fragment>
                    <h4>{t('mReceipt.list')}</h4>
                    <Table striped bordered hover responsive  variant="light"   >
                      <thead  >
                        <tr>
                          <th style={styles.text} >No.</th>
                          <th style={styles.text2} >{t('mReceipt.list')}</th>
                          <th style={styles.text2} >{t('mReceipt.choice')}</th>
                          <th style={styles.text2} >{t('mReceipt.qty')}</th>
                          <th style={styles.text2} >{t('mReceipt.sale')}</th>
                        </tr>
                      </thead>
                      <tbody  >
                        {productForPrint.map((item, index) => {
                            const { name, qty, totalPrice, option  } = item;
                            let thisOption = option.map(a=>a.choiceName)?.join('/')
                            return <tr  key={index} >
                                    <td style={styles.text}>{index+1}.</td>
                                    <td style={styles.text2}>{name}</td>
                                    <td style={styles.text2}>{thisOption}</td>
                                    <td style={styles.text2}>{qty}</td>
                                    <td style={styles.text2}>{formatCurrency(totalPrice)}</td>
                                    </tr>
                        })}
                      </tbody>
                    </Table>
                </React.Fragment>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} style={{minWidth:'150px'}} variant="secondary">{t('mReceipt.close')}</Button>
    </Modal.Footer>
    </Modal>
  );
};

const styles = {
    text : {
      width:'5%',
      textAlign:'center',
      // maxWidth:'12px',
      minWidth:'2rem',
    },
    text2 : {
      width:'20%',
      textAlign:'center',
      minWidth:'120px'
    }
}

export default Modal_Receipt;
