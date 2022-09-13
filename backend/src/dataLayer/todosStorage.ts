import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosStorage')

export class TodosStorage {

  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) { }

  async getAttachmentUrl(attachmentId: string): Promise<string> {
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
    return attachmentUrl
  }

  async getUploadUrl(attachmentId: string): Promise<string> {
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: attachmentId,
      Expires: Number(this.urlExpiration)
    })
    return uploadUrl
  }

  async createAttachmentDownloadedUrl(attachmentId: string): Promise<string> {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: attachmentId,
      Expires: Number(this.urlExpiration)
    })
  }


  async removeAttachment(attachmentId: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: attachmentId,
    };
    try {
      await this.s3.headObject(params).promise();
      logger.info("File found S3");
      try {
        await this.s3.deleteObject(params).promise();
        logger.info("File successfully deleted");
      } catch (err) {
        logger.error("Failed to delete S3: " + JSON.stringify(err));
      }
    } catch (err) {
      logger.error("File not found: " + err.code);
    }
  }
}