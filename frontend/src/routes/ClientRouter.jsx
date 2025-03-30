import { ConfigProvider } from 'antd';
import { Route, Routes } from 'react-router-dom';

import customTheme from '../pages/CustomThemes/customTheme.js';

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import MainPage from '../pages/LandingPage/MainPage';
import ProductDetailPage from '../pages/ProductDetail/ProductDetailPage';
import PageWrapper from '../components/PageWrapper/PageWrapper';
import { CartProvider } from '../context/CartContextProvider';
import ErrorPage404 from '../pages/ErrorPage/ErrorPage404';


function ClientRouter() {
  return (
    <ConfigProvider theme={customTheme}>
      <CartProvider>
        <Header />
          <PageWrapper>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route
                  path="/product-detail/:slug"
                  element={<ProductDetailPage />}
                />
                <Route path="*" element={<ErrorPage404 />} />
            </Routes>
          </PageWrapper>
        <Footer />
      </CartProvider>
    </ConfigProvider>
  );
}

export default ClientRouter;
