export default {
  maxFileSize: (+process.env.FILE_MANAGEMENT_MAX_FILE_FILE || 3) * 1000000,
  storage: process.env.FILE_MANAGEMENT_STORAGE || 'local',
  local: {
    dest: process.env.FILE_MANAGEMENT_LOCAL_DEST || '/mnt/storage'
  },
  s3: {
    region: process.env.FILE_MANAGEMENT_S3_REGION || '',
    accessKeyId: process.env.FILE_MANAGEMENT_S3_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.FILE_MANAGEMENT_S3_ACCESS_KEY_SECRET || '',
    bucketName: process.env.FILE_MANAGEMENT_S3_BUCKET_NAME || ''
  }
}
