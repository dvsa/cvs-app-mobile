const { argv } = require('yargs');

const {
  ENVIRONMENT,
  BASE_URL,
  END_ENV,
  AZURE_CLIENT_ID,
  AZURE_TENANT_ID,
  AUTH_REDIRECT_URL,
  APP_KEY_PHONE_NUMBER,
  SENTRY_DSN,
  UNAUTH_LOGS_API_KEY,
  URL_LATEST_VERSION
} = process.env;

const isProduction = ENVIRONMENT === 'production';

export const hybridConfig = `export default {
  "IS_PRODUCTION": "${isProduction}",
  "app": {
    "CLIENT_ID": "${AZURE_CLIENT_ID}",
    "TENANT_ID": "${AZURE_TENANT_ID}",
    "STAFF_ID_KEY": "extn.StaffId",
    "KEY_PHONE_NUMBER": "${APP_KEY_PHONE_NUMBER}",
    "AUTH_REDIRECT_URL": "${AUTH_REDIRECT_URL}",
    "UNAUTH_LOGS_API_KEY": "${UNAUTH_LOGS_API_KEY}",
    "BACKEND_URL_SIGNATURE": "${BASE_URL}/${END_ENV}/cvs-signature-nonprod/${END_ENV}%2F",
    "BACKEND_URL":"${BASE_URL}/${END_ENV}",
    "URL_LATEST_VERSION": "${URL_LATEST_VERSION}"
  },
  "sentry": {
    "SENTRY_ENV": "${END_ENV}",
    "SENTRY_DSN": "${SENTRY_DSN}",
  }
}`;
