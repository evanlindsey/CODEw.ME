const PROTOCOL = 'http';
const HOST = 'localhost';
const CLIENT_PORT = '4200';
const SERVER_PORT = '5000';

export const environment = {
  production: false,
  CLIENT_URL: `${PROTOCOL}://${HOST}:${CLIENT_PORT}`,
  SERVER_URL: `${PROTOCOL}://${HOST}:${SERVER_PORT}`,
  ACE_CDN: 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.7/src-noconflict',
  DEFAULT_THEME: 'monokai'
};
