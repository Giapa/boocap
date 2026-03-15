import { spawn, spawnSync } from "child_process";
import path from "path";

interface ParsedChapter {
  position: number;
  title: string;
  text: string;
}

interface ParserResponse {
  chapters?: ParsedChapter[];
  error?: string;
}

const sidecarPath = path.join(__dirname, "../../sidecar/parser.py");

export function isUvAvailable(): boolean {
  const result = spawnSync("uv", ["--version"]);
  return result.status === 0;
}

export function parseEpub(filePath: string): Promise<ParsedChapter[]> {
  return new Promise((resolve, reject) => {
    const child = spawn("uv", ["run", sidecarPath]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to start parser: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Parser exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const response: ParserResponse = JSON.parse(stdout);

        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        resolve(response.chapters ?? []);
      } catch {
        reject(new Error(`Failed to parse response: ${stdout}`));
      }
    });

    const command = JSON.stringify({ command: "parse", path: filePath });
    child.stdin.write(command + "\n");
    child.stdin.end();
  });
}
