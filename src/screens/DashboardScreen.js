import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
} from "react-bootstrap";
import { colors } from "../configs";
import { createLabel } from "../Utility/function";
import ChartScreen from "../components/ChartScreen";
import { ScMetricCard } from "../components/ui";
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
    const { sales } = useSelector((state)=> state.bill);

  // DEV-0002 Pack เคาะ 2026-11-07: ตัวเลขทุกตัวมาจาก server `franchise.breakdown` (สูตรกลาง) · จอแค่เลือก 10 อันดับและจัดรูป
  //   ยอดสินค้า = หลังกระจายส่วนลดท้ายบิล (netAfterBillDiscount) · ชั่วโมง = เวลาไทยของเวลาขาย (เดิมเวลาเครื่องที่เปิดเว็บ)
  const { shopWithSale, shopWithoutSale, topSaleProducts, datasets, totalBill, totalPrice, averageSale, allShop, store } = useMemo(()=> {
    const t = sales.totals || {};
    const shopMap = new Map(shops.map(a=>[a.id,a.name]));
    const topSaleProducts = (sales.items || []).slice(0,10).map((a)=>({ name: a.name, net: a.netAfterBillDiscount }));
    const store = (sales.shops || []).filter((a)=>a.billQty>0).slice(0,10).map((a)=>({ name: shopMap.get(a.shopId) || a.shopId, net: a.totalSale }));
    const byHour = new Map((sales.hours || []).map((h)=>[Number(h.key), h]));
    const datasets = [] // ยอดขายรายชั่วโมง
    for (const item of createLabel(0)) {
        const h = byHour.get(Number(item));
        datasets.push({name:translates[item],ยอดขายรายชั่วโมง:h ? h.totalSale : 0,billQty:h ? h.billQty : 0})
    };
    const allShop = Number(t.shopQty) || shops.length;
    const shopWithSale = Number(t.shopWithSale) || 0;
    return {
      shopWithSale,
      shopWithoutSale: Math.max(0, allShop - (sales.shops || []).filter((a)=>a.inFranchise && a.billQty>0).length),
      topSaleProducts,
      totalPrice: Number(t.totalSale) || 0,
      totalBill: Number(t.billQty) || 0,
      datasets,
      averageSale: Number(t.average) || 0,
      allShop,
      store
    };

  }, [sales, shops]);



  
  return (
    <div  >
      <div className="sc-pagehead"><h1>ภาพรวมธุรกิจ</h1></div>
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
                    <div className="sc-cards">
                        <ScMetricCard label="ยอดขายรวม" value={totalPrice} icon="bi bi-cash-stack" tone="danger" testId="dashboard-total-price" />
                        <ScMetricCard label="จำนวนใบเสร็จ" value={totalBill} icon="bi bi-receipt" tone="warning" testId="dashboard-total-bill" />
                        <ScMetricCard label="Busket size" value={averageSale} icon="bi bi-basket" tone="warning" testId="dashboard-average-sale" />
                        <ScMetricCard label="ร้านทั้งหมด" value={allShop} icon="bi bi-shop" tone="info" testId="dashboard-all-shop" />
                        <ScMetricCard label="ร้านที่มียอดขาย" value={shopWithSale} icon="bi bi-graph-up-arrow" tone="success" testId="dashboard-shop-with-sale" />
                        <ScMetricCard label="ร้านที่ไม่มียอด" value={shopWithoutSale} icon="bi bi-graph-down" tone="purple" testId="dashboard-shop-without-sale" />
                    </div>
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
    backgroundColor:'var(--sc-surface)',border:'0.5px solid var(--sc-line)',boxShadow:'var(--sc-shadow)',borderRadius:'var(--sc-radius-lg)',marginLeft:0,marginRight:0,marginBottom:20
  },
  container2 : {
    backgroundColor:'var(--sc-surface)',margin:5,padding:10,borderRadius:'var(--sc-radius-lg)',height:'400px',marginRight:0
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
    border: '0.5px solid var(--sc-line)', borderRadius: 'var(--sc-radius-lg)', boxShadow:'var(--sc-shadow)', padding: 10,backgroundColor:'var(--sc-surface)',  marginBottom:20
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