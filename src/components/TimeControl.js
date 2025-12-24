import React, { forwardRef } from "react";
import {
    Container,
  } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";
import { colors } from "../configs";
import { useTranslation } from 'react-i18next';


const { white } = colors;

function TimeControl({ startDate, endDate, setStartDate, setEndDate }) {
    const { t } = useTranslation();

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div style={styles.container} onClick={onClick} ref={ref}>
          {value}
        </div>
      ));

  return <Container
            fluid
            style={styles.container2}
            >
            <div style={styles.container3} >
                <SlCalender />
                <div style={styles.container4} >  {t('report.start')}: </div>
                <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    customInput={<ExampleCustomInput />}
                    withPortal
                />
            </div>
            <div style={styles.container5} >
                <SlCalender />
                <div style={styles.container4} >  {t('report.end')}: </div>
                <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    customInput={<ExampleCustomInput />}
                    withPortal
                />
            </div>
        </Container>
};

const styles = {
    container : {
        borderRadius:20
    },
    container2 : {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems:'center',
        marginTop:10,
        marginBottom:10
    },
    container3 : {
        display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,alignItems:'center'
    },
    container4 : {
        paddingLeft:10,paddingRight:10
    },
    container5 : {
        display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,marginLeft:20,alignItems:'center'
    }
}

export default TimeControl;
