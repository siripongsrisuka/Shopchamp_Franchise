import React from "react";
import { colors } from "../configs";
import { useSelector } from "react-redux";


const { white } = colors;
function ReportScreen() {
  const { franchise:{ id:franchiseId } } = useSelector(state=>state.franchise)

  return (
    <div style={styles.container}>
      <iframe
        src={`https://shopchamp-merchant-owner.web.app/franchise/${franchiseId}`}
        title="Web B"
        style={{ width: '100%', height: '100%', border: 'none', margin:0,padding:0 }}
      />
    </div>
  );
};

const styles = {
    container : {
      width: '100%', height: '100vh', overflow: 'hidden', padding:0, margin:0, backgroundColor:white, marginLeft:'-1rem',marginRight:0
    }
}

export default ReportScreen;
