const PROTOCOL = 'https';
const CLIENT_HOST = 'codew.me';
const SERVER_HOST = 'codewme.herokuapp.com';

export const environment = {
  production: true,
  CLIENT_URL: `${PROTOCOL}://${CLIENT_HOST}`,
  SERVER_URL: `${PROTOCOL}://${SERVER_HOST}`,
  ACE_CDN: 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.7/src-noconflict',
  DEFAULT_THEME: 'monokai'
};
