import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { ValidationPipe } from '@nestjs/common';

describe('Workspaces (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();

    const { access_token } = await authService.register({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
    authToken = access_token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should create and fetch workspaces', async () => {
    const createResponse1 = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Workspace 1' })
      .expect(201);

    expect(createResponse1.body).toMatchObject({
      title: 'Workspace 1',
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const createResponse2 = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Workspace 2' })
      .expect(201);

    const getResponse = await request(app.getHttpServer())
      .get('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body).toHaveLength(2);
    expect(getResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse1.body.id,
          title: 'Workspace 1',
        }),
        expect.objectContaining({
          id: createResponse2.body.id,
          title: 'Workspace 2',
        }),
      ])
    );
  });

  it('should not fetch workspaces without auth token', async () => {
    await request(app.getHttpServer())
      .get('/workspaces')
      .expect(401);
  });

  it('should not create workspace without auth token', async () => {
    await request(app.getHttpServer())
      .post('/workspaces')
      .send({ title: 'Workspace 1' })
      .expect(401);
  });
});