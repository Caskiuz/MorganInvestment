// Mock del modelo Reservation para evitar dependencia de MongoDB en tests
const mockFind = jest.fn();
const mockCreate = jest.fn();

// expose mocks via global so los tests pueden configurarlos
global.mockFind = mockFind;
global.mockCreate = mockCreate;

jest.mock('../models/Reservation.js', () => {
  const MockReservation = function (data) {
    this.data = data;
    this.save = jest.fn().mockResolvedValue(Object.assign({ _id: 'mockid' }, data));
  };
  MockReservation.find = (...args) => mockFind(...args);
  MockReservation.create = (...args) => mockCreate(...args);
  return MockReservation;
});

import request from 'supertest';
import app from '../index.js';

beforeEach(() => {
  mockFind.mockReset();
  mockCreate.mockReset();
});

test('POST /api/reservas/check devuelve available=true cuando no hay conflictos', async () => {
  mockFind.mockResolvedValue([]);
  const res = await request(app)
    .post('/api/reservas/check')
    .send({ alojamientoId: 'test1', checkIn: '2025-09-01', checkOut: '2025-09-05' });
  expect(res.statusCode).toBe(200);
  expect(res.body.available).toBe(true);
});

test('POST /api/reservas/check detecta conflicto', async () => {
  mockFind.mockResolvedValue([{ _id: 'r1', alojamientoId: 'c1' }]);
  const res = await request(app)
    .post('/api/reservas/check')
    .send({ alojamientoId: 'c1', checkIn: '2025-09-12', checkOut: '2025-09-14' });
  expect(res.statusCode).toBe(200);
  expect(res.body.available).toBe(false);
  expect(res.body.conflicts.length).toBeGreaterThan(0);
});

test('Flujo: crear reserva via POST /api/reservas', async () => {
  mockFind.mockResolvedValue([]);
  global.mockCreate.mockResolvedValue({ _id: 'created', name: 'B' });
  const payload = { name: 'B', email: 'b@b.com', phone: '2', alojamientoId: 'c2', checkIn: '2025-10-01', checkOut: '2025-10-04', totalAmount: 300 };
  const res = await request(app).post('/api/reservas').send(payload);
  expect(res.statusCode).toBe(200);
  expect(res.body.ok).toBe(true);
});
