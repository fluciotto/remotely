import { NextRequest } from "next/server";
import { Session } from "freerdp3";
import { PassThrough } from "stream";

// const makeStream = <T extends Record<string, unknown>>(
//   generator: AsyncGenerator<T, void, unknown>
// ) => {
//   const encoder = new TextEncoder();
//   return new ReadableStream<any>({
//     async start(controller) {
//       for await (let chunk of generator) {
//         const chunkData = encoder.encode(JSON.stringify(chunk));
//         controller.enqueue(chunkData);
//       }
//       controller.close();
//     },
//   });
// };

class StreamingResponse extends Response {
  constructor(
    // res: ReadableStream<any>,
    // res: WritableStream<any>,
    res: PassThrough,
    init?: ResponseInit
  ) {
    super(res as any, {
      ...init,
      status: 200,
      headers: {
        ...init?.headers,
      },
    });
  }
}

// type Item = {
//   key: string;
//   value: string;
// };

// async function* fetchItems(): AsyncGenerator<Item, void, unknown> {
//   const sleep = async (ms: number) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   for (let i = 0; i < 10; ++i) {
//     await sleep(1000);
//     yield {
//       key: `key${i}`,
//       value: `value${i}`,
//     };
//   }
// }

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const [
    hostParam,
    portParam,
    usernameParam,
    passwordParam,
    domainParam,
    widthParams,
    heightParam,
    bitsPerPixelParam,
  ] = [
    searchParams.get("host"),
    searchParams.get("port"),
    searchParams.get("username"),
    searchParams.get("password"),
    searchParams.get("domain"),
    searchParams.get("width"),
    searchParams.get("height"),
    searchParams.get("bitsPerPixel"),
  ];

  const [host, port, username, password, domain, width, height, bitsPerPixel] = [
    hostParam,
    parseInt(portParam || "3389"),
    usernameParam,
    passwordParam,
    domainParam,
    parseInt(widthParams || "256"),
    parseInt(heightParam || "256"),
    parseInt(bitsPerPixelParam || "8"),
  ];

  console.log(
    "host, port, username, password, domain, width, height, bitsPerPixel",
    host,
    port,
    username,
    password,
    domain,
    width,
    height,
    bitsPerPixel
  );

  if (!host) {
    return new Response(undefined, { status: 400 });
  }
  if (!username) {
    return new Response(undefined, { status: 400 });
  }
  if (!password) {
    return new Response(undefined, { status: 400 });
  }

  const stream = new PassThrough();

  const client = new Session({
    host,
    port,
    username,
    password,
    domain: domain || undefined,
    // certIgnore: true,
    width,
    height,
    bitsPerPixel,
    // bitsPerPixel: 8,

    // enablePerf: true,
    // autoLogin: true,
    // decompress: false,
    // screen: { width: 800, height: 600 },
    // locale: "en",
    // logLevel: "DEBUG",
  })
    .on("connect", function () {
      console.log("CONNECTED");
    })
    .on("close", function (reason: any) {
      console.log("CLOSED", reason);
      stream.end();
    })
    .on("bitmap", function (bitmap: any) {
      console.log("BITMAP", {...bitmap, buffer: bitmap.buffer.length});
      stream.write(Buffer.from(JSON.stringify(bitmap)));
    })
    .on("error", function (err: any) {
      console.log("error", err);
    });
  client.connect();

  // return new Response(undefined, { status: 200 });

  // const stream = makeStream(fetchItems());
  const response = new StreamingResponse(stream);
  return response;
}
