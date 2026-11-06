import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal_CategorySetting, Modal_Loading } from "../modal";
import { colors } from "../configs";
import { checkCategory2, manageCategory, someInArray, toastError, toastSuccess } from "../Utility/function";
import { updateNormalFieldFranchise } from "../redux/franchiseSlice";
import { OneButton } from "../components";
import { franchiseCategorySave, categoryTreeOf } from "../api/franchiseApi";
import { apiErrorMessage, serverErrorCode } from "../api/posApi";

const { softWhite, dark, two } = colors;

function WarehouseCategoryScreen() {
    const dispatch = useDispatch();
    const { franchise: { warehouseCategory, id:franchiseId } } = useSelector((state)=> state.franchise);
    const [allSelectedCategory, setAllSelectedCategory] = useState([]);
    const [editCategory_Modal, setEditCategory_Modal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVersion, setModalVersion] = useState(0); // เปิด modal ใหม่ทุกครั้งเริ่มจากต้นล่าสุด (เดิม useState(value) ค้างค่าแรก)

    // DEV-0002 ก้อน 9f: `franchise.categorySave` (census 266) · ส่งต้นที่จอเห็นตอนเปิด (seen) ⇒ มีคนแก้ไปก่อน = 409 ไม่ทับ (DI-37 · WC-41)
    async function submit(value){
        setEditCategory_Modal(false);
        setLoading(true);
        try {
          const res = await franchiseCategorySave({
            franchiseId,
            warehouseCategory: categoryTreeOf(value),
            seenWarehouseCategory: warehouseCategory,
          });
          if (res.unchanged) {
            toastSuccess('หมวดหมู่เป็นแบบนี้อยู่แล้ว');
          } else {
            dispatch(updateNormalFieldFranchise({ warehouseCategory: res.warehouseCategory || categoryTreeOf(value) }));
            toastSuccess('อัปเดตหมวดหมู่คลังสินค้า สำเร็จ')
          }
        } catch (error) {
          const code = serverErrorCode(error);
          const env = error && error.response && error.response.data;
          if (code === 'category_changed' && env && Array.isArray(env.warehouseCategory)) {
            // ต้นล่าสุดจาก server · ผู้ใช้เปิดแก้ใหม่จากต้นนี้
            dispatch(updateNormalFieldFranchise({ warehouseCategory: env.warehouseCategory }));
          }
          toastError(apiErrorMessage(error, 'อัปเดตหมวดหมู่ไม่สำเร็จ'))
        } finally {
          setLoading(false)
          setModalVersion(v=>v+1)
        }
    }
    
    return (
      <div style={styles.container} >
        <Modal_Loading show={loading} />
        <Modal_CategorySetting 
          key={modalVersion}
          show={editCategory_Modal} 
          onHide={()=>{setEditCategory_Modal(false)}}
          value={warehouseCategory}
          submit={submit}
        />
        <h1>สร้างหมวดหมู่สินค้า</h1>
        <OneButton {...{ text:'แก้ไข', variant:"warning", submit:()=>{setModalVersion(v=>v+1);setEditCategory_Modal(true)} }} />
        <div>
          <div style={styles.container3}>
            {warehouseCategory.map((item) => {
                const { level, value } = item;
              return (
                <div key={level} style={styles.container4}>
                  <div style={styles.container5}>
                    <h3 >ชั้นที่ {level}</h3>
                  </div>
                  <div style={styles.container6}>
                    {/* Map over categories and render your components */}
                    {checkCategory2(allSelectedCategory, item).map((a) => {
                      const { id, name } = a;
                      let status = someInArray(allSelectedCategory, 'id', id);
                      return (
                        <div
                          onClick={() => {setAllSelectedCategory(manageCategory(value, allSelectedCategory, a))}}
                          key={id}
                          style={{
                            padding: '10px',
                            borderRadius: '20px',
                            margin: '5px',
                            backgroundColor: status ? 'var(--sc-active)' : 'var(--sc-surface-2)',
                            minWidth: '150px',
                            textAlign: 'center',
                            cursor:'pointer',
                          }}
                        >
                          <h4 style={{ color: 'var(--sc-text)'}} >{name}</h4>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
      </div>
      </div>
    );
  }

const styles = {
    container : {
        minHeight:'100vh'
    },
    container3 : {
        overflowY: 'auto', height: '100vh' 
    },
    container4 : {
        display: 'flex', flexDirection: 'row' 
    },
    container5 : {
        padding: '10px', borderRadius: '20px', margin: '5px',  textAlign: 'center',minWidth:'100px' 
    },
    container6 : {
        overflowX: 'auto', display: 'flex', flexDirection: 'row'
    }
}

export default WarehouseCategoryScreen;