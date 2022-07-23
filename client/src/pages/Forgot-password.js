import React from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = React.useState('');

  return (
    <section className="forgot-password template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <form className="form">
          <h1>Forgot Password</h1>
          <p>
            Please enter your email below. You will receive an email message
            with instructions on how to reset your password.
          </p>
          <div className="field-type email">
            <label htmlFor="field-email" className="field-label">
              Email Address<span className="required">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-submit">
            <button
              type="submit"
              className="btn btn--style-primary btn--icon-style-without-border btn--size-medium btn--icon-position-right"
            >
              <span className="btn__content">
                <span className="btn__label">Submit</span>
              </span>
            </button>
          </div>
        </form>
        <a href="/auth">Back to login</a>
      </div>
    </section>
  );
};

export default ForgotPassword;
