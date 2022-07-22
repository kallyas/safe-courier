import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
];

const userRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
  
userRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
  

export default router;