const request = require('supertest');
const app = require('../index.js');

describe('Health endpoint', () => {
  it('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('SPA fallback', () => {
  it('GET /non-existent-page returns index.html (SPA)', async () => {
    const res = await request(app).get('/non-existent-page');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<title>Ternurita Bebé</title>');
  });
});

describe('Auth endpoints', () => {
  it('POST /api/auth/forgot-password without email should return 400', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Search endpoint', () => {
  it('GET /api/search/productos without query should return 400', async () => {
    const res = await request(app).get('/api/search/productos');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/search/productos?query=abc should return products matching', async () => {
    const res = await request(app).get('/api/search/productos?q=camiseta');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('nombre');
    }
  });
});

describe('Admin endpoints (no auth)', () => {
  it('GET /api/admin without token should return 401', async () => {
    const res = await request(app).get('/api/admin');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/categorias without auth should return 401', async () => {
    const res = await request(app).get('/api/admin/categorias');
    expect(res.status).toBe(401);
  });
});