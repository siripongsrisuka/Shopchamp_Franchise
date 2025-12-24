import Navbar from 'react-bootstrap/Navbar';
import { colors } from '../configs';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink, useNavigation } from 'react-router-dom';


const { white } = colors;

function NavBar({ name, language, setLanguage_Modal, exit }) {
  const navigate = useNavigate();
  const { profile:{ port } } = useSelector(state=>state.profile);

  function goBack(){
    navigate(-1)
  };

  return (
    <Navbar bg="dark" style={styles.container} >
        {port.length>0
            ?<Button variant='light' onClick={goBack} >
                <i  class="bi bi-arrow-left-square-fill"></i>
            </Button>
            :null
        }
        <h3 style={styles.text} >{name}</h3>
        <div style={styles.container2} >
            <div onClick={()=>{setLanguage_Modal(true)}} style={styles.container3}  >
              <h6 style={styles.text2} >{language.image} &emsp;</h6>
            </div>
            <Button variant='light' onClick={exit} >
                <i class="bi bi-box-arrow-right"></i>
            </Button>&emsp;
        </div>
    </Navbar>
  );
};

const styles = {
    container : {
      paddingTop:0,paddingBottom:0,display:'flex',justifyContent:'space-between'
    },
    container2 : {
      display:'flex',alignItems:'center',color:white
    },
    container3 : {
      cursor:'pointer'
    },
    text : {
      color:white
    },
    text2 : {
      fontSize:30
    }
}

export default NavBar;