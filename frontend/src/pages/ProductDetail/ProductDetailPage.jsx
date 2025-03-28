import { useState } from "react";
import { useParams } from 'react-router-dom'
import useSWR from 'swr'
import axios from 'axios'
import Loader from '../../components/Loader/Loader'
import ErrorPage404 from '../ErrorPage/ErrorPage404'
import RelatedProducts from './RelatedProducts/RelatedProducts'
import { useCart } from '../../context/CartContext'
import CartModal from '../../components/Cart/CartModal'
import css from './ProductDetailPage.module.css'

const fetcher = async (url) => {
    const response = await axios.get(url);
    return response.data;
};

const ProductDetailPage = () => {
    const { slug } = useParams();
    const { addToCart } = useCart();
    const [showCart, setShowCart] = useState(false);
    const baseUrl = process.env.REACT_APP_BASE_API_URL;
    const { data: product, error, isLoading } = useSWR(`${baseUrl}/api/products/${slug}/`, fetcher);

  	return (error) ? (
            <ErrorPage404 />
        ) : (
        <>
            {isLoading ? (
                <Loader />
                ) : (
                <>
                    <section className="py-3">
                        <div className="container px-4 px-lg-5 my-5">
                            <div className="row gx-4 gx-lg-5 align-items-center">
                                <div className="col-md-4">
                                    <img 
                                        className="card-img-top mb-5 mb-md-0" 
                                        src={product.image} 
                                        alt={product.name} 
                                    />
                                </div>
                                <div className="col-md-8">
                                    <div className="small mb-1">Categories: {product.categories.map((cat) => cat.name).join(", ")}</div>
                                    <h2 className="display-5 fw-bolder">{product.name}</h2>
                                    <p className="lead fw-normal text-muted mb-0">{product.description}</p>
                                    <div className="fs-5 mb-3">
                                        <span>${product.price}</span>
                                    </div>
                                    <div className="fs-6 mb-3">
                                        <span>Available: {product.quantity}</span>
                                    </div>
                                    {product.quantity === 0 ? (
                                        <span className="text-danger">Out of stock</span> ) : (
                                        <button className={`btn btn-dark btn-lg ${css['buy-now-button']}`} onClick={() => { addToCart(product.id); setShowCart(true); }}>
                                            <span><img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cart.svg`} alt="Cart icon link" />Buy Now</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                    <RelatedProducts relatedProducts={product.similar_products} />
                    <CartModal show={showCart} handleClose={() => setShowCart(false)} />
                </>
            )}
        </>
    );
};

export default ProductDetailPage;
