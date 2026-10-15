import { describe, expect, it } from 'vitest';

import { partitionJarFiles } from './jar-files';

function file(name: string): File {
  return new File(['bytes'], name);
}

describe('partitionJarFiles', () => {
  it('takes the jars and names the rest', () => {
    const jar = file('booster-3.0.1.jar');

    const { accepted, rejected } = partitionJarFiles([jar, file('notes.txt')]);

    expect(accepted).toEqual([jar]);
    expect(rejected).toEqual(['notes.txt']);
  });

  it('takes a jar however its extension is cased', () => {
    const { accepted } = partitionJarFiles([file('Booster.JAR')]);

    expect(accepted).toHaveLength(1);
  });

  // app-applications took zips too; this section does not.
  it('rejects an application archive that is not a jar', () => {
    const { accepted, rejected } = partitionJarFiles([file('booster.zip')]);

    expect(accepted).toEqual([]);
    expect(rejected).toEqual(['booster.zip']);
  });

  it('rejects a name that only mentions jar', () => {
    const { rejected } = partitionJarFiles([file('jar-notes.md'), file('booster.jar.bak')]);

    expect(rejected).toEqual(['jar-notes.md', 'booster.jar.bak']);
  });

  it('answers empty for an empty pick', () => {
    expect(partitionJarFiles([])).toEqual({ accepted: [], rejected: [] });
  });
});
