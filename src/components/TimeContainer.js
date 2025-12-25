import React, { forwardRef, useState, useEffect } from "react";
import {
    Container,
  } from "react-bootstrap";
  import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";
import { colors } from "../configs";
import '../App.css';
import { Button } from 'rsuite';
import { Modal_Loading } from "../modal";

const { white } = colors;

function TimeContainer({
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    show,
    search
}) {
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div style={styles.container} onClick={onClick} ref={ref}>
          {value}
        </div>
    ));

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {  // เอาไว้กำหนด display ของ sidebar
        // Function to update the window width state
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

  return (
    <Container
        fluid
        style={styles.container2}
    >
        <Modal_Loading show={show} />
        <div style={styles.container3} >
            <div style={styles.container4} >  เริ่ม: </div>
            <DatePicker
                dateFormat="dd/MM/yyyy"
                selected={startDate}
                onChange={onChangeStart}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                customInput={<ExampleCustomInput />}
                withPortal
            />
        </div>
        <div style={styles.container5} >
            <div style={styles.container4} >  ถึง: </div>
            <DatePicker
                dateFormat="dd/MM/yyyy"
                selected={endDate}
                onChange={onChangeEnd}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                customInput={<ExampleCustomInput />}
                withPortal
            />
        </div>&nbsp;
        {/* <Button onClick={search} color="orange" appearance="primary" >ค้นหา</Button> */}
        {windowWidth < 576
            ?<Button onClick={search} color="orange" appearance="primary" ><i class="bi bi-search"></i></Button>
            :<Button onClick={search} color="orange" appearance="primary" >ค้นหา</Button>
        }
    </Container>
  );
};

const styles = {
    container : {
        borderRadius:20,
        
    },
    container2 : {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems:'center',
        marginTop:10,
        marginBottom:10,
        marginLeft:-20,
        padding:0,
    },
    container3 : {
        display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,alignItems:'center'
    },
    container4 : {
        paddingLeft:10,paddingRight:10
    },
    container5 : {
        display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,marginLeft:10,alignItems:'center'
    }
}

export default TimeContainer;
