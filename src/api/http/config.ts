export const CURRENT_CONFIG = {

  // license
  appId: '165671', // You need to go to the development website to apply.
  appKey: '0843653c532462ccb7b9f9e765df73b', // You need to go to the development website to apply.
  appLicense: 'seE238RXAmthB3/CD2svcyBigpK5ELciJ6bNkkwBPMDwbvXHuz5jULnx+bqlUYOotfCxgm9u6M34O7Ms1kuAVQT4EOBXyOdFqAvVNBJtAUdvnlmtzr/nIxfiEg00vCBVXq/xA/yxt0cW7f5F0lc6S+Eh2qDBOqDxdOlAdtF3zFI=', // You need to go to the development website to apply.

  // http
  baseURL: 'http://192.168.110.149:6789/', // This url must end with "/". Example: 'http://192.168.1.1:6789/'
  websocketURL: 'ws://192.168.110.149:6789/api/v1/ws', // Example: 'ws://192.168.1.1:6789/api/v1/ws'

  // livestreaming
  // RTMP  Note: This IP is the address of the streaming server. If you want to see livestream on web page, you need to convert the RTMP stream to WebRTC stream.
  rtmpURL: 'Please enter the rtmp access address.', // Example: 'rtmp://192.168.1.1/live/'
  // GB28181 Note:If you don't know what these parameters mean, you can go to Pilot2 and select the GB28181 page in the cloud platform. Where the parameters same as these parameters.
  gbServerIp: 'Please enter the server ip.',
  gbServerPort: 'Please enter the server port.',
  gbServerId: 'Please enter the server id.',
  gbAgentId: 'Please enter the agent id',
  gbPassword: 'Please enter the agent password',
  gbAgentPort: 'Please enter the local port.',
  gbAgentChannel: 'Please enter the channel.',
  // RTSP
  rtspUserName: 'Please enter the username.',
  rtspPassword: 'Please enter the password.',
  rtspPort: '8554',
  // Agora
  agoraAPPID: 'Please enter the agora app id.',
  agoraToken: 'Please enter the agora temporary token.',
  agoraChannel: 'Please enter the agora channel.',

  // map
  // You can apply on the AMap website.
  amapKey: '20e26ddd0601376dfd3fe1161b70eb63',

}
