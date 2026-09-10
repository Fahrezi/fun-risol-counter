import { Injectable } from '@nestjs/common';
import { readDb } from '../data/store.js';

@Injectable()
export class AuthService {
  verify(value: string): boolean {
    return readDb().settings.secretWord === value;
  }
}
