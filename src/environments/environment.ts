// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  protocol: 'http',
  /*domain: 'allenbaiyee.homelinux.net',
  port: '8086',*/
  domain: 'localhost',
  port: '8081',
  timeout: 5000,
  clientId: "admin",
  clientSecret: "password"
};
