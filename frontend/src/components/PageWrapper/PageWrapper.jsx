import PropTypes from "prop-types";
import css from "./PageWrapper.module.css";

export function PageWrapper({ children }) {
  return (
    <main className={css["page-wrapper"]}>
      {children}
    </main>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
