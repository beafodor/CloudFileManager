import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChunkService {

  chunks: any[];
  chunkSizes: number[];
  binary: ArrayBuffer;

  constructor() { }

  calculateSize(file): Promise<any> {
    let chunkSize = 1024 * 1024;
    return new Promise(async (resolve, reject) => {
      this.binary = await file.file.arrayBuffer();
      let fileSize: number = file.file.size;
      this.chunks = [];
      this.chunkSizes = [];

      // calculate chunk sizes
      let remainingFileSize = fileSize;
      while(remainingFileSize > 0) {
        if (remainingFileSize - chunkSize >= 0) {
          this.chunkSizes.push(chunkSize);
          remainingFileSize -= chunkSize;
        } else {
          this.chunkSizes.push(remainingFileSize);
          remainingFileSize = 0;
        }
      }
      console.log(this.chunkSizes)

      let start = 0;
        let end = 0;
        for (let i = 0; i < this.chunkSizes.length; i++) {
          let currentSize = this.chunkSizes[i];
          end += currentSize;
          let currentFileChunk = this.binary.slice(start, end);
          this.chunks.push(currentFileChunk);
          start += currentSize;
        }
      resolve(this.chunks);
    });
  }


}
