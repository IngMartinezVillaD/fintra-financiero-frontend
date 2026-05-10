export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/fintra-financiero-service/api/v1',
  enableSwaggerLink: true,
  loggingLevel: 'debug',
  featureFlags: {
    gmfControl: true,
    integrationERP: false,
    dashboardReportes: true,
  },
};
