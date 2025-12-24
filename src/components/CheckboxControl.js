import React from "react";
import { colorIndex, colors } from "../configs";
import { Checkbox } from 'rsuite';

const { ten } = colors;

function CheckboxControl({ boxes, selected, handleSelected, thisKey, field }) {
    return  <React.Fragment>
                {boxes.map((a,i)=>{
                    let status = selected.some(b=>b[thisKey]===a[thisKey])
                    let color = colorIndex[i] || ten
                    return <Checkbox 
                                checked={status}
                                className="custom-checkbox"
                                style={{
                                '--rs-checkbox-checked-bg': color,
                                '--rs-checkbox-checked-border': color,
                                '--rs-checkbox-checked-tick': '#FFFFFF', // To customize the tick color
                                minWidth:'150px',
                                marginLeft:'10px'
                                }}
                                onClick={()=>{handleSelected(a)}}
                            >
                                {a[field]}
                            </Checkbox>
                })}
            </React.Fragment>
};


export default CheckboxControl;
