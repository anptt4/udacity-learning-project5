import 'source-map-support/register'
import { TodosAccess } from '../dataLayer/todosAcess'
import { TodosStorage } from '../dataLayer/todosStorage';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodoRequest })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  // FIXME: 403?
  }

  todosAccess.updateTodoItem(userId, todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
    throw new Error('User is not authorized to delete item')  // FIXME: 403?
  }

  todosAccess.deleteTodoItem(userId, todoId)
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  logger.info(`Generating attachment URL for attachment ${attachmentId}`)

  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)

  logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  // FIXME: 403?
  }

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
  logger.info(`Generating upload URL for attachment ${attachmentId}`)

  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)

  return uploadUrl
}

export async function createAttachmentDownloadedUrl(attachmentId: string): Promise<string> {
  logger.info(`create downloaded URL for attachment ${attachmentId}`)

  const downloadedUrl = await todosStorage.createAttachmentDownloadedUrl(attachmentId)

  return downloadedUrl
}

export async function removeAttachment(attachmentId: string): Promise<void> {
  logger.info(`create downloaded URL for attachment ${attachmentId}`)

  const removeAttachment = await todosStorage.removeAttachment(attachmentId)

  return removeAttachment
}

export async function updateTodoRemoveAttachmenttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
  logger.info(`update todo remove attachment URL`)

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}