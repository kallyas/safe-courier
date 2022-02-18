import React, { useEffect } from "react";
import { Button } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, authSelector } from "../features/auth/authSlice";

const Landing = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(authSelector);
  const navigate = useNavigate();


  useEffect(() => {
    if (!user) {
      navigate("/auth")
    }
  }, [user, dispatch, navigate])

  return (
    <>
      {user ? (
        <Button onClick={() => dispatch(logoutUser())}>Logout</Button>
      ) : (
        <div>
          Landing page <a href="/auth">Login or Register</a>
        </div>
      )}
    </>
  );
};

export default Landing;
