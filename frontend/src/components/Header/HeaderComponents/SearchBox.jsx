import { useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "./SearchBox.module.css";

export function SearchBox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search/${searchQuery.trim()}/`);
      setSearchQuery("");
    }
  };

  const keyDownHandler = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={css["search-box"]}>
      <div className={css["search__form"]}>
        <input
          type="text"
          name="search"
          className={css["search__input"]}
          placeholder="I want to find..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={keyDownHandler}
        />
        <button
          type="button"
          className={css["search__button"]}
          onClick={handleSearch}
        >
          <img
            src={`${process.env.REACT_APP_PUBLIC_URL}/svg/search.svg`}
            alt="Search icon"
          />
        </button>
      </div>
    </div>
  );
}
