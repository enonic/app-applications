/** What the file picker offers, and the one extension core will take a jar under. */
export const JAR_ACCEPT = '.jar';

export type JarPartition = {
  accepted: File[];
  /** The names of what was not a jar, for the message. */
  rejected: string[];
};

/**
 * Splits what the operator picked into jars and everything else.
 *
 * ! The extension is checked for the message, not for safety: nothing here tells a jar from a
 * ! renamed archive, and it must not read as though it did. Validating the artifact is core's job.
 */
export function partitionJarFiles(files: readonly File[]): JarPartition {
  const accepted: File[] = [];
  const rejected: string[] = [];

  files.forEach((file) => {
    if (file.name.toLowerCase().endsWith(JAR_ACCEPT)) {
      accepted.push(file);
      return;
    }

    rejected.push(file.name);
  });

  return { accepted, rejected };
}
