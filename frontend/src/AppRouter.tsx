import { Navigate, Route, Routes } from "react-router-dom";
import { useAppContext } from "./context/useAppContext";
import Layout from "./layout/Layout";
import AuthPage from "./pages/AuthPage";
import UserSectionPage from "./pages/UserSectionPage";
import UserProfilePage from "./pages/UserProfilePage";
import Chat from "./components/Chat";

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
              <UserSectionPage />
            </Layout>
          ) : (
            <Navigate to="/auth/login" />
          )
        }
      />
      {isLoggedIn && (
        <Route
          path="/chat/:userId"
          element={
            isLoggedIn && (
              <Layout>
                <div className="flex gap-4 relative">
                 <div className="hidden md:block"> <UserSectionPage /></div>
                  <Chat />
                </div>
              </Layout>
            )
          }
        />
      )}

      <Route
        path="/profile"
        element={
          isLoggedIn && (
            <Layout>
              <UserProfilePage />
            </Layout>
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
