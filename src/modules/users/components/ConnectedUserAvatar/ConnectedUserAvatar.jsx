/* @flow */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import type { Dispatch } from 'redux';
import type { Props as UserAvatarProps } from '~core/UserAvatar/UserAvatar.jsx';

import UserAvatar from '~core/UserAvatar';

import { targetUserProfile } from '../../selectors';
import { fetchUserProfile } from '../../actionCreators';

type Props = UserAvatarProps & {
  loadUser: (username: string) => void,
};

class ConnectedUserAvatar extends Component<Props> {
  componentDidMount() {
    const { loadUser, walletAddress } = this.props;
    loadUser(walletAddress);
  }

  render() {
    return <UserAvatar {...this.props} />;
  }
}

const mapStateToProps = (state, props) => ({
  // TODO: select `avatarData` from this
  avatarURL: targetUserProfile(state, props),
});

const mapDispatchToProps = (dispatch: Dispatch<*>) => ({
  loadUser: username => {
    dispatch(fetchUserProfile(username));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConnectedUserAvatar);
