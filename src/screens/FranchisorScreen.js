import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Form,
  Row,
  Col, 
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
} from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import { chainStoreFranchise, initialAlert } from "../configs";
import { useSelector, useDispatch } from "react-redux";
import '../styles/Restaurant.css'
import { logout, updateCurrentFranchise } from "../redux/authSlice";
import { Modal_Alert } from "../modal";
import { Dropdown, Accordion } from 'rsuite';
import { transformData } from "../Utility/function";
import { fetchFranchise } from "../redux/franchiseSlice";
import { RootImage } from "../components";
import { fetchShopFranchise } from "../redux/shopSlice";
import { hasRight } from "../api/franchiseApi";
import { toastError } from "../Utility/function";

// DEV-0002 สีของเปลือกเมนูมาจาก token --sc-* (src/styles/theme.css)


function FranchisorScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { franchise : { imageId, type, id:franchiseId }, access, accessError, accessErrorCode } = useSelector((state)=> state.franchise);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [alert_Modal, setAlert_Modal] = useState(initialAlert);
  const { status, content, onClick, variant } = alert_Modal;
  const { profile } = useSelector((state)=> state.profile);
  const { id:profileId } = profile;
  const [short, setShort] = useState(false); // คือการย่อแถบข้าง

  useEffect(() => {  // เอาไว้กำหนด display ของ sidebar
    // Function to update the window width state
    dispatch(fetchFranchise(franchiseId));
    dispatch(fetchShopFranchise(franchiseId));

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Event listener to update the window width state on resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  

  // DEV-0002 ก้อน 9f: เมนูตามสิทธิ์ที่ server ตัดสิน (`franchise.get` › access) · ทีมงาน = ครบ (เดิมเทียบ uid ที่ฝังในเว็บ)
  //   access ยังไม่มา = เห็นแค่หัวข้อ (ไม่โชว์เมนูที่อาจไม่มีสิทธิ์)
  const { sideBar, listDisplay } = useMemo(()=>{
    const sideBar = chainStoreFranchise.filter(a=>a.label || hasRight(access, a.id))
    return {
      sideBar,
      listDisplay:transformData(sideBar.filter(a=>a.label!=='ออกจากระบบ'))
    }
  },[type,access])

  // จอแรก (Dashboard สิทธิ์ 100) · ไม่มีสิทธิ์ = พาไปเมนูแรกที่มีสิทธิ์ (server `franchise.breakdown` ตอบ 403 · 9f §1)
  const firstAllowed = useMemo(()=>sideBar.find(a=>a.to),[sideBar]);
  const path = location.pathname.replace(/\/+$/,'').toLowerCase();
  // ไม่ render จอลูกระหว่างรอพาไป (กัน Dashboard ยิง breakdown ก่อนย้ายจอ)
  const redirectTo = access && (path === '/franchisor' || path === '/franchisor/dashboard') && !hasRight(access,'100') && firstAllowed
    ? `/franchisor/${firstAllowed.to}` : '';
  useEffect(()=>{
    if(redirectTo) navigate(redirectTo, { replace:true });
  },[redirectTo]);

  // เปิดแฟรนไชส์ไม่ผ่าน (ไม่ใช่สมาชิก/ถูกปิด/ยังไม่เปิดใช้งาน) = กลับรายการ
  useEffect(()=>{
    if(accessError){
      toastError(accessError);
      if(accessErrorCode === 'not_franchise_member' || accessErrorCode === 'franchise_not_found'){
        backToList();
      }
    }
  },[accessError, accessErrorCode]);

  const noMenu = !!access && !firstAllowed;



    function exit(){
      dispatch(logout()).then(()=>{
        navigate('/')
      })
    };


  
    function backToList(){
      
      Promise.all([
        dispatch(updateCurrentFranchise('')),
        navigate('/franchiselist'),
        // dispatch(clearBill()),
        // dispatch(clearBom()),
        // dispatch(clearBrothAdds()),
        // dispatch(clearInbound()),
        // dispatch(clearProduct()),
        // dispatch(clearPurchase()),
        // dispatch(clearShop()),
        // dispatch(clearAdjust()),
        // dispatch(clearCut()),
        // dispatch(clearWarehouse()),

      ])
    }
  
  return (
    <div className="sc-page" style={styles.root} data-testid="screen-franchisor" >
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
        {windowWidth < 576 || short
                ?<div>
                  <div style={styles.container} >
                  <Button variant="light" style={styles.homeBtnTop} onClick={backToList} data-testid="franchisor-home-top" aria-label="กลับรายการแฟรนไชส์" ><i className="bi bi-houses-fill"></i></Button>

                      <div style={styles.container2} >
                        <Dropdown title="&emsp;&emsp;&emsp;เมนู&emsp;&emsp;&emsp;" trigger='click' style={styles.container3} menuStyle={styles.mobileMenu} data-testid="franchisor-menu-dropdown" >
                            <Accordion style={styles.accordionMenu} defaultActiveKey={0}  >
                              {listDisplay.map((item,index)=>{
                                const { topic, value } = item;
                                return <Accordion.Panel key={index} header={topic} eventKey={index+1}  >
                                          {value.map((a)=>{
                                            const { id, name, to } = a
                                            return <Dropdown.Item key={id} onClick={()=>{navigate(to)}} >{name}</Dropdown.Item>
                                          })}
                                      </Accordion.Panel>
                              })}
                            </Accordion>
                            <Dropdown.Item onClick={() => {
                              setAlert_Modal({
                                status:true,
                                content:`ยืนยันการออกจากระบบ`,
                                onClick:()=>{exit();setAlert_Modal(initialAlert)},
                                variant:'danger'
                              })
                            }} >&emsp;<i className="bi bi-box-arrow-left"></i>&emsp;ออกจากระบบ</Dropdown.Item>
                        </Dropdown>&emsp;&emsp;&emsp;&emsp;
                      </div>
                      <div onClick={()=>{setShort(false)}} style={styles.container4} data-testid="franchisor-sidebar-expand" > 
                        <i className="bi bi-list"></i>
                      </div>
                  </div>
                  {windowWidth < 900
                      ?<br/>
                      :null
                  }
                  
                  <div style={styles.container5}>
                      {noMenu ? <NoMenu/> : access && !redirectTo ? <Outlet /> : accessError ? <NoMenu text={accessError}/> : null}
                  </div> 
                </div>
                :<div>
                <div style={styles.container7}>
                    <div style={styles.container8} >
                      <div onClick={()=>{setShort(true)}} style={styles.container9} data-testid="franchisor-sidebar-shrink" > 
                        <i className="bi bi-list"></i>
                      </div>
                      {imageId
                          ?<img style={styles.container10} src={imageId}/>
                          :<RootImage style={styles.container10} />
                      }
                      <Button variant="light" style={styles.homeBtnLeft} onClick={backToList} data-testid="franchisor-home-left" aria-label="กลับรายการแฟรนไชส์" ><i className="bi bi-houses-fill"></i></Button>
                      
                    </div>
                      <div style={styles.container11}>
                        <div className="resSidebar">
                          {sideBar.map((item, index) => (
                              <React.Fragment key={index}>
                              {item.label && (
                                  <div
                                  style={styles.container12}
                                  >
                                  {item.label}
                                  </div>
                              )}
                              {item.to && (
                                  <NavLink
                                  exact
                                  to={item.to}
                                  // activeClassName='resSidebar a.active'
                                  // onMouseEnter={() => handleMouseEnter(index)}
                                  // onMouseLeave={handleMouseLeave}
                                  >
                                  {item.topic}
                                  </NavLink>
                              )}
                              </React.Fragment>
                          ))}
                        </div>
                        <div style={styles.logoutBar} data-testid="franchisor-logout-bar" onClick={()=>{setAlert_Modal({ ...initialAlert,status:true, content:`ยืนยัน ออกจากระบบ`, onClick:()=>{exit()}, variant:'danger' })}} >
                          Logout
                        </div>
                      </div>
                     
              </div> 
              <div style={{width:windowWidth < 576 || short ? '100%' : 'calc(100% - 212px)', marginLeft: windowWidth < 576 ? 0 : '210px',backgroundColor:'var(--sc-bg)', minHeight:'100vh'}}>
                <div style={styles.outletPad}>
                {noMenu ? <NoMenu/> : access && !redirectTo ? <Outlet /> : accessError ? <NoMenu text={accessError}/> : null}
                </div>
            </div>
              </div>
            }
        
    </div>
  );
};

function NoMenu({ text = 'บัญชีนี้ยังไม่มีสิทธิ์ใช้งานเมนูใดของแฟรนไชส์นี้ ติดต่อผู้ดูแลแฟรนไชส์เพื่อขอสิทธิ์' }){
  return <div data-testid="franchisor-no-menu" style={styles.noMenu} >{text}</div>
}

const styles = {
  noMenu : {
    padding:'24px 8px', color:'var(--sc-text-2)', fontSize:15
  },
  root : {
    backgroundColor:'var(--sc-bg)'
  },
  homeBtnTop : {
    position:'absolute',top:12,right:10,borderRadius:100,width:36,height:36,padding:0
  },
  homeBtnLeft : {
    position:'absolute',top:50,left:8,borderRadius:100,width:36,height:36,padding:0
  },
  accordionMenu : { minWidth:'200px' },
  // เมนูโหมดแคบยาวเกินจอ = เลื่อนได้ (80px ≈ แถบหัว)
  mobileMenu : { maxHeight:'calc(100svh - 80px)', overflowY:'auto', overscrollBehavior:'contain' },
  // ระยะขอบเนื้อหาจอลูกในโหมดกว้าง (เดิมชิดขอบแถบข้าง)
  outletPad : {
    padding:'8px 16px 14px 16px'
  },
  logoutBar : {
    display:'flex',justifyContent:'center',alignItems:'center',gap:8,
    color:'var(--sc-chip-text)',backgroundColor:'var(--sc-chip)',
    padding:'10px',margin:'12px',borderRadius:'var(--sc-radius-md)',
    fontSize:13,fontWeight:500,cursor:'pointer'
  },
  container : {
    paddingTop:'1rem',paddingBottom:'1rem',width:'100%',display:'flex',alignItems:'center',paddingRight:'3rem',position:'fixed',top:0,backgroundColor:'var(--sc-surface)',borderBottom:'0.5px solid var(--sc-line)',zIndex:99
  },
  container2 : {
    maxWidth:'80vw', whiteSpace: 'nowrap', scrollbarWidth:'thin',zIndex:999,marginLeft:'3rem'
  },
  container3 : {
    paddingLeft:'5px',paddingRight:'5px'
  },
  container4 : {
    position:'absolute',top:10,left:10,fontSize:30,cursor:'pointer',color:'var(--sc-sidebar-text)'
  },
  container5 : {
    width:'100%',paddingTop:'5rem',backgroundColor:'var(--sc-bg)', minHeight:'100vh',paddingLeft:'1rem',paddingRight:'1rem'
  },

  container7 : {
    width: '200px', minWidth: '200px', position: 'fixed', top:0, height:'100vh',
    display:'flex', flexDirection:'column',
    backgroundColor:'var(--sc-sidebar)', borderRight:'0.5px solid var(--sc-line)', zIndex:60
  },
  container8 : {
    display:'flex',justifyContent:'center'
  },
  container9 : {
    position:'absolute',top:10,left:10,color:'var(--sc-sidebar-text)',fontSize:30,cursor:'pointer'
  },
  container10 : {
    width:'80px',height:'80px',backgroundColor:'var(--sc-surface-2)',border:'0.5px solid var(--sc-line)',borderRadius:'100px',objectFit:'cover',marginTop:14
  },
  container11 : {
    flex:1, minHeight:0, overflowY:'auto', paddingBottom:'2rem'
  },
  container12 : {
    width: '100%', fontWeight: 700, fontSize: 13, color: 'var(--sc-text)',
    letterSpacing: 0.2, padding: '18px 12px 6px 12px',
    borderTop: '0.5px solid var(--sc-line)', marginTop: 4
  },
}

export default FranchisorScreen;
