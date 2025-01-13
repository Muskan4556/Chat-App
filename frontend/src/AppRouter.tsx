import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { useAppContext } from "./context/useAppContext";
import Layout from "./layout/Layout";
import AuthPage from "./pages/AuthPage";

const AppRouter = () => {
  const { isLoggedIn, loading } = useAppContext();

  if (loading) {
    return <div></div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Layout>
              <App />
            </Layout>
          ) : (
            <Navigate to="/auth/login" />
          )
        }
      />
      <Route
        path="/auth/signup"
        element={
          <Layout>
            <AuthPage />
          </Layout>
        }
      />
      <Route
        path="/auth/login"
        element={
          <Layout>
            <AuthPage />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRouter;
