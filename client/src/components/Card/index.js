import React from 'react';
import PlusIcon from '../icons/Plus';

const Card = (props) => {
  return (
    <div className="card card-categories card--has-onclick" id='card-categories'>
      <h5>{props.title}</h5>
      <div className="card__actions">
        <a
          type="button"
          className="btn btn--style-icon-label btn--icon btn--icon-style-with-border btn--icon-only btn--round btn--size-medium btn--icon-position-right"
          href={props.link}
        >
          <span className="btn__content">
            <span className="btn__icon">
              <PlusIcon />
            </span>
          </span>
        </a>
      </div>
      <button
        type="button"
        className="btn card__click btn--style-none btn--icon-style-without-border btn--size-medium btn--icon-position-right"
      >
        <span className="btn__content"></span>
      </button>
    </div>
  );
};

export default Card;
