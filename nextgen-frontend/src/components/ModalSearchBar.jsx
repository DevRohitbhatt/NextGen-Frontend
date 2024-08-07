import { useState, useEffect, useRef } from "react";
import { MdClear } from "react-icons/md";
import styled from "styled-components";

const ClearSearch = styled(MdClear)`
  position: absolute;
  top: 0;
  right: 0;
  background: ${(props) => props.theme.primary};
  height: 32px;
  width: 31px;
  color: #fff;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  font-weight: bold;
  cursor: pointer;
`

function ModalSearchBar({ list, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.focus();
  }, []);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };
  const handleClear = () => {
    setSearchTerm("");
    onSearch(""); // Clear the search results as well
  };

  return (
    <div>
    <input
      id="txtfilter"
      type="text"
      className="form-control"
      placeholder=""
      value={searchTerm}
      onChange={handleChange}
      onClick={handleChange}
      ref={inputRef}
    />
    <ClearSearch onClick={handleClear}/>
    </div>
  );
}

export default ModalSearchBar;
