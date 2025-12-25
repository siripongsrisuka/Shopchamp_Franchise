import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
} from "react-bootstrap";
import { colors } from "../configs";
import { createLabel, summary } from "../Utility/function";
import ChartScreen from "../components/ChartScreen";
import { Button } from 'rsuite';
import { normalSort } from "../Utility/sort";
import TimeControlBill from "../components/TimeControlBill";

const { lightGray, white } = colors;
const translates = {
  '1':'01:00 น.',
  '2':'02:00 น.',
  '3':'03:00 น.',
  '4':'04:00 น.',
  '5':'05:00 น.',
  '6':'06:00 น.',
  '7':'07:00 น.',
  '8':'08:00 น.',
  '9':'09:00 น.',
  '10':'10:00 น.',
  '11':'11:00 น.',
  '12':'12:00 น.',
  '13':'13:00 น.',
  '14':'14:00 น.',
  '15':'15:00 น.',
  '16':'16:00 น.',
  '17':'17:00 น.',
  '18':'18:00 น.',
  '19':'19:00 น.',
  '20':'20:00 น.',
  '21':'21:00 น.',
  '22':'22:00 น.',
  '23':'23:00 น.',
  '0':'00:00 น.',
};

function DashboardScreen() {
    const { shops } = useSelector((state)=> state.shop);
    const { selectedBills } = useSelector((state)=> state.bill);

  const { shopWithSale, shopWithoutSale, topSaleProducts, datasets, totalBill, totalPrice, averageSale, allShop, store } = useMemo(()=> {
    const shopWithSale = new Set(selectedBills.map(a=>a.shopId)).size;
    const shopWithoutSale = shops.length - shopWithSale;
    const products = selectedBills.flatMap(a=>a.product);
    const productMap = new Map();
    for(const product of products){
        const existing = productMap.get(product.id);
        if(existing){
            existing.net += product.net;
            productMap.set(product.id, existing);
        }
        else {
            productMap.set(product.id, { name: product.name, net: product.net });
        }

     
    };

    const topSaleProducts = normalSort('net',[...productMap.values()]).slice(0,10);
    const shopMap = new Map(shops.map(a=>[a.id,a.name]));
    const topSaleShopsMap = new Map();
    for(const bill of selectedBills){
      if(topSaleShopsMap.has(bill.shopId)){
        const existing = topSaleShopsMap.get(bill.shopId);
        existing.net += bill.net;
        topSaleShopsMap.set(bill.shopId, existing);
      }
      else {
        topSaleShopsMap.set(bill.shopId, { name: shopMap.get(bill.shopId), net: bill.net });
      }
    }
    const store = normalSort('net',[...topSaleShopsMap.values()]).slice(0,10);

    const datasets = [] // ยอดขายรายชั่วโมง
    const labels = createLabel(0)
    for (const item of labels) {
        let arr = selectedBills.filter((a)=>{return(new Date(a.dateTime).getHours()==item)})
        datasets.push({name:translates[item],ยอดขายรายชั่วโมง:parseFloat(summary(arr, 'net').toFixed(2)),billQty:arr.length})
    };

    const totalPrice = summary(selectedBills, 'net');
    const totalBill = selectedBills.length;
    const averageSale = totalBill > 0 ? totalPrice / totalBill : 0;
    const allShop = shops.length
    return {  
      shopWithSale,
      shopWithoutSale,
      topSaleProducts,
      totalPrice,
      totalBill,
      datasets,
      averageSale:parseFloat(averageSale.toFixed(2)),
      allShop,
      store
    };

  }, [selectedBills, shops]);



  
  return (
    <div  >
      <h1>ภาพรวมธุรกิจ</h1>
      <TimeControlBill/>
      <Row  style={styles.container} >
          <Col  lg={12} >
            <div style={styles.container2} >
                <div style={styles.container3} >
                  <h4>ยอดขายรวม : <b>{totalPrice}</b> บาท</h4>
                </div>
                <ChartScreen chart={datasets} bar='ยอดขายรายชั่วโมง' name='เวลา' content="ยอดขาย" />
            </div>
          </Col>
      </Row>
      <Row style={styles.container4}>
      <Col md='12' lg='12' style={styles.container5} >
                <div style={styles.container6}>
                    <h5><b>Summary</b></h5>
                    <Row>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8} color="red" appearance="primary" >
                          ยอดขายรวม
                            <h6>{totalPrice}</h6>
                          </Button>
                        </Col>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8} color="orange" appearance="primary" >
                          จำนวนใบเสร็จ
                            <h6>{totalBill}</h6>
                            </Button>
                        </Col>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8} color="yellow" appearance="primary" >
                          Busket size
                            <h6>{averageSale}</h6>
                            </Button>
                        </Col>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8}color="cyan" appearance="primary" >
                          ร้านทั้งหมด
                            <h6>{allShop}</h6>
                          </Button>
                        </Col>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8}color="blue" appearance="primary" >
                          ร้านที่มียอดขาย
                            <h6>{shopWithSale}</h6>
                          </Button>
                        </Col>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8}color="violet" appearance="primary" >
                          ร้านที่ไม่มียอด
                            <h6>{shopWithoutSale}</h6>
                          </Button>
                        </Col>
                    </Row>
                </div>
            </Col>
      </Row>
        <Row style={styles.container4}>
            <Col md='12' lg='12' style={styles.container5} >
                <div style={styles.container6} >
                    <h5><b>Top 10</b></h5>
                    <Row>
                          <Col  xs='12' sm='12' md='12' lg='6'   style={{cursor:'pointer',marginBottom:'1rem'}} >
                              <h5>สาขา</h5>
                                {store.map((a,i)=>{
                                  return <Row key={i} >
                                            <Col>
                                            {a.name}
                                            </Col>
                                            <Col>
                                            {a.net}
                                            </Col>
                                        </Row>
                                })}
                          </Col>
                          <Col  xs='12' sm='12' md='12' lg='6'   style={{cursor:'pointer',marginBottom:'1rem'}} >
                              <h5>สินค้า</h5>
                                {topSaleProducts.map((a,i)=>{
                                  return <Row key={i} >
                                            <Col>
                                            {a.name}
                                            </Col>
                                            <Col>
                                            {a.net}
                                            </Col>
                                        </Row>
                                })}
                          </Col>
                    </Row>
                </div>
                
            </Col>
        </Row>
    </div>
  );
};

const styles = {
  container : {
    backgroundColor:white,borderRadius:20,marginLeft:0,marginRight:0,marginBottom:20
  },
  container2 : {
    backgroundColor:white,margin:5,padding:10,borderRadius:20,height:'400px',marginRight:0
  },
  container3 : {
    display:'flex',justifyContent:'space-between',alignItems:'center'
  },
  container4 : {
    borderRadius: 20, marginLeft: 20, marginRight: 20,padding:0
  },
  container5 : {
    padding:0,paddingRight:5
  },
  container6 : {
    border: `1px solid ${lightGray}`, borderRadius: 20, padding: 10,backgroundColor:white,  marginBottom:20
  },
  container7 : {
    marginBottom:'1rem'
  },
  container8 : {
    width:'100%',display:'flex',flexDirection:'column'
  },
  container9 : {
    paddingTop:20,paddingBottom:10
  },
  container10 : {
    display:'flex',flexDirection:'row',alignItems:'center',paddingTop:3,paddingBottom:3
  },
  container11 : {
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
  },
  container12 : {
    display:'flex',alignItems:'flex-end',paddingRight:5
  }
}

export default DashboardScreen;