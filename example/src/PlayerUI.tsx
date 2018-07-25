import * as React from 'react';
import { connect } from 'react-redux';
import * as player from './player';

const Player = ({
  currentState,
  numPlayed,
  onPlay,
  onStop,
  onNext,
  onError,
}: {
  currentState: string;
  numPlayed: number;
  onPlay: any;
  onStop: any;
  onNext: any;
  onError: any;
}) => {
  return (
    <div>
      <h2>Player</h2>
      <div>Current State: {currentState}</div>
      <div>Num played: {numPlayed}</div>

      <div>
        <button onClick={onPlay}>Play</button>
        <button onClick={onStop}>Stop</button>
        <button onClick={onNext}>Next</button>
        <button onClick={onError}>Error</button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    currentState: player.selectors.selectCurrentState(state),
    numPlayed: player.selectors.selectNumPlayed(state),
  };
};

const mapDispatchToProps = {
  onPlay: player.actions.play,
  onStop: player.actions.stop,
  onNext: player.actions.next,
  onError: player.actions.error,
};

export const ConnectedPlayer: any = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Player);
