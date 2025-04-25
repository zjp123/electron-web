// src/App.tsx
import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { basicRoutes, RouteConfig } from "./routes";
import ProtectedRoute from "./routes/ProtectedRoute";
import { fetchDynamicRoutes } from "./api/common";

const App = () => {
  const [dynamicRoutes, setDynamicRoutes] = useState<RouteConfig[] | []>([]);

  useEffect(() => {
    const loadDynamicRoutes = async () => {
      try {
        const routes = await fetchDynamicRoutes();
        const formattedRoutes = routes.map((route: RouteConfig & { componentName: string }) => ({
          path: route.path,
          component: React.lazy(
            () => import(`../../../packages/zjp-common/pages/${route.componentName}.tsx`)
          ),
          isProtected: route.isProtected,
        })) as RouteConfig[];
        setDynamicRoutes(formattedRoutes);
      } catch (error) {
        console.error("Error loading dynamic routes:", error);
      }
    };

    loadDynamicRoutes();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {[...basicRoutes, ...dynamicRoutes].map(({ path, component: Component, isProtected }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
