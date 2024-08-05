import { useState } from "react";
import styled from "styled-components";

const Input = styled.input`
  border-radius: 50px;
  height: 30px;
  width: 24%;
  align-items: center;
  outline: none;
  border: 1px solid #F0F0F0;
  padding: 8px 18px;
  box-shadow: 0px 0px 10px #00000014;
  display: block;
  margin: 0 0 0 auto;
  display: flex;
  justify-content: start;
  gap: 40px;
  align-items: center;

  &:hover {
    border: 1px solid ${(props) => props.theme.primary};
    transition: 0.5s;
  }
`;

function SearchBar({ list, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholder, setPlaceholder] = useState("Search...");

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    // onSearch(event.target.value);
    if (event.target.value === "") {
      setPlaceholder("");
    } else {
      setPlaceholder("Search...");
    }
  };

  const handleBlur = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
    if (event.target.value === "") {
      setPlaceholder("Search...");
    }
  };
  
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleChange}
      onClick={handleChange}
      onBlur={handleBlur}
    />
  );
}

export default SearchBar;
