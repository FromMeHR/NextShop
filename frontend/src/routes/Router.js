import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ClientRouter } from "./ClientRouter";

const router = createBrowserRouter([
  {
    path: "/*",
    element: (
      <AuthProvider>
        <ClientRouter />
      </AuthProvider>
    ),
  },
]);

export default router;
