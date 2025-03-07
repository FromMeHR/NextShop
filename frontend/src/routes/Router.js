import {createBrowserRouter} from 'react-router-dom';
import ClientRouter from './ClientRouter';


const router = createBrowserRouter([
    {
      path: '/*',
      element: (
        <ClientRouter />
      ),
    }
  ]);

export default router;