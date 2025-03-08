import { Button } from 'antd'
import RelatedProducts from './RelatedProducts/RelatedProducts'
import { useParams } from 'react-router-dom'
import useSWR from 'swr'
import axios from 'axios'
import Loader from '../../components/Loader/Loader'
import ErrorPage404 from '../ErrorPage/ErrorPage404'

const fetcher = async (url) => {
    const response = await axios.get(url);
    return response.data;
};

const ProductDetailPage = () => {
    const { slug } = useParams();
    const baseUrl = process.env.REACT_APP_BASE_API_URL;
    const { data: product, error, isLoading } = useSWR(`${baseUrl}/products/${slug}/`, fetcher);

  	return (error) ? (
            <ErrorPage404 />
        ) : (
        <div>
            {isLoading ? (
                <Loader />
                ) : (
                <div>
                    <section className="py-3">
                        <div className="container px-4 px-lg-5 my-5">
                            <div className="row gx-4 gx-lg-5 align-items-center">
                                <div className="col-md-6">
                                    <img 
                                        className="card-img-top mb-5 mb-md-0" 
                                        src={product.image} 
                                        alt={product.name} 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <div className="small mb-1">Categories: {product.categories.map((cat) => cat.name).join(", ")}</div>
                                    <h2 className="display-5 fw-bolder">{product.name}</h2>
                                    <p className="lead fw-normal text-muted mb-0">{product.description}</p>
                                    <div className="fs-5 mb-3">
                                        <span>${product.price}</span>
                                    </div>
                                    <div className="fs-6 mb-3">
                                        <span>Available: {product.quantity}</span>
                                    </div>
                                    <Button className="btn btn-dark" size="large">Add to cart</Button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <RelatedProducts relatedProducts={product.similar_products} />
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
