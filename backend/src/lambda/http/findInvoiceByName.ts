import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { findInvoicesByName } from '../../businessLogic/invoice'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
const logger = createLogger("findInvoicesByName")

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        };
        const name: string =  event.queryStringParameters["name"]

        try {
            const userId: string = getUserId(event)
            logger.info(` findInvoicesByName  ${name}`)
            const invoices = await findInvoicesByName(userId, name)
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ items: invoices })
            }
        } catch (error) {
            logger.error(` findInvoicesByName err  ${error}`)
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
