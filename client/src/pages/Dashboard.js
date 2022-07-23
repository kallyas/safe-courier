import React from 'react';
import Card from '../components/Card';
import IconCheck from '../components/icons/IconCheck';
import SideNav from '../components/navigation/SideNav';

const Dashboard = () => {
  return (
    <div className="template-default">
      <SideNav />
      <div className="template-default__wrap">
        <div className="dashboard">
          <div className="eyebrow">
            <div className="gutter--left gutter--right eyebrow__wrap">
              <nav className="step-nav">
                <span>Dashboard</span>
              </nav>
            </div>
          </div>
          <div className="gutter--left gutter--right dashboard__wrap">
            <div className="before-dashboard">
              <div className="banner banner--type-success">
                <span className="banner__content">
                  <IconCheck />
                  safe courier is an open source project. &nbsp;
                  <a
                    href="https://github.com/kallyas/safe-courier"
                  >
                    leave us a star on GitHub!
                  </a>
                </span>
              </div>
            </div>
            <h2 className="dashboard__label">Collections</h2>
            <div className="dashboard__card-list">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
                <li key={i}>
                  <Card key={i} title="Collections" />
                </li>
              ))}
            </div>
            <h2 className="dashboard__label">Globals</h2>
            <div className="dashboard__card-list">
              <li>
                <div className="card card--has-onclick">
                  <h5>Main Menu</h5>
                  <button
                    type="button"
                    className="btn card__click btn--style-none btn--icon-style-without-border btn--size-medium btn--icon-position-right"
                  >
                    <span className="btn__content"></span>
                  </button>
                </div>
              </li>
              <div className="after-dashboard">
                <h4>Join our Discord</h4>
                <p>
                  Every day, developers are actively talking about Payload and
                  helping each other build awesome things in our Discord
                  community. It can be a great resource to learn about what's
                  happening with Payload before anyone else and get quick help
                  straight from the Payload team as well as our community.{' '}
                  <a href="/dashboard">Click here to join!</a>
                </p>
                <h4>Talk with us</h4>
                <p>
                  We're here to help! You can{' '}
                  <a href="mailto:info@safe-courier.ml">email us</a> with any
                  questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
