import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';

describe('Boards (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let authToken: string;
  let workspaceId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await prisma.board.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();

    const uniqueId = Date.now();
    const registration = await authService.register({
      email: `test${uniqueId}@example.com`,
      username: `testuser${uniqueId}`,
      password: 'password123',
    });
    authToken = registration.access_token;

    const workspaceResponse = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Workspace' });
    
    workspaceId = workspaceResponse.body.id;
  });

  afterAll(async () => {
    await prisma.board.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /boards', () => {
    it('should create a board', async () => {
      const response = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          workspaceId: workspaceId,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: 'Test Board',
        workspaceId: workspaceId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should fail to create board with invalid workspace', async () => {
      await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          workspaceId: 999999,
        })
        .expect(404);
    });

    it('should fail to create board without auth', async () => {
      await request(app.getHttpServer())
        .post('/boards')
        .send({
          title: 'Test Board',
          workspaceId: workspaceId,
        })
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /boards', () => {
    let boardId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          workspaceId: workspaceId,
        });
      boardId = response.body.id;
    });

    it('should get specific board by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: boardId,
        title: 'Test Board',
        workspaceId: workspaceId,
        taskLists: expect.any(Array),
      });
    });

    it('should fail to get non-existent board', async () => {
      await request(app.getHttpServer())
        .get('/boards/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /boards/:id', () => {
    let boardId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          workspaceId: workspaceId,
        });
      boardId = response.body.id;
    });

    it('should update board title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Board Title',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: boardId,
        title: 'Updated Board Title',
      });
    });

    it('should fail to update non-existent board', async () => {
      await request(app.getHttpServer())
        .patch('/boards/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Board Title',
        })
        .expect(404);
    });
  });

  describe('DELETE /boards/:id', () => {
    let boardId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          workspaceId: workspaceId,
        });
      boardId = response.body.id;
    });

    it('should delete board', async () => {
      await request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent board', async () => {
      await request(app.getHttpServer())
        .delete('/boards/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Board Authorization', () => {
    let otherUserAuthToken: string;
    let otherUserWorkspaceId: number;
    let otherUserBoardId: number;

    beforeEach(async () => {
      const registration = await authService.register({
        email: 'other@example.com',
        username: 'otheruser',
        password: 'password123',
      });
      otherUserAuthToken = registration.access_token;

      const workspaceResponse = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({ title: 'Other User Workspace' });
      
      otherUserWorkspaceId = workspaceResponse.body.id;

      const boardResponse = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({
          title: 'Other User Board',
          workspaceId: otherUserWorkspaceId,
        });
      
      otherUserBoardId = boardResponse.body.id;
    });

    it('should not allow access to board belonging to another user', async () => {
      await request(app.getHttpServer())
        .get(`/boards/${otherUserBoardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow updates to board belonging to another user', async () => {
      await request(app.getHttpServer())
        .patch(`/boards/${otherUserBoardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trying to update other user board',
        })
        .expect(404);
    });

    it('should not allow deletion of board belonging to another user', async () => {
      await request(app.getHttpServer())
        .delete(`/boards/${otherUserBoardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow creating board in another user workspace', async () => {
      await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          workspaceId: otherUserWorkspaceId,
        })
        .expect(404);
    });
  });
}); 