import React from 'react';
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { loginUser, authSelector } from '../features/auth/authSlice';

const Login = () => {
  const { user, isLoading, isError, errorMessage} = useSelector(authSelector)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
      }));
  }

  const handleSubmit = e => {
    e.preventDefault()
    dispatch(loginUser(formData))
  }

  return (
    <section className="login template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <div className="login__brand">Safe Courier</div>
        <form onSubmit={handleSubmit} className="form">
          <div className="field-type email">
            <label htmlFor="field-email" className="field-label">
              Email Address<span className="required">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="field-type password">
            <label htmlFor="field-password" className="field-label">
              Password<span className="required">*</span>
            </label>
            <input
              id="field-password"
              type="password"
              autoComplete="off"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <a href="/forgot">Forgot password?</a>
          <div className="form-submit">
            <button
              type="submit"
              className="btn btn--style-primary btn--icon-style-without-border btn--size-medium btn--icon-position-right"
            >
              <span className="btn__content">
                <span className="btn__label">
                  {isLoading ? "Loading....": "Login"}
                </span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;