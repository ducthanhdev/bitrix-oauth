export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  bitrix24: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    domain: process.env.BITRIX24_DOMAIN,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/install',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bitrix-oauth',
  },
});
