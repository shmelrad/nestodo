import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthService } from '../src/auth/auth.service'
import * as path from 'path'
import * as fs from 'fs'

describe('Attachments (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authService: AuthService
  let authToken: string
  let workspaceId: number
  let boardId: number
  let taskListId: number
  let taskId: number
  // Create a temporary test file
  const testFilePath = path.join(__dirname, 'test-file.txt')

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    prisma = moduleFixture.get<PrismaService>(PrismaService)
    authService = moduleFixture.get<AuthService>(AuthService)

    // Create a test file for uploads
    fs.writeFileSync(testFilePath, 'This is a test file for attachment uploads.')

    await app.init()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()

    const registration = await authService.register({
      email: `test@example.com`,
      username: `testuser`,
      password: 'password123',
    })
    authToken = registration.access_token

    const workspaceResponse = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Workspace' })

    workspaceId = workspaceResponse.body.id

    const boardResponse = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Board',
        workspaceId: workspaceId,
      })

    boardId = boardResponse.body.id

    const taskListResponse = await request(app.getHttpServer())
      .post('/task-lists')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task List',
        boardId: boardId,
      })

    taskListId = taskListResponse.body.id

    const taskResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task',
        taskListId: taskListId,
      })

    taskId = taskResponse.body.id
  })

  afterAll(async () => {
    await prisma.user.deleteMany()

    // Remove the test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }

    const uploadsPath = path.join(process.cwd(), 'uploads/test')
    if (fs.existsSync(uploadsPath)) {
      fs.rmSync(uploadsPath, { recursive: true })
    }

    await app.close()
  })

  describe('POST /attachments/upload/:taskId', () => {
    it('should upload a file attachment', async () => {
      const response = await request(app.getHttpServer())
        .post(`/attachments/upload/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        originalFileName: 'test-file.txt',
        contentType: 'text/plain',
        size: expect.any(Number),
        taskId: taskId,
      })
    })

    it('should fail to upload attachment with invalid task', async () => {
      await request(app.getHttpServer())
        .post('/attachments/upload/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(404)
    })
  })

  describe('GET /attachments/:id', () => {
    let attachmentId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/attachments/upload/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)

      attachmentId = response.body.id
    })

    it('should get attachment metadata by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: attachmentId,
        originalFileName: 'test-file.txt',
        contentType: 'text/plain',
        size: expect.any(Number),
        taskId: taskId,
      })
    })

    it('should fail to get non-existent attachment', async () => {
      await request(app.getHttpServer())
        .get('/attachments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('GET /attachments/download/:id', () => {
    let attachmentId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/attachments/upload/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)

      attachmentId = response.body.id
    })

    it('should download file content', async () => {
      const response = await request(app.getHttpServer())
        .get(`/attachments/download/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename="test-file.txt"')

      expect(response.text).toBe('This is a test file for attachment uploads.')
    })

    it('should fail to download non-existent attachment', async () => {
      await request(app.getHttpServer())
        .get('/attachments/download/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('DELETE /attachments/:id', () => {
    let attachmentId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/attachments/upload/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)

      attachmentId = response.body.id
    })

    it('should delete attachment', async () => {
      await request(app.getHttpServer())
        .delete(`/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .get(`/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should fail to delete non-existent attachment', async () => {
      await request(app.getHttpServer())
        .delete('/attachments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('Attachment Authorization', () => {
    let otherUserAuthToken: string
    let otherUserWorkspaceId: number
    let otherUserBoardId: number
    let otherUserTaskListId: number
    let otherUserTaskId: number
    let otherUserAttachmentId: number

    beforeEach(async () => {
      const registration = await authService.register({
        email: 'other@example.com',
        username: 'otheruser',
        password: 'password123',
      })
      otherUserAuthToken = registration.access_token

      const workspaceResponse = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({ title: 'Other User Workspace' })

      otherUserWorkspaceId = workspaceResponse.body.id

      const boardResponse = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({
          title: 'Other User Board',
          workspaceId: otherUserWorkspaceId,
        })

      otherUserBoardId = boardResponse.body.id

      const taskListResponse = await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({
          title: 'Other User Task List',
          boardId: otherUserBoardId,
        })

      otherUserTaskListId = taskListResponse.body.id

      const taskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({
          title: 'Other User Task',
          taskListId: otherUserTaskListId,
        })

      otherUserTaskId = taskResponse.body.id

      const attachmentResponse = await request(app.getHttpServer())
        .post(`/attachments/upload/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .attach('file', testFilePath)

      otherUserAttachmentId = attachmentResponse.body.id
    })

    it('should not allow access to attachment belonging to another user', async () => {
      await request(app.getHttpServer())
        .get(`/attachments/${otherUserAttachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow downloading attachment belonging to another user', async () => {
      await request(app.getHttpServer())
        .get(`/attachments/download/${otherUserAttachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow deletion of attachment belonging to another user', async () => {
      await request(app.getHttpServer())
        .delete(`/attachments/${otherUserAttachmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow uploading attachment to another user task', async () => {
      await request(app.getHttpServer())
        .post(`/attachments/upload/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(404)
    })
  })
})
