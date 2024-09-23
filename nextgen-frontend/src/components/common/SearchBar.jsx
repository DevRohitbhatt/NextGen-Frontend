import { useState } from "react";

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSearch(event.target.value);
    }
  };
  
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleChange}
      onClick={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className=" search-bar rounded-full h-[30px] w-[24%] flex items-center outline-none border border-gray-200 p-5 pr-[18px] pl-[18px] shadow-[0_0_10px_rgba(0,0,0,0.08)] my-auto justify-start transition-all hover:border-primary "
    />
  );
}

export default SearchBar;
