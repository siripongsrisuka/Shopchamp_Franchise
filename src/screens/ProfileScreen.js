import React, { useState } from "react";
import { Modal_Franchise, Modal_Loading } from "../modal";
import { useSelector, useDispatch } from "react-redux";
import { updateNormalFieldFranchise } from "../redux/franchiseSlice";
import { prepareFirebaseImage } from "../db/firestore";
import { franchiseProfileUpdate } from "../api/franchiseApi";
import { apiErrorMessage } from "../api/posApi";
import { colors } from "../configs";
import { OneButton, RootImage } from "../components";
import { toastError, toastSuccess } from "../Utility/function";

const { white } = colors;

function ProfileScreen() {
    const dispatch = useDispatch();
    const {  franchise } = useSelector((state)=> state.franchise);
    
    const [current, setCurrent] = useState(franchise);
    const { name, imageId, id:franchiseId } = current;
    const [franchise_Modal, setFranchise_Modal] = useState(false);
    const [loading, setLoading] = useState(false);

    // DEV-0002 ก้อน 9f: `franchise.profileUpdate` (census 262) · ส่งเฉพาะช่องที่เปลี่ยนจากที่โหลดมา (PR-07 เดิมเขียน 2 ช่องจากค่าใน localStorage)
    //   โลโก้ยังอัปจากเบราว์เซอร์ขึ้น Storage ก่อน แล้วส่ง URL (เส้นใหม่รับแค่ URL)
    async function submit(){
        setFranchise_Modal(false);
        setLoading(true);
        try {
            let image = imageId || ''
            if (image && !image.startsWith('https')) {
              image = await prepareFirebaseImage(image,'/franchise/',franchiseId)
            }
            const body = { franchiseId };
            if ((name || '').trim() !== (franchise.name || '')) body.name = (name || '').trim();
            if (image !== (franchise.imageId || '')) body.imageId = image;
            if (Object.keys(body).length === 1) { toastSuccess('ไม่มีอะไรเปลี่ยน'); return; }
            await franchiseProfileUpdate(body);
            const updatedField = { ...(body.name !== undefined ? { name: body.name } : {}), ...(body.imageId !== undefined ? { imageId: body.imageId } : {}) };
            dispatch(updateNormalFieldFranchise(updatedField));
            setCurrent(prev=>({ ...prev, ...updatedField }));
            toastSuccess('อัปเดตโปรไฟล์ สำเร็จ')
        } catch (error) {
            toastError(apiErrorMessage(error, 'อัปเดตโปรไฟล์ไม่สำเร็จ'))
        } finally {
            setLoading(false);
        }
    };

  return (
    <div  style={styles.container} >
        <Modal_Loading show={loading} />
        <Modal_Franchise
            show={franchise_Modal}
            onHide={()=>{setFranchise_Modal(false)}}
            current={current}
            setCurrent={setCurrent}
            submit={submit}
        />
      <h1>{name}</h1>
      <OneButton {...{ text:'จัดการ', submit:()=>{setFranchise_Modal(true)} }} />
      <div style={styles.container2} >
          <h5>โลโก้แบรนด์</h5>
          {imageId
                ?<img  style={styles.image} src={imageId}/>
                :<RootImage style={styles.image}  />
            }
          
      </div>
    </div>
  );
};

const styles = {
    container : {
        height:'100vh'
    },
    container2 : {
        padding:10,margin:10,backgroundColor:'var(--sc-surface)',border:'0.5px solid var(--sc-line)',boxShadow:'var(--sc-shadow)',borderRadius:'var(--sc-radius-lg)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'
    },
    image : {
        width:'10rem',height:'10rem',objectFit:'cover'
    }

   
}

export default ProfileScreen;