import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, updateInvoice } from '../../businessLogic/invoice'
import { UpdateInvoiceRequest } from '../../requests/UpdateInvoiceRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { deleteObject, getAttachmentUrl } from '../helpers/attachmentUtils'
import * as uuid from 'uuid'

const logger = createLogger("updateInvoice")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };
    try {
      const invoiceId = event.pathParameters.invoiceId
      const updatedInvoice: UpdateInvoiceRequest = JSON.parse(event.body)
      if (!invoiceId || invoiceId.trim() === "") {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Invalid invoice id`
          })
        }
      }
      if (!updatedInvoice.title || updatedInvoice.title.trim() == "") {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Invoice title is required`
          })
        }
      }
      if (!updatedInvoice.content || updatedInvoice.content.trim() == "") {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Invoice content is required`
          })
        }
      }
      if (!updatedInvoice.urlImage || updatedInvoice.urlImage.trim() == "") {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Invoice url image is required`
          })
        }
      }
      const imageId = updatedInvoice.urlImage.split("/")[updatedInvoice.urlImage.split("/").length - 1]


      const userId: string = getUserId(event)

      logger.info(`url imag ${imageId}`)

      await deleteObject(imageId)
      const img = uuid.v4()
      const url: string = await createAttachmentPresignedUrl(img)
      updatedInvoice.urlImage = getAttachmentUrl(img)


      logger.info(`User ${userId} update invoice item id ${invoiceId} ${updatedInvoice}`)
      await updateInvoice(userId, invoiceId, updatedInvoice)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ url })
      }
    } catch (error) {
      logger.error(` update invoice item id err  ${error}`)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error })
      }
    }

  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
