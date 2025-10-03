"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import css from "./SearchBox.module.css";

export function SearchBox() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      router.push(`/search/${searchQuery.trim()}/`);
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
          placeholder="Я хочу знайти..."
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
            src={`${process.env.NEXT_PUBLIC_URL}/svg/search.svg`}
            alt="Search icon"
          />
        </button>
      </div>
    </div>
  );
}
