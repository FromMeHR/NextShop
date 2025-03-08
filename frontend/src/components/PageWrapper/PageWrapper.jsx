import PropTypes from 'prop-types';
import css from './PageWrapper.module.css';

const PageWrapper = ({ children }) => {
  return (
    <div className={`${css.pageContent}`}>
      {children}
    </div>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageWrapper;
