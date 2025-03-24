import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthService } from '../src/auth/auth.service'

describe('Subtasks (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authService: AuthService
  let authToken: string
  let workspaceId: number
  let boardId: number
  let taskListId: number
  let taskId: number

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
    await app.close()
  })

  describe('POST /subtasks', () => {
    it('should create a subtask', async () => {
      const response = await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Subtask',
          taskId: taskId,
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: 'Test Subtask',
        taskId: taskId,
        completed: false,
      })
    })

    it('should fail to create subtask with invalid task', async () => {
      await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Subtask',
          taskId: 999999,
        })
        .expect(404)
    })

    it('should fail to create subtask without auth', async () => {
      await request(app.getHttpServer())
        .post('/subtasks')
        .send({
          title: 'Test Subtask',
          taskId: taskId,
        })
        .expect(401)
    })

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
    })
  })

  describe('GET /subtasks/:id', () => {
    let subtaskId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Subtask',
          taskId: taskId,
        })
      subtaskId = response.body.id
    })

    it('should get a subtask by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subtasks/${subtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: subtaskId,
        title: 'Test Subtask',
        taskId: taskId,
        completed: false,
      })
    })

    it('should fail to get non-existent subtask', async () => {
      await request(app.getHttpServer()).get('/subtasks/999999').set('Authorization', `Bearer ${authToken}`).expect(404)
    })
  })

  describe('PATCH /subtasks/:id', () => {
    let subtaskId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Subtask',
          taskId: taskId,
        })
      subtaskId = response.body.id
    })

    it('should update subtask title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/subtasks/${subtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Subtask Title',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: subtaskId,
        title: 'Updated Subtask Title',
      })
    })

    it('should update subtask completed status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/subtasks/${subtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completed: true,
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: subtaskId,
        completed: true,
      })
    })

    it('should fail to update non-existent subtask', async () => {
      await request(app.getHttpServer())
        .patch('/subtasks/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Subtask Title',
        })
        .expect(404)
    })
  })

  describe('DELETE /subtasks/:id', () => {
    let subtaskId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Subtask',
          taskId: taskId,
        })
      subtaskId = response.body.id
    })

    it('should delete subtask', async () => {
      await request(app.getHttpServer())
        .delete(`/subtasks/${subtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .get(`/subtasks/${subtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should fail to delete non-existent subtask', async () => {
      await request(app.getHttpServer())
        .delete('/subtasks/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('Subtask Authorization', () => {
    let otherUserAuthToken: string
    let otherUserWorkspaceId: number
    let otherUserBoardId: number
    let otherUserTaskListId: number
    let otherUserTaskId: number
    let otherUserSubtaskId: number

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

      const subtaskResponse = await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({
          title: 'Other User Subtask',
          taskId: otherUserTaskId,
        })

      otherUserSubtaskId = subtaskResponse.body.id
    })

    it('should not allow access to subtask belonging to another user', async () => {
      await request(app.getHttpServer())
        .get(`/subtasks/${otherUserSubtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow updates to subtask belonging to another user', async () => {
      await request(app.getHttpServer())
        .patch(`/subtasks/${otherUserSubtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trying to update other user subtask',
        })
        .expect(404)
    })

    it('should not allow deletion of subtask belonging to another user', async () => {
      await request(app.getHttpServer())
        .delete(`/subtasks/${otherUserSubtaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow creating subtask for another user task', async () => {
      await request(app.getHttpServer())
        .post('/subtasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Subtask',
          taskId: otherUserTaskId,
        })
        .expect(404)
    })
  })
})
