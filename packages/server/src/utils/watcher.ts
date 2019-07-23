import { MocklyConfig } from '../models';
import chokidar, { FSWatcher } from 'chokidar';
import { Observable, Subject } from 'rxjs';
import { MocklyShutdownService } from '../services/shutdown.service';
import { take } from 'rxjs/operators';
import { INestApplication, Logger } from '@nestjs/common';
import { cwd } from 'process';
import { join } from 'path';

export class MocklyWatcher {
  private _logger = new Logger('MocklyWatcher');

  private _changeSubject: Subject<string>;
  changes$: Observable<string>;

  constructor(private readonly config: MocklyConfig) {
    this._changeSubject = new Subject();
    this.changes$ = this._changeSubject.asObservable();
  }

  start(app: INestApplication, workingDir = cwd()) {
    const resourcesWatcher = chokidar.watch(
      join(workingDir, this.config.resourceFilesGlob),
      { ignored: '**/node_modules' }
    );
    const rewritesWatcher = chokidar.watch(
      join(workingDir, this.config.rewritesFilesGlob),
      { ignored: '**/node_modules' }
    );
    const responsesWatcher = chokidar.watch(
      join(workingDir, this.config.responsesConfigGlob),
      { ignored: '**/node_modules' }
    );

    this._handleWatcher(resourcesWatcher);
    this._handleWatcher(rewritesWatcher);
    this._handleWatcher(responsesWatcher);

    const service = app.get(MocklyShutdownService);

    service.shutdown$.pipe(take(1)).subscribe(() => {
      resourcesWatcher.close();
      rewritesWatcher.close();
      responsesWatcher.close();
      this._changeSubject.complete();
    });
  }

  private _handleWatcher(watcher: FSWatcher) {
    watcher.on('ready', () => {
      watcher.on('all', (event, path) => {
        this._changeSubject.next(path);
      });
    });
  }
}
