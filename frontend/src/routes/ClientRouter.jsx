import { ConfigProvider } from 'antd';
import { Route, Routes } from 'react-router-dom';

import customTheme from '../pages/CustomThemes/customTheme.js';

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import MainPage from '../pages/LangingPage/MainPage';
import ErrorPage404 from '../pages/ErrorPage/ErrorPage404';


function ClientRouter() {
  return (
    <ConfigProvider theme={customTheme}>
        <Header />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="*" element={<ErrorPage404 />} />
            </Routes>
        <Footer />
    </ConfigProvider>
  );
}

export default ClientRouter;
