import React, {Component} from 'react';
import PropTypes from 'prop-types';

const EmojiRating = (props) => {
  const coverPercentage = 100 - (props.rating / props.max) * 100;
  return (
    <span style={{position: 'relative'}}>
      {props.emoji}
      <span style={{
      background: `linear-gradient(270deg, white ${coverPercentage}%, transparent ${coverPercentage}%)`,
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      right: 0}}/>
    </span>
  );
};

EmojiRating.defaultProps = {
  emoji: '⭐⭐⭐⭐⭐'
};

EmojiRating.propTypes = {
  emoji: PropTypes.string,
  max: PropTypes.number.required,
  rating: PropTypes.number.required
};

export default EmojiRating;
