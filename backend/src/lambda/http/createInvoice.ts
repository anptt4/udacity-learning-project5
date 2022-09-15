import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateInvoiceRequest } from '../../requests/CreateInvoiceRequest'
import { getUserId } from '../utils';
import { createInvoice } from '../../businessLogic/invoice'
import { InvoiceItem } from '../../models/InvoiceItem'
import { createAttachmentPresignedUrl } from '../../businessLogic/invoice'
import { getAttachmentUrl } from '../helpers/attachmentUtils'
import * as uuid from 'uuid'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newInvoice: CreateInvoiceRequest = JSON.parse(event.body)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };
    if (!newInvoice.title || newInvoice.title.trim() == "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invoice title is required`
        })
      }
    }
    if (!newInvoice.content || newInvoice.content.trim() == "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invoice content is required`
        })
      }
    }
    try {
      const userId: string = getUserId(event)
      const img = uuid.v4()
      const url: string = await createAttachmentPresignedUrl(img)
      newInvoice.urlImage = getAttachmentUrl(img)
      const invoiceItem: InvoiceItem = await createInvoice(userId, newInvoice)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ item: invoiceItem, url: url })
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error })
      };
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
