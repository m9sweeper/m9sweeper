export default {
  base: {
    directory: (() => {
      return __dirname.endsWith('config') ? __dirname + '/../' : __dirname + '/';
    })()
  },
  loginAttemptAllowed: process.env.LOGIN_ATTEMPT_ALLOWED || '20',
}
