#!/usr/bin/env node
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Cargar .env del backend
const envPath = path.resolve(new URL(import.meta.url).pathname, '../../.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

import User from '../models/User.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i+1];
      out[key] = val; i++;
    }
  }
  return out;
}

async function main() {
  const { name, email, password } = parseArgs();
  if (!name || !email || !password) {
    console.error('Usage: node createAdmin.js --name "Name" --email admin@example.com --password secret');
    process.exit(1);
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reservas';
  console.log('Conectando a la base de datos...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    let user = await User.findOne({ email });
    const hash = await bcrypt.hash(password, 10);
    if (user) {
      user.name = name;
      user.passwordHash = hash;
      user.role = 'admin';
      await user.save();
      console.log('Usuario actualizado a admin:', user._id.toString(), user.email);
    } else {
      user = new User({ name, email, passwordHash: hash, role: 'admin' });
      await user.save();
      console.log('Usuario admin creado:', user._id.toString(), user.email);
    }
  } catch (err) {
    console.error('Error creando usuario admin:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
