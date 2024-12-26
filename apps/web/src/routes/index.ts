// src/routes/config.ts
import { lazy } from "react";

const Home = lazy(() => import("@zjp-web/common/pages/Home"));
const About = lazy(() => import("@zjp-web/common/pages/About"));
const Login = lazy(() => import("@zjp-web/common/pages/Login"));

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.FC>;
  isProtected: boolean;
}

export const basicRoutes: RouteConfig[] = [
  { path: "/", component: Home, isProtected: false },
  { path: "/about", component: About, isProtected: false },
  { path: "/login", component: Login, isProtected: false },
];
