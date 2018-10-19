import * as React from 'react';
import { connect } from 'react-redux';
import { ConnectedMockPlayer } from './MockPlayer';
import * as player from './player';

const Player = ({
  currentState,
  numPlayed,
  onStartPlayback,
  onClosePlayer,
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

      <ConnectedMockPlayer />

      <div>
        <button onClick={onStartPlayback}>Start playback</button>
        <button onClick={onClosePlayer}>Close player</button>
        <button onClick={onError}>Error</button>
        <br />
        <button onClick={onPlay}>Play</button>
        <button onClick={onPause}>Pause</button>
        <button onClick={onNext}>Next</button>
        <br />
        <button onClick={onShowConfirm}>Show confirm</button>
        <button onClick={onHideConfirm}>Hide confirm</button>
      </div>

      <div>Current State: {JSON.stringify(currentState)}</div>
      <div>Num played: {numPlayed}</div>
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
  onStartPlayback: player.actions.startPlayback,
  onClosePlayer: player.actions.closePlayer,
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
