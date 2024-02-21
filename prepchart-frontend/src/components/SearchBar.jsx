import { useState } from "react";

function SearchBar({ list, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search Item ..."
      value={searchTerm}
      className="Search"
      onChange={handleChange}
    />
  );
}

export default SearchBar;
