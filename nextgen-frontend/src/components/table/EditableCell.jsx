import React, { useState } from "react";
import styled from "styled-components";

const Input = styled.input`
  width: 100%;
`;

const EditableCell = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(value);
  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleSave = () => {
    onSave(editValue);
  };

  return (
    <Input
      type="text"
      value={editValue}
      onChange={handleInputChange}
      onBlur={handleSave}
    />
  );
};

export default EditableCell;
