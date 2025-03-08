import css from './Banner.module.css';
import { Button } from 'antd';

const MainBanner = () => {
  return (
    <div className={`py-5 ${css['main-banner-container']}`}>
      <div className="container px-4 px-lg-5 my-5">
        <div className="text-center text-white">
          <h2 className="display-4 fw-bolder">Shop</h2>
          <p className="lead fw-normal text-white-50 mb-4">Discover the latest trends</p>
          <Button href="#shop" className="btn btn-dark" size="large">Shop Now</Button>
        </div>
      </div>
    </div>
  )
}

export default MainBanner;
