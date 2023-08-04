import { Injectable } from '@angular/core';
import { EMSP } from './emsp';

@Injectable({
  providedIn: 'root'
})
export class EmspService {
  constructor() { }

  
  emsps: EMSP[] = [];
}
