import * as React from 'react';
import { connect } from 'react-redux';
import * as trafficLights from './trafficLights';

const TrafficLights = ({ currentState }) => {
  return (
    <div>
      <h2>Traffic Lights</h2>
      <div>Current State: {JSON.stringify(currentState, null, 2)}</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    currentState: trafficLights.selectors.selectCurrentState(state),
  };
};

export const ConnectedTrafficLights = connect(mapStateToProps)(TrafficLights);
