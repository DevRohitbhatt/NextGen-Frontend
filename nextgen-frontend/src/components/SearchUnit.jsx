import { useState } from "react";
import { MdClear } from "react-icons/md";

function SearchUnit({ list, onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

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
    />
    <MdClear className="clearIcone" onClick={handleClear}/>
    </div>
  );
}

export default SearchUnit;
