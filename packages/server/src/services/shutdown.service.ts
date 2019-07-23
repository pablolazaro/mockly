import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MocklyShutdownService implements OnApplicationShutdown {
  private _shutdownSubject: Subject<string>;
  shutdown$: Observable<string>;

  constructor() {
    this._shutdownSubject = new Subject();
    this.shutdown$ = this._shutdownSubject.asObservable();
  }
  onApplicationShutdown(signal?: string): any {
    this._shutdownSubject.next(signal);
    this._shutdownSubject.complete();
  }
}
