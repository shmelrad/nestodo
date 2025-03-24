import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthService } from '../src/auth/auth.service'

describe('TaskLists (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authService: AuthService
  let authToken: string
  let workspaceId: number
  let boardId: number

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    prisma = moduleFixture.get<PrismaService>(PrismaService)
    authService = moduleFixture.get<AuthService>(AuthService)

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
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await app.close()
  })

  describe('POST /task-lists', () => {
    it('should create a task list', async () => {
      const response = await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task List',
          boardId: boardId,
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: 'Test Task List',
        boardId: boardId,
        position: expect.any(Number),
      })
    })

    it('should fail to create task list with invalid board', async () => {
      await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task List',
          boardId: 999999,
        })
        .expect(404)
    })

    it('should fail to create task list without auth', async () => {
      await request(app.getHttpServer())
        .post('/task-lists')
        .send({
          title: 'Test Task List',
          boardId: boardId,
        })
        .expect(401)
    })

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
    })
  })

  describe('PATCH /task-lists/:id', () => {
    let taskListId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task List',
          boardId: boardId,
        })
      taskListId = response.body.id
    })

    it('should update task list title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/task-lists/${taskListId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task List Title',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: taskListId,
        title: 'Updated Task List Title',
      })
    })

    it('should fail to update non-existent task list', async () => {
      await request(app.getHttpServer())
        .patch('/task-lists/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task List Title',
        })
        .expect(404)
    })
  })

  describe('DELETE /task-lists/:id', () => {
    let taskListId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task List',
          boardId: boardId,
        })
      taskListId = response.body.id
    })

    it('should delete task list', async () => {
      await request(app.getHttpServer())
        .delete(`/task-lists/${taskListId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .patch(`/task-lists/${taskListId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task List Title',
        })
        .expect(404)
    })

    it('should fail to delete non-existent task list', async () => {
      await request(app.getHttpServer())
        .delete('/task-lists/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('TaskList Authorization', () => {
    let otherUserAuthToken: string
    let otherUserWorkspaceId: number
    let otherUserBoardId: number
    let otherUserTaskListId: number

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
    })

    it('should not allow updates to task list belonging to another user', async () => {
      await request(app.getHttpServer())
        .patch(`/task-lists/${otherUserTaskListId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trying to update other user task list',
        })
        .expect(404)
    })

    it('should not allow deletion of task list belonging to another user', async () => {
      await request(app.getHttpServer())
        .delete(`/task-lists/${otherUserTaskListId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow creating task list in another user board', async () => {
      await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task List',
          boardId: otherUserBoardId,
        })
        .expect(404)
    })
  })
})
