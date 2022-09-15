import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const logger = createLogger('attachmentUtils')


export function generatePresignedUrl(imageId: string) {
    logger.info(` generatePresignedUrl  ${bucketName} iamge ${imageId}` )
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: Number(urlExpiration)
    })
}

export function deleteObject(imageId: string) {
    logger.info(` generatePresignedUrl  ${bucketName} iamge ${imageId}` )
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: Number(urlExpiration)
    })
}



export function getAttachmentUrl(imageId:string){
    return `https://${bucketName}.s3.amazonaws.com/${imageId}`
}