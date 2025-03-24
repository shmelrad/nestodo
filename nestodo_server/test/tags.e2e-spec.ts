import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthService } from '../src/auth/auth.service'

describe('Tags (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authService: AuthService
  let authToken: string
  let workspaceId: number

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
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await app.close()
  })

  describe('POST /tags/workspace/:workspaceId', () => {
    it('should create a workspace tag', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: 'test-tag',
        workspaceId: workspaceId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should prevent duplicate tags in the same workspace', async () => {
      // First creation should succeed
      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag',
        })
        .expect(201)

      // Get workspace tags to verify the tag exists
      const tagsResponse = await request(app.getHttpServer())
        .get(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(tagsResponse.body).toContain('test-tag')

      // Second creation should return the existing tag
      const response = await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        name: 'test-tag',
        workspaceId: workspaceId,
      })

      // Verify we still only have one instance of the tag
      const finalTagsResponse = await request(app.getHttpServer())
        .get(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(finalTagsResponse.body.filter((tag) => tag === 'test-tag')).toHaveLength(1)
    })

    it('should fail to create tag with invalid workspace', async () => {
      await request(app.getHttpServer())
        .post('/tags/workspace/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag',
        })
        .expect(404)
    })

    it('should fail to create tag without auth', async () => {
      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .send({
          tag: 'test-tag',
        })
        .expect(401)
    })
  })

  describe('GET /tags/workspace/:workspaceId', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag-1',
        })

      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag-2',
        })
    })

    it('should get all workspace tags', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body).toEqual(expect.arrayContaining(['test-tag-1', 'test-tag-2']))
    })

    it('should fail to get tags with invalid workspace', async () => {
      await request(app.getHttpServer())
        .get('/tags/workspace/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should fail to get tags without auth', async () => {
      await request(app.getHttpServer()).get(`/tags/workspace/${workspaceId}`).expect(401)
    })
  })

  describe('GET /tags/workspace/:workspaceId/search', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'frontend',
        })

      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'backend',
        })

      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'bug',
        })
    })

    it('should search workspace tags', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tags/workspace/${workspaceId}/search?query=end`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body).toEqual(expect.arrayContaining(['frontend', 'backend']))
    })

    it('should return empty array for no matches', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tags/workspace/${workspaceId}/search?query=nonexistent`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(0)
    })

    it('should fail to search tags with invalid workspace', async () => {
      await request(app.getHttpServer())
        .get('/tags/workspace/999999/search?query=end')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('DELETE /tags/workspace/:workspaceId/:tagName', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag',
        })
    })

    it('should delete a workspace tag', async () => {
      await request(app.getHttpServer())
        .delete(`/tags/workspace/${workspaceId}/test-tag`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify it's deleted by trying to create it again
      const response = await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'test-tag',
        })
        .expect(201)

      expect(response.body.name).toBe('test-tag')
    })

    it('should fail to delete non-existent tag', async () => {
      await request(app.getHttpServer())
        .delete(`/tags/workspace/${workspaceId}/nonexistent-tag`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should fail to delete tag with invalid workspace', async () => {
      await request(app.getHttpServer())
        .delete('/tags/workspace/999999/test-tag')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('Tag Authorization', () => {
    let otherUserAuthToken: string
    let otherUserWorkspaceId: number

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

      await request(app.getHttpServer())
        .post(`/tags/workspace/${otherUserWorkspaceId}`)
        .set('Authorization', `Bearer ${otherUserAuthToken}`)
        .send({
          tag: 'other-user-tag',
        })

      await request(app.getHttpServer())
        .post(`/tags/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'current-user-tag',
        })
    })

    it('should not allow access to tags in another user workspace', async () => {
      await request(app.getHttpServer())
        .get(`/tags/workspace/${otherUserWorkspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow searching tags in another user workspace', async () => {
      await request(app.getHttpServer())
        .get(`/tags/workspace/${otherUserWorkspaceId}/search?query=other`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should not allow creating tag in another user workspace', async () => {
      await request(app.getHttpServer())
        .post(`/tags/workspace/${otherUserWorkspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tag: 'intruder-tag',
        })
        .expect(404)
    })

    it('should not allow deleting tag in another user workspace', async () => {
      await request(app.getHttpServer())
        .delete(`/tags/workspace/${otherUserWorkspaceId}/other-user-tag`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})
