// This file has been autogenerated.

exports.setEnvironment = function() {
  process.env['USER_ID'] = 'UK8CH2281:TKGSUQHQE';
  process.env['BOT_ID'] = 'BKGSYSTFG:TKGSUQHQE';
  process.env['HOST_URL'] = 'https://slack.botframework.com';
  process.env['AZURE_SUBSCRIPTION_ID'] = '0389857f-2464-451b-ac83-5f54d565b1a7';
};

exports.scopes = [[function (nock) { 
var result = 
nock('https://slack.botframework.com:443', {"encodedQueryParams":true})
  .filteringRequestBody(function (path) { return '*';})
.post('/v3/conversations', '*')
  .reply(200, {"id":"BKGSYSTFG:TKGSUQHQE:DKE8NUG92"}, [ 'Cache-Control',
  'no-cache',
  'Pragma',
  'no-cache',
  'Content-Length',
  '45',
  'Content-Type',
  'application/json; charset=utf-8',
  'Expires',
  '-1',
  'Server',
  'Microsoft-IIS/10.0',
  'x-ms-request-id',
  '|28a0b07e4df62c4394992a3eb7b1bf0e.81c15016_',
  'Strict-Transport-Security',
  'max-age=31536000',
  'Date',
  'Wed, 19 Jun 2019 22:23:45 GMT',
  'Connection',
  'close' ]);
 return result; },
function (nock) { 
var result = 
nock('https://slack.botframework.com:443', {"encodedQueryParams":true})
  .filteringRequestBody(function (path) { return '*';})
.post('/v3/conversations/BKGSYSTFG%3ATKGSUQHQE%3ADKE8NUG92/attachments', '*')
  .reply(200, {"id":"at26759-3G5Y5oukH9E-e"}, [ 'Cache-Control',
  'no-cache',
  'Pragma',
  'no-cache',
  'Content-Length',
  '37',
  'Content-Type',
  'application/json; charset=utf-8',
  'Expires',
  '-1',
  'Server',
  'Microsoft-IIS/10.0',
  'x-ms-request-id',
  '|52dd72f43a79984b8e9d473b30246f4b.81c15017_',
  'Strict-Transport-Security',
  'max-age=31536000',
  'Date',
  'Wed, 19 Jun 2019 22:23:45 GMT',
  'Connection',
  'close' ]);
 return result; }]];