export function output(data: unknown, format: string): void {
  if (format === "compact") {
    process.stdout.write(JSON.stringify(data) + "\n");
  } else {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  }
}

export function fatal(message: string): never {
  process.stderr.write(JSON.stringify({ error: message }) + "\n");
  process.exit(1);
}
