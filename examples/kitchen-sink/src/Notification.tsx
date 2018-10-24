import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { actions, selectors } from './player';

const Container = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  background: #cccccc;
  color: #222222;
  padding: 8px;
`;

const CloseButton = styled.button`
  margin: 0;
  padding: 2px;
  background: transparent;
  font-size: 20px;
  line-height: 10px;
  vertical-align: text-top;
`;

export const Notification = ({ visible, message, onHide }) => {
  if (!visible) {
    return null;
  }
  return (
    <Container>
      {message} <CloseButton onClick={onHide}>⨯</CloseButton>
    </Container>
  );
};

const mapStateToProps = (state) => {
  return {
    visible: selectors.isNotificationVisible(state),
    message: selectors.notificationMessage(state),
  };
};

const mapDispatchToProps = {
  onHide: actions.hideNotification,
};

export const ConnectedNotification = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Notification);
