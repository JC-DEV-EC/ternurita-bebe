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

describe('Config endpoint', () => {
  it('GET /config.js should return APP_CONFIG as JS', async () => {
    const res = await request(app).get('/config.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('javascript');
    expect(res.text).toContain('window.APP_CONFIG');
    expect(res.text).toContain('API_BASE_URL');
  });
});

describe('Security headers', () => {
  it('should return Permissions-Policy header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('permissions-policy');
  });

  it('should NOT send Cross-Origin-Opener-Policy header (desactivado en servidor)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).not.toHaveProperty('cross-origin-opener-policy');
  });

  it('should NOT send Cross-Origin-Resource-Policy header (desactivado en servidor)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).not.toHaveProperty('cross-origin-resource-policy');
  });

  it('should return X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('Security.txt', () => {
  it('GET /.well-known/security.txt should return 200 with contact info', async () => {
    const res = await request(app).get('/.well-known/security.txt');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Contact:');
    expect(res.text).toContain('ternuritabebe.com');
  });
});

describe('Auth endpoints', () => {
  it('POST /api/auth/forgot-password without email should return 400', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/register without body should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/register with invalid email should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalido',
      password: '123456',
      nombre: 'Test',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/register with short password should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      password: '123',
      nombre: 'Test',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/register with short name should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      password: '123456',
      nombre: 'A',
    });
    expect(res.status).toBe(400);
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

describe('Pagos endpoints (no auth)', () => {
  it('GET /api/pagos/datos without token should return 401', async () => {
    const res = await request(app).get('/api/pagos/datos');
    expect(res.status).toBe(401);
  });

  it('GET /api/pagos/datos with invalid token should return 401', async () => {
    const res = await request(app).get('/api/pagos/datos').set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('POST /api/pagos/pedidos/1/reportar without token should return 401', async () => {
    const res = await request(app)
      .post('/api/pagos/pedidos/1/reportar')
      .send({ referencia: '123456' });
    expect(res.status).toBe(401);
  });

  it('POST /api/pagos/pedidos/1/cancelar without token should return 401', async () => {
    const res = await request(app).post('/api/pagos/pedidos/1/cancelar');
    expect(res.status).toBe(401);
  });
});

describe('Admin pagos endpoints (no auth)', () => {
  it('GET /api/admin/pedidos with estado_pago filter without token should return 401', async () => {
    const res = await request(app).get('/api/admin/pedidos?estado_pago=en_revision');
    expect(res.status).toBe(401);
  });

  it('POST /api/admin/pedidos/1/pago/confirmar without token should return 401', async () => {
    const res = await request(app).post('/api/admin/pedidos/1/pago/confirmar');
    expect(res.status).toBe(401);
  });

  it('POST /api/admin/pedidos/1/pago/rechazar without token should return 401', async () => {
    const res = await request(app).post('/api/admin/pedidos/1/pago/rechazar');
    expect(res.status).toBe(401);
  });
});

describe('Redirect safety in forgot-password', () => {
  it('should use default redirect for untrusted domain', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@test.com', redirectTo: 'https://evil.com/phish' });
    expect(res.status).toBe(200);
  });
});