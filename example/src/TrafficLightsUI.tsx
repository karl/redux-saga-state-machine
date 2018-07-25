import * as React from 'react';
import { connect } from 'react-redux';
import * as trafficLights from './trafficLights';

const TrafficLights = ({ currentState }: { currentState: string }) => {
  return (
    <div>
      <h2>Traffic Lights</h2>
      <div>Current State: {currentState}</div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    currentState: trafficLights.selectors.selectCurrentState(state),
  };
};

export const ConnectedTrafficLights: any = connect(mapStateToProps)(
  TrafficLights,
);
