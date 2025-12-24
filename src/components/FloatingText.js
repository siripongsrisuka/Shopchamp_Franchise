import React from "react";
import {
  Form,
} from "react-bootstrap";

function FloatingText({
    name='name',
    placeholder="Put here...",
    onChange,
    value
}) {

  return (
    <Form.Floating className="mb-3" style={{width:'100%'}} >
        <Form.Control
            name={name}
            type="text"
            placeholder={placeholder}
            onChange={onChange}
            value={value}
        />
        <label >{name}</label>
    </Form.Floating>
  );
}

export default FloatingText;
