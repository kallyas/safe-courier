import { useState } from "react";
import Navbar from "../Navbar/Navbar";

function Header() {
  const [search, setSearch] = useState("");

  const handleSubmit = () => {
    console.log(search);
  };
  return (
    <div className="page-header">
      <div className="search-form">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="search"
              className="form-control search-input"
              placeholder="Type something..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-btn">
              <button
                className="btn btn-default"
                id="close-search"
                type="button"
              >
                <i className="icon-close"></i>
              </button>
            </span>
          </div>
        </form>
      </div>
      <Navbar />
    </div>
  );
}

export default Header;
