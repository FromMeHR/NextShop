import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/Router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {
  return (
    <div className="App">
      <h1>Shop</h1>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
