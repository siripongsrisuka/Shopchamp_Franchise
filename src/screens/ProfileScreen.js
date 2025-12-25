import React, { useState } from "react";
import { Modal_Franchise, Modal_Loading } from "../modal";
import { useSelector, useDispatch } from "react-redux";
import { updateNormalFieldFranchise } from "../redux/franchiseSlice";
import { db, prepareFirebaseImage } from "../db/firestore";
import { colors } from "../configs";
import { OneButton, RootImage } from "../components";
import { toastSuccess } from "../Utility/function";

const { white } = colors;

function ProfileScreen() {
    const dispatch = useDispatch();
    const {  franchise } = useSelector((state)=> state.franchise);
    
    const [current, setCurrent] = useState(franchise);
    const { name, imageId, id:franchiseId } = current;
    const [franchise_Modal, setFranchise_Modal] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit(){
        setFranchise_Modal(false);
        setLoading(true);
        let image = imageId
        if (imageId && !imageId.startsWith('https')) {
          image = await prepareFirebaseImage(imageId,'/franchise/',franchiseId)
        }
        try {
            const updatedField = { name, imageId:image };
            const franchiseRef = db.collection('franchise').doc(franchiseId);
            await franchiseRef.update(updatedField);
            dispatch(updateNormalFieldFranchise(updatedField));
            toastSuccess('อัปเดตโปรไฟล์ สำเร็จ')
        } catch (error) {
            alert(error)
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
        padding:10,margin:10,backgroundColor:white,borderRadius:20,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'
    },
    image : {
        width:'10rem',height:'10rem',objectFit:'cover'
    }

   
}

export default ProfileScreen;