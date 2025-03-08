import useSWR from "swr";
import axios from "axios";
import Product from "../Product/Product";
import Loader from "../../../components/Loader/Loader";
import ErrorPage404 from "../../ErrorPage/ErrorPage404";

const fetcher = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

const Products = () => {
  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const { data: products, error, isLoading } = useSWR(`${baseUrl}/products/`, fetcher);

  return (error) ? (
      <ErrorPage404 />
    ) : (
      <section className="py-5" id="shop">
        <h4 className="text-center">Our Products</h4>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="container px-4 px-lg-5 mt-5">
            <div className="row justify-content-center">
              {products && products.length > 0 ? (
                products.map((product) => <Product key={product.id} product={product} />)
              ) : (
                <p className="text-center">No products found</p>
              )}
            </div>
          </div>
        )}
      </section>
  );
};

export default Products;
