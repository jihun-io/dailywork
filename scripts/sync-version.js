#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// package.json 읽기
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

console.log(`동기화할 버전: ${version}`);

// package-lock.json 업데이트
const packageLockPath = path.join(__dirname, "..", "package-lock.json");
let packageLock = fs.readFileSync(packageLockPath, "utf8");

// version 라인을 찾아서 교체
packageLock = packageLock.replace(
  /^  "version": ".*",$/m,
  `  "version": "${version}",`,
);

fs.writeFileSync(packageLockPath, packageLock);
console.log(`package-lock.json 버전을 ${version}으로 업데이트했습니다.`);

// Cargo.toml 업데이트
const cargoTomlPath = path.join(__dirname, "..", "src-tauri", "Cargo.toml");
let cargoToml = fs.readFileSync(cargoTomlPath, "utf8");

// version 라인을 찾아서 교체
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${version}"`);

fs.writeFileSync(cargoTomlPath, cargoToml);
console.log(`Cargo.toml 버전을 ${version}으로 업데이트했습니다.`);

// tauri.conf.json 업데이트
const tauriConfPath = path.join(
  __dirname,
  "..",
  "src-tauri",
  "tauri.conf.json",
);
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));

tauriConf.version = version;

fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log(`tauri.conf.json 버전을 ${version}으로 업데이트했습니다.`);

console.log("버전 동기화가 완료되었습니다!");
