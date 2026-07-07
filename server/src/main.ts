import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'net';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';

// 期望端口：命令行 -p > SERVER_PORT > PORT > 默认 3001
// （默认避开常被占用的 3000）
function preferredPort(): number {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  const envPort = parseInt(process.env.SERVER_PORT || process.env.PORT || '', 10);
  if (!isNaN(envPort) && envPort > 0 && envPort < 65536) {
    return envPort;
  }
  return 3100;
}

// 探测某端口是否空闲
function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => tester.close(() => resolve(true)));
    tester.listen(port, '0.0.0.0');
  });
}

// 从期望端口起，自动顺延找到第一个空闲端口
async function findFreePort(preferred: number, maxTries = 20): Promise<number> {
  for (let p = preferred; p < preferred + maxTries && p < 65536; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error(`从 ${preferred} 起连续 ${maxTries} 个端口都被占用`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  // 开启优雅关闭 Hooks
  app.enableShutdownHooks();

  // 解析期望端口并自动避让被占用端口
  const preferred = preferredPort();
  const port = await findFreePort(preferred);

  await app.listen(port);

  if (port !== preferred) {
    console.warn(
      `⚠️ 端口 ${preferred} 被占用，已自动切换到 ${port}。\n` +
      `   若用 H5 联调，请让前端代理指向同一端口：启动时设 SERVER_PORT=${port}（前端代理已读取该变量）。`,
    );
  }
  console.log(`✅ Server running on http://localhost:${port}`);
}
bootstrap();
