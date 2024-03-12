import { useState } from "react";

function SearchBar({ list, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholder, setPlaceholder] = useState("Search Item ...");

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
    if (event.target.value === "") {
      setPlaceholder("");
    } else {
      setPlaceholder("Search Item ...");
    }
  };
  const handleBlur = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
    if (event.target.value === "") {
      setPlaceholder("Search Item ...");
    }
  };
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      className="Search"
      onChange={handleChange}
      onClick={handleChange}
      onBlur={handleBlur}
    />
  );
}

export default SearchBar;
