import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { selectors } from './player';

const Stage = styled.div`
  display: flex;
  width: 200px;
  height: 150px;
`;

const App = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  background: #aabbcc;
  color: #444444;
`;

const PlayerBackground = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  background: #222222;
  color: #eeeeee;
`;

export const MockPlayer = ({
  numPlayed,
  isInApp,
  isInPlayer,
  isSwitching,
  isPlaying,
  isConfirmVisible,
}: any) => {
  return (
    <Stage>
      {isInApp && <App>App</App>}
      {isInPlayer && (
        <PlayerBackground>
          player
          <br />
          track {numPlayed}
          <br />
          {(isPlaying && 'playing') || 'paused'}
          <br />
          {isConfirmVisible && 'confirm'}
        </PlayerBackground>
      )}
      {isSwitching && <PlayerBackground>🌀</PlayerBackground>}
    </Stage>
  );
};

const mapStateToProps = (state: any) => {
  return {
    numPlayed: selectors.selectNumPlayed(state),
    isInApp: selectors.isInApp(state),
    isInPlayer: selectors.isInPlayer(state),
    isSwitching: selectors.isSwitching(state),
    isPlaying: selectors.isPlaying(state),
    isConfirmVisible: selectors.isConfirmVisible(state),
  };
};

export const ConnectedMockPlayer = connect(mapStateToProps)(MockPlayer);
