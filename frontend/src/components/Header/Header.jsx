import { Navbar } from "./HeaderComponents/Navbar";
import { SearchBox } from "./HeaderComponents/SearchBox";
import { MobileNavbar } from "./HeaderComponents/MobileNavbar";
import css from "./Header.module.css";

export function Header(props) {
  return (
    <>
      <header className={css["header"]}>
        <Navbar isAuthorized={props.isAuthorized} />
      </header>
      <div className={css["header-mobile-search"]}>
        <SearchBox />
      </div>
      <div className={css["header-mobile-navbar"]}>
        <MobileNavbar isAuthorized={props.isAuthorized} />
      </div>
    </>
  );
}
