import { Navbar } from "./Navbar/Navbar";
import css from "./Header.module.css";

export function Header(props) {
  return (
    <header className={css["header"]}>
      <Navbar isAuthorized={props.isAuthorized}></Navbar>
    </header>
  );
}
