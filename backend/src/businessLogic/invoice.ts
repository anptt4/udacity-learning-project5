import { InvoiceAccess } from '../dataLayer/invoiceAccess'
import { generatePresignedUrl } from '../lambda/helpers/attachmentUtils';
import { InvoiceItem } from '../models/InvoiceItem'
import { CreateInvoiceRequest } from '../requests/CreateInvoiceRequest'
import { UpdateInvoiceRequest } from '../requests/UpdateInvoiceRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todoAccess = new InvoiceAccess();
const logger = createLogger('Invoices')


export async function getInvoicesForUser(
  userId: string
): Promise<InvoiceItem[]> {
  logger.info("getInvoicesForUser")
  return todoAccess.getInvoices(userId);
}


export async function findInvoicesByName(
  userId: string,
  title: string
): Promise<InvoiceItem[]> {
  logger.info("getInvoicesForUser")
  return todoAccess.findInvoicesByName(userId,title);
}


export async function createInvoice(
  userId: string,
  newInvoiceData: CreateInvoiceRequest
): Promise<InvoiceItem> {
  const invoiceId = uuid.v4();
  const createdAt = new Date().toISOString();
  const newInvoice: InvoiceItem = { userId, invoiceId, createdAt, ...newInvoiceData };
  logger.info("createInvoice")
  return todoAccess.createInvoice(newInvoice);
}

export async function updateInvoice(
  userId: string,
  todoId: string,
  updateData: UpdateInvoiceRequest
): Promise<void> {
  logger.info(` content ${updateData.content}`)
  logger.info(` title ${updateData.title}`)
  logger.info(` urlImage ${updateData.urlImage}`)

  return todoAccess.updateInvoice(userId, todoId, updateData);
}

export async function deleteInvoice(
  userId: string,
  todoId: string
): Promise<void> {
  logger.info(`deleteInvoice  ${userId}   ${todoId}`)
  return todoAccess.deleteInvoice(userId, todoId);
}

export async function createAttachmentPresignedUrl(img :string): Promise<string> {
 
  const url: string = generatePresignedUrl(img)
  logger.info(`generatePresignedUrl  ${url}`)
  return url
}
