import {useHistory } from 'react-router-dom'

function NotFound() {
    const history = useHistory()

    const handleClick = () => {
        history.push("/home")
    }
  return (
    <>
      <div className="page-container page-error">
        <div className="page-content">
          <div className="page-inner">
            <div id="main-wrapper" className="container">
              <div className="row">
                <div className="col-md-6 center">
                  <h1 className="error-page-logo">404</h1>
                  <p className="error-page-top-text">
                    Oops.. Something went wrong..
                  </p>
                  <p className="error-page-bottom-text">
                    We can't seem to find the page you're looking for.
                  </p>
                  <button className="btn btn-primary m-b-xxs"
                  onClick={handleClick}>
                    Return Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
