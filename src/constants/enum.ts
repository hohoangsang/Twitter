export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image = 'IMAGE',
  Video = 'VIDEO',
  HLS = 'HLS'
}

export enum EncodeHLSType {
  pending = 'PENDING',
  encoding = 'ENCODING',
  complete = 'COMPLETE',
  failed = 'FAILED'
}

export enum TweetType {
  Tweet = 'TWEET',
  Retweet = 'RETWEET',
  Comment = 'COMMENT',
  QuoteTweet = 'QUOTETWEET'
}

export enum TweetAudience {
  Everyone = 'EVERYONE',
  TwitterCircle = 'TWITTERCIRCLE'
}
