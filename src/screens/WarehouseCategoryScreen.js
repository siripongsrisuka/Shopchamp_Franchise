import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal_CategorySetting, Modal_Loading } from "../modal";
import { colors } from "../configs";
import { checkCategory2, manageCategory, someInArray, toastSuccess } from "../Utility/function";
import { updateNormalFieldFranchise } from "../redux/franchiseSlice";
import { OneButton } from "../components";
import { db } from "../db/firestore";

const { softWhite, dark, two } = colors;

function WarehouseCategoryScreen() {
    const dispatch = useDispatch();
    const { franchise: { warehouseCategory, id:franchiseId } } = useSelector((state)=> state.franchise);
    const [allSelectedCategory, setAllSelectedCategory] = useState([]);
    const [editCategory_Modal, setEditCategory_Modal] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit(value){
        setEditCategory_Modal(false);
        setLoading(true);
        try {
          const updatedField = { warehouseCategory:value }
          const franchiseRef = db.collection('franchise').doc(franchiseId);
          await franchiseRef.update(updatedField)
          dispatch(updateNormalFieldFranchise(updatedField));
          toastSuccess('อัปเดตหมวดหมู่คลังสินค้า สำเร็จ')

        } catch (error) {
          alert(error)
        } finally {
          setLoading(false)
        }
    }
    
    return (
      <div style={styles.container} >
        <Modal_Loading show={loading} />
        <Modal_CategorySetting 
          show={editCategory_Modal} 
          onHide={()=>{setEditCategory_Modal(false)}}
          value={warehouseCategory}
          submit={submit}
        />
        <h1>สร้างหมวดหมู่สินค้า</h1>
        <OneButton {...{ text:'แก้ไข', variant:"warning", submit:()=>{setEditCategory_Modal(true)} }} />
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
                            backgroundColor: status ? two : softWhite,
                            minWidth: '150px',
                            textAlign: 'center',
                            cursor:'pointer',
                          }}
                        >
                          <h4 style={{ color: dark}} >{name}</h4>
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