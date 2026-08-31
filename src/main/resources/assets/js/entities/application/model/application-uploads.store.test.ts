import { beforeEach, describe, expect, it } from 'vitest';

import {
  $applicationUploads,
  endUpload,
  queueUploads,
  receiveUploadProgress,
} from './application-uploads.store';

beforeEach(() => {
  $applicationUploads.set({});
});

describe('queueUploads', () => {
  it('registers the upload under a fresh id, with nothing sent yet', () => {
    const [id] = queueUploads(['booster.jar']);

    expect($applicationUploads.get()[id]).toEqual({ fileName: 'booster.jar' });
  });

  // The whole point of queueing them together: the operator sees what is waiting, not only what is
  // going out.
  it('registers a whole pick at once, in the order it will go out', () => {
    const ids = queueUploads(['booster.jar', 'fathom.jar', 'juke.jar']);

    expect(Object.keys($applicationUploads.get())).toEqual(ids);
    expect(Object.values($applicationUploads.get())).toEqual([
      { fileName: 'booster.jar' },
      { fileName: 'fathom.jar' },
      { fileName: 'juke.jar' },
    ]);
  });

  it('keeps two uploads of the same file apart', () => {
    const [first] = queueUploads(['booster.jar']);
    const [second] = queueUploads(['booster.jar']);

    expect(first).not.toBe(second);
    expect(Object.keys($applicationUploads.get())).toHaveLength(2);
  });

  it('leaves a pick already in flight where it is', () => {
    const [first] = queueUploads(['booster.jar']);

    queueUploads(['fathom.jar']);

    expect(Object.keys($applicationUploads.get())[0]).toBe(first);
  });
});

describe('receiveUploadProgress', () => {
  it('records progress against the upload without losing its name', () => {
    const [id] = queueUploads(['booster.jar']);

    receiveUploadProgress(id, 40);

    expect($applicationUploads.get()[id]).toEqual({ fileName: 'booster.jar', percent: 40 });
  });

  // The last progress event can land after the request has settled and the row is gone.
  it('ignores an upload that has already ended', () => {
    const [id] = queueUploads(['booster.jar']);
    endUpload(id);

    receiveUploadProgress(id, 40);

    expect($applicationUploads.get()).toEqual({});
  });
});

describe('endUpload', () => {
  it('drops the one upload and leaves the rest queued', () => {
    const [first, second] = queueUploads(['booster.jar', 'fathom.jar']);

    endUpload(first);

    expect($applicationUploads.get()).toEqual({ [second]: { fileName: 'fathom.jar' } });
  });
});
