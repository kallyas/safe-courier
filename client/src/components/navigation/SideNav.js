import React from 'react';

const SideNav = () => {
  return (
    <aside className="nav">
      <div className="nav__scroll">
        <header>
          <a className="nav__brand" href="/dashboard">
            Safe Courier
          </a>
          <button type="button" className="nav__mobile-menu-btn">
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              className="icon icon--menu"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3.5" y="4.5" width="18" height="2" className="fill"></rect>
              <rect x="3.5" y="11.5" width="18" height="2" className="fill"></rect>
              <rect x="3.5" y="18.5" width="18" height="2" className="fill"></rect>
            </svg>
          </button>
        </header>
        <div className="nav__wrap">
          <span className="nav__label">Collections</span>
          <nav>
            <a id="nav-categories" href="/admin/collections/categories">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Categories
            </a>
            <a id="nav-media" href="/admin/collections/media">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Media
            </a>
            <a id="nav-posts" href="/admin/collections/posts">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Posts
            </a>
            <a id="nav-pages" href="/admin/collections/pages">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Pages
            </a>
            <a id="nav-users" href="/admin/collections/users">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Users
            </a>
            <a id="nav-alerts" href="/admin/collections/alerts">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Alerts
            </a>
            <a id="nav-forms" href="/admin/collections/forms">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Forms
            </a>
            <a
              id="nav-form-submissions"
              href="/admin/collections/form-submissions"
            >
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Form Submissions
            </a>
          </nav>
          <span className="nav__label">Globals</span>
          <nav>
            <a id="nav-global-mainMenu" href="/admin/globals/mainMenu">
              <svg
                className="icon icon--chevron"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <path className="stroke" d="M9 10.5L12.5 14.5L16 10.5"></path>
              </svg>
              Main Menu
            </a>
          </nav>
          <div className="nav__controls">
            <div className="localizer">
              <div className="popup popup--size-small popup--color-light popup--v-align-top popup--h-align-left">
                <div className="popup__wrapper">
                  <button
                    type="button"
                    className="popup-button popup-button--default"
                  >
                    en
                  </button>
                </div>
                <div className="popup__content">
                  <div className="popup__wrap">
                    <div className="popup__scroll">
                      <div>
                        <span>Locales</span>
                        <ul>
                          <li className="localizer__locale false">
                            <a href="/?locale=es">es</a>
                          </li>
                          <li className="localizer__locale false">
                            <a href="/?locale=de">de</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a className="nav__account" href="/admin/account">
              <svg
                className="graphic-account"
                width="25"
                height="25"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 25 25"
              >
                <style></style>
                <circle className="circle1" cx="12.5" cy="12.5" r="11.5"></circle>
                <circle className="circle2" cx="12.5" cy="10.73" r="3.98"></circle>
                <path d="M12.5,24a11.44,11.44,0,0,0,7.66-2.94c-.5-2.71-3.73-4.8-7.66-4.8s-7.16,2.09-7.66,4.8A11.44,11.44,0,0,0,12.5,24Z"></path>
              </svg>
            </a>
            <a className="nav__log-out" href="/admin/logout">
              <svg
                className="icon icon--logout"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 5H18V19H10" className="stroke"></path>
                <g>
                  <path
                    d="M8 8.5L4.46447 12.0355L8 15.5711"
                    className="stroke"
                  ></path>
                  <line x1="5" y1="12" x2="13" y2="12" className="stroke"></line>
                </g>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
