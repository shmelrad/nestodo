import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthService } from '../src/auth/auth.service'

describe('Tasks (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authService: AuthService
  let authToken: string
  let workspaceId: number
  let boardId: number
  let taskListId: number

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
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await app.close()
  })

  describe('POST /tasks', () => {
    it('should create a task', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          taskListId: taskListId,
          priority: 'MEDIUM',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: 'Test Task',
        description: 'Test Description',
        taskListId: taskListId,
        priority: 'MEDIUM',
        completed: false,
        position: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should fail to create task with invalid task list', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          taskListId: 999999,
        })
        .expect(404)
    })

    it('should fail to create task without auth', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          taskListId: taskListId,
        })
        .expect(401)
    })

    it('should validate required fields', async () => {
      await request(app.getHttpServer()).post('/tasks').set('Authorization', `Bearer ${authToken}`).send({}).expect(400)
    })
  })

  describe('PATCH /tasks/:id', () => {
    let taskId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          taskListId: taskListId,
        })
      taskId = response.body.id
    })

    it('should update task title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: taskId,
        title: 'Updated Task Title',
      })
    })

    it('should update task completed status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completed: true,
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: taskId,
        completed: true,
      })
    })

    it('should update task priority', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'HIGH',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: taskId,
        priority: 'HIGH',
      })
    })

    it('should fail to update non-existent task', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
        })
        .expect(404)
    })
  })

  describe('PATCH /tasks/:id/move', () => {
    let taskId: number
    let anotherTaskListId: number

    beforeEach(async () => {
      const taskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          taskListId: taskListId,
        })
      taskId = taskResponse.body.id

      const anotherTaskListResponse = await request(app.getHttpServer())
        .post('/task-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Another Task List',
          boardId: boardId,
        })
      anotherTaskListId = anotherTaskListResponse.body.id
    })

    it('should move task to another task list', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceTaskListId: taskListId,
          destinationTaskListId: anotherTaskListId,
          newPosition: 0,
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: taskId,
        taskListId: anotherTaskListId,
        position: 0,
      })
    })

    it('should fail to move to invalid task list', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceTaskListId: taskListId,
          destinationTaskListId: 999999,
          newPosition: 0,
        })
        .expect(404)
    })
  })

  describe('DELETE /tasks/:id', () => {
    let taskId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          taskListId: taskListId,
        })
      taskId = response.body.id
    })

    it('should delete task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
        })
        .expect(404)
    })

    it('should fail to delete non-existent task', async () => {
      await request(app.getHttpServer()).delete('/tasks/999999').set('Authorization', `Bearer ${authToken}`).expect(404)
    })
  })

  describe('Task Authorization', () => {
    let otherUserAuthToken: string
    let otherUserWorkspaceId: number
    let otherUserBoardId: number
    let otherUserTaskListId: number
    let otherUserTaskId: number

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
    })

    it('should not allow updates to task belonging to another user', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trying to update other user task',
        })
        .expect(404)
    })

    it('should not allow moving task belonging to another user', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${otherUserTaskId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceTaskListId: taskListId,
          destinationTaskListId: otherUserTaskListId,
          newPosition: 0,
        })
        .expect(404)
    })

    it('should not allow deletion of task belonging to another user', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow creating task in another user task list', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          taskListId: otherUserTaskListId,
        })
        .expect(404)
    })
  })
})
