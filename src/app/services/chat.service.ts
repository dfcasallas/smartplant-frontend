import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/chat';

  preguntar(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.baseUrl, request);
  }
}
