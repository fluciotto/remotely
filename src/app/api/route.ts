import { NextRequest } from "next/server";
import { Session } from "freerdp3";
import { PassThrough } from "stream";

let session: Session | undefined = undefined;

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
  const [host, port, username, password, domain, width, height, bitsPerPixel] =
    [
      searchParams.get("host"),
      parseInt(searchParams.get("port") || "") || 3389,
      searchParams.get("username"),
      searchParams.get("password"),
      searchParams.get("domain"),
      parseInt(searchParams.get("width") || "") || 640,
      parseInt(searchParams.get("height") || "") || 480,
      parseInt(searchParams.get("bitsPerPixel") || "") || 8,
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

  session = new Session({
    host,
    port,
    username,
    password,
    domain: domain || undefined,
    certIgnore: true,
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
    .on(
      "bitmap",
      function (bitmap: {
        x: number;
        y: number;
        w: number;
        h: number;
        bitsPerPixel: number;
        buffer: Buffer;
      }) {
        if (bitmap.x || bitmap.y || bitmap.w !== width || bitmap.h !== height) {
          return;
        }
        console.log("BITMAP", {
          ...bitmap,
          buffer: {
            byteLength: bitmap.buffer.byteLength,
            length: bitmap.buffer.length,
          },
        });
        // stream.write(Buffer.from(JSON.stringify(bitmap)));
        const array16 = Uint16Array.from([
          bitmap.x,
          bitmap.y,
          bitmap.w,
          bitmap.h,
        ]);
        const array = Uint8Array.from([
          ...Array.from(
            new Uint8Array(
              array16.buffer,
              array16.byteOffset,
              array16.byteLength
            )
          ),
          bitmap.bitsPerPixel,
          ...Array.from(bitmap.buffer),
        ]);
        // console.log("array", array);
        stream.write(array);
      }
    )
    .on("error", function (err: any) {
      console.log("error", err);
    });
  session.connect();

  // return new Response(undefined, { status: 200 });

  // const stream = makeStream(fetchItems());
  const response = new StreamingResponse(stream);
  return response;
}

// export async function POST(req: NextRequest) {
//   if (session) {
//     const searchParams = req.nextUrl.searchParams;
//     const [xParam, yParam] = [searchParams.get("x"), searchParams.get("y")];
//     const [x, y] = [parseInt(xParam || "0"), parseInt(xParam || "0")];
//     console.log(x, y);
//     session.sendPointerEvent(x, y, {});
//   }
//   return new Response(undefined);
// }
