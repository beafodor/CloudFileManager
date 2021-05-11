import * as functions from "firebase-functions";
import {Storage} from "@google-cloud/storage";
const projectId = "cloudfilemanagerapp";
const gcs = new Storage({
  projectId,
});
import os = require("os");
import path = require("path");
import fs = require("fs");

exports.getFileFromChunks = functions.storage
    .object()
    .onFinalize((event) => {
      const filename:string = event.name!;
      const filePath:string = event.name!;
      const bucket = event.bucket;
      const finalName = path.basename(filename)
          .substring(path.basename(filename).lastIndexOf("$")+1,
              path.basename(filename).length);

      console.log(finalName);

      if (!path.basename(filePath).startsWith("$")) {
        return;
      }

      const destbucket = gcs.bucket(bucket);
      const tmpFilePath = path.join(os.tmpdir(), path.basename(filename));

      return destbucket.file(filePath).download({
        destination: tmpFilePath,
      }).then(() => {
        const fpath = os.tmpdir() + "/";
        const fullFile: any[] = [];
        const files = fs.readdirSync(fpath);
        files.forEach((file) => {
          const filePath = fpath + file;
          const fileSize = fs.statSync(filePath).size;

          const fileDescriptor = fs.openSync(filePath, "r");

          const buffer = Buffer.alloc(fileSize);

          fs.readSync(fileDescriptor, buffer, 0, fileSize, 0);

          const bytes = [...buffer];
          bytes.forEach((byte) => {
            fullFile.push(byte);
          });

          fs.closeSync(fileDescriptor);
        });

        const buf = Buffer.from(fullFile);
        fs.appendFile(fpath + finalName, buf, (err) => {
          if (!err) {
            console.log("Works fine");
          }
        });

        destbucket.upload(fpath + finalName, {
          destination: path.dirname(filePath) + "/" + finalName,
        });
      });
    });
