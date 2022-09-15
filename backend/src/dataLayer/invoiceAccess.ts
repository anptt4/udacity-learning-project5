import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { InvoiceItem } from '../models/InvoiceItem'
import { InvoiceUpdate } from '../models/InvoiceUpdate';
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('InvoiceAccess')

export class InvoiceAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly invoicesTable = process.env.INVOICES_TABLE
  ) { }

  async getInvoices(userId: string): Promise<InvoiceItem[]> {
    logger.info('Getting all invoice items');
    const result = await this.docClient
      .query({
        TableName: this.invoicesTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise();
    return result.Items as InvoiceItem[];
  }

  async findInvoicesByName(userId: string, name: string): Promise<InvoiceItem[]> {
    logger.info(`findInvoicesByName invoice item: ${name}`);
    const result = await this.docClient
      .query({
        TableName: this.invoicesTable,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: ' contains(content, :key) or contains (title, :key)',
        ExpressionAttributeValues: {
          ':key': name,
          ':userId': userId
        }
      })
      .promise();
    const invoiceItem = result.Items;
    return invoiceItem as InvoiceItem[];
  }

  async createInvoice(newInvoice: InvoiceItem): Promise<InvoiceItem> {
    logger.info(`Creating newInvoice item: ${newInvoice.invoiceId}`);
    await this.docClient
      .put({
        TableName: this.invoicesTable,
        Item: newInvoice
      })
      .promise();
    return newInvoice;
  }

  async updateInvoice(userId: string, invoiceId: string, invoice: InvoiceUpdate): Promise<void> {
    logger.info(`updateInvoice: ${invoiceId}`);
    await this.docClient.update({
      TableName: this.invoicesTable,
      Key: {
        "invoiceId": invoiceId,
        "userId": userId
      },
      UpdateExpression: "set content = :content , title = :title ,price = :price, urlImage = :urlImage",
      //  ExpressionAttributeNames: { '#n': 'name' },
      ExpressionAttributeValues: {
        ":content": invoice.content,
        ":title": invoice.title,
        ":price": invoice.price,
        ":urlImage": invoice.urlImage
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

  }

  async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.invoicesTable,
        Key: { userId, invoiceId }
      })
      .promise();
  }

  async saveImgUrl(userId: string, invoiceId: string, bucketName: string): Promise<void> {
    await this.docClient
      .update({
        TableName: this.invoicesTable,
        Key: { userId, invoiceId },
        UpdateExpression: 'set urlImage = :urlImage',
        ExpressionAttributeValues: {
          ':urlImage': bucketName
        }
      })
      .promise();
  }
}
