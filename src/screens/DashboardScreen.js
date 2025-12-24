import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
} from "react-bootstrap";
import { colors } from "../configs";
import { formatCurrency, summary } from "../Utility/function";
import ChartScreen from "../components/ChartScreen";
import { Button } from 'rsuite';
import { stringYMDHMS3 } from "../Utility/dateTime";
import { shopchampRestaurantAPI } from "../Utility/api";
import { Modal_Loading } from "../modal";
import { normalSort } from "../Utility/sort";

const { lightGray, white } = colors;


function DashboardScreen() {
    const { shop } = useSelector((state)=> state.shop);
    const [loading, setLoading] = useState(false);
    const [store, setStore] = useState([]);
    const [thisProvince, setThisProvince] = useState([]);
    const [region, setRegion] = useState([]);

  

  useEffect(()=>{
    fetchDashboard()
  },[])

  const [dashboardData, setDashboardData] = useState({ averageSale:0, datasets:[], shopWithSale:0, totalBill:0, totalPrice:0 });
  const { averageSale, datasets, shopWithSale, totalBill, totalPrice } = dashboardData;

  async function fetchDashboard(){
    setLoading(true);
    try {
      const { data, status } = await shopchampRestaurantAPI.post(
          "/franchise/dashboard/",
          { 
            billDate:[stringYMDHMS3(new Date())], 
            shopIds:shop.map(a=>a.id) 
          }
      );
      setDashboardData(data);

      const { newShop } = data;


      const shopData = new Map(shop.map(a=>[a.id,{ region:a.region, province:a.province, name:a.name }]));

      const newShopWithData = newShop.map(a=>({...a, ...(shopData.get(a.shopId)||{})}))

      setStore(normalSort('net',newShopWithData).slice(0,10));

  
      const newRegion = [].map(a=>({...a,net:summary(newShopWithData.filter(b=>b.region===a.id),'net')})).filter(b=>b.net>0)
      setRegion(normalSort('net',newRegion).slice(0,10))
  
      const newProvince = [].map(a=>({...a,net:summary(newShopWithData.filter(b=>b.province===a.id),'net')})).filter(b=>b.net>0)
      setThisProvince(normalSort('net',newProvince).slice(0,10))
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false)
    }

  }


  
  return (
    <div  >
      <h1>ภาพรวมธุรกิจ</h1>
      <Modal_Loading show={loading} />
      <Row  style={styles.container} >
          <Col  lg={12} >
            <div style={styles.container2} >
                <div style={styles.container3} >
                  <h4>ยอดขายรวม : <b>{formatCurrency(totalPrice)}</b> บาท</h4>
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
                            <h6>{formatCurrency(totalPrice)}</h6>
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
                            <h6>{formatCurrency(averageSale)}</h6>
                            </Button>
                        </Col>
                        <Col xs='12' sm='6' md='4' style={styles.container7} >
                          <Button style={styles.container8}color="cyan" appearance="primary" >
                          ร้านทั้งหมด
                            <h6>{shop.length}</h6>
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
                            <h6>{shop.length- shopWithSale}</h6>
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
                                            {formatCurrency(a.net)}
                                            </Col>
                                        </Row>
                                })}
                          </Col>
                          <Col  xs='12' sm='12' md='12' lg='6'  style={{cursor:'pointer',marginBottom:'1rem'}}>
                              <h5>จังหวัด</h5>
                                {thisProvince.map((a,i)=>{
                                  return <Row key={i} >
                                            <Col xs='6' >
                                            {a.name_th}
                                            </Col>
                                            <Col xs='6' >
                                            {formatCurrency(a.net)}
                                            </Col>
                                        </Row>
                                })}
                          </Col>
                          <Col  xs='12' sm='12' md='12' lg='6'  style={{cursor:'pointer',marginBottom:'1rem'}} >
                              <h5>ภูมิภาค</h5>
                                {region.map((a,i)=>{
                                  return <Row key={i} >
                                            <Col>
                                            {a.name}
                                            </Col>
                                            <Col>
                                            {formatCurrency(a.net)}
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