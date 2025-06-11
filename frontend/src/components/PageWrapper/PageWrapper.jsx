import PropTypes from "prop-types";
import css from "./PageWrapper.module.css";

export function PageWrapper({ children }) {
  return (
    <div className={css["page-wrapper"]}>
      {children}
    </div>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
