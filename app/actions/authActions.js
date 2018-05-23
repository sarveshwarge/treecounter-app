import { NotificationManager } from '../notification/PopupNotificaiton/notificationManager';
import { updateRoute } from '../helpers/routerHelper';
import { loadLoginData } from './loadLoginData';
import { debug } from '../debug/index';
import { userLogout } from '../reducers/reducer';

import { clearStorage } from '../stores/localStorage';
import { getAccessToken } from '../utils/user';
import { postRequest } from '../utils/api';
import { updateJWT } from '../utils/user';

export function login(data) {
  const request = postRequest('api_login_check', data);

  return dispatch => {
    request
      .then(res => {
        const { token, refresh_token } = res.data;
        updateJWT(token, refresh_token);
        dispatch(loadLoginData());
        return token;
      })
      .then(() => {
        NotificationManager.success('Login Successful', 'Congrats', 5000);
        updateRoute('app_userHome', dispatch);
      })
      .catch(error => {
        if (
          error !== undefined &&
          error.response !== undefined &&
          error.response.status === 401
        ) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          debug(error.response.data);
          NotificationManager.error(
            error.response.data.message,
            error.response.data.code,
            5000
          );
        } else {
          NotificationManager.error(error.message, 'Login Error', 5000);
        }
      });
  };
}

export function logoutUser() {
  return dispatch => {
    debug('Logging out');
    clearStorage();
    dispatch(userLogout());
  };
}

export function forgot_password(data) {
  return dispatch => {
    postRequest('auth_forgotPassword_post', data)
      .then(res => {
        debug(res.status);
        updateRoute('app_passwordSent', dispatch);
      })
      .catch(err => debug(err));
  };
}

export function reset_password(data) {
  getAccessToken().then(token => {
    data.token = token;
    postRequest('auth_resetPassword_post', data)
      .then(res => {
        debug(res.status);
      })
      .catch(err => debug(err));
  });
}
