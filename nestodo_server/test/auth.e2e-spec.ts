import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('Auth (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    prisma = moduleFixture.get<PrismaService>(PrismaService)

    await app.init()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await app.close()
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
      })
    })

    it('should fail to register with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'firstuser',
          password: 'password123',
        })
        .expect(201)

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'seconduser',
          password: 'password123',
        })
        .expect(400)
    })

    it('should fail to register with duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'first@example.com',
          username: 'duplicateuser',
          password: 'password123',
        })
        .expect(201)

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'second@example.com',
          username: 'duplicateuser',
          password: 'password123',
        })
        .expect(400)
    })

    it('should validate required fields', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({}).expect(400)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
    })

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
      })
    })

    it('should fail to login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(400)
    })

    it('should fail to login with non-existent username', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        })
        .expect(400)
    })

    it('should validate required fields', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({}).expect(401)
    })
  })

  describe('GET /auth/profile', () => {
    let authToken: string

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })

      authToken = registerResponse.body.access_token
    })

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        sub: expect.any(String),
        username: 'testuser',
        email: 'test@example.com',
      })
    })

    it('should fail to get profile without auth token', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401)
    })

    it('should fail to get profile with invalid token', async () => {
      await request(app.getHttpServer()).get('/auth/profile').set('Authorization', 'Bearer invalidtoken').expect(401)
    })
  })
})
