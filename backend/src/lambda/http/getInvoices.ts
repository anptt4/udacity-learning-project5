import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getInvoicesForUser as getInvoicesForUser } from '../../businessLogic/invoice'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
const logger = createLogger("getInvoices")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    };
    try {
     
      const userId: string = getUserId(event)
      logger.error(` gets invoice user id  ${userId}`)
      const invoices = await getInvoicesForUser(userId)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ items: invoices })
      }
    } catch (error) {
      logger.error(` gets invoice err  ${error}`)
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
