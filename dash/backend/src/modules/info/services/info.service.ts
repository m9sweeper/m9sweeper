import { Injectable } from '@nestjs/common';
import { readFile } from "fs";
import { promisify } from "util";

@Injectable()
export class InfoService {
  async getGitInfo(): Promise<any> {
    const rawData: string = await promisify(readFile)('info.json', { encoding: "utf-8" });
    return JSON.parse(rawData);
  }
}
