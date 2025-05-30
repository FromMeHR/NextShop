import css from "./Banner.module.css";

export function MainBanner() {
  return (
    <div className={css["main-banner-container"]}>
      <div className="container px-4 px-lg-5 my-5">
        <div className="text-center text-white">
          <h2 className="display-4 fw-bolder">Shop</h2>
          <p className="lead fw-normal text-white-50 mb-4">
            Discover the latest trends
          </p>
          <a href="#shop" className={css["btn-main-banner"]}>
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
