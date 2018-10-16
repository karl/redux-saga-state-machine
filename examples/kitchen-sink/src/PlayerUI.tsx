import * as React from 'react';
import { connect } from 'react-redux';
import * as player from './player';

const Player = ({
  currentState,
  numPlayed,
  onShowPlayer,
  onStop,
  onPlay,
  onPause,
  onShowConfirm,
  onHideConfirm,
  onNext,
  onError,
}: any) => {
  return (
    <div>
      <h2>Player</h2>
      <div>Current State: {JSON.stringify(currentState)}</div>
      <div>Num played: {numPlayed}</div>

      <div>
        <button onClick={onShowPlayer}>Show player</button>
        <button onClick={onPlay}>Play</button>
        <button onClick={onPause}>Pause</button>
        <button onClick={onShowConfirm}>Show confirm</button>
        <button onClick={onHideConfirm}>Hide confirm</button>
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
  onShowPlayer: player.actions.showPlayer,
  onStop: player.actions.stop,
  onPlay: player.actions.play,
  onPause: player.actions.pause,
  onShowConfirm: player.actions.showConfirm,
  onHideConfirm: player.actions.hideConfirm,
  onNext: player.actions.next,
  onError: player.actions.error,
};

export const ConnectedPlayer: any = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Player);
