import PropTypes from "prop-types";
import css from "./PageWrapper.module.css";

export function PageWrapper({ children }) {
  return (
    <div className={`${css.pageContent}`}>
      {children}
    </div>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
