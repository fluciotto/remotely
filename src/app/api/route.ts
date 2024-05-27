import { NextRequest } from "next/server";
import { Session } from "freerdp3"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const [host, port, username, password, domain] = [
    searchParams.get("host"),
    searchParams.get("port"),
    searchParams.get("username"),
    searchParams.get("password"),
    searchParams.get("domain"),
  ]

  const client = new Session({
    host,
    port,
    domain: domain,
    userName: username,
    password: password,
    // certIgnore: true,

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
    .on("close", function () {
      console.log("CLOSED");
    })
    .on("bitmap", function (bitmap: any) {
      console.log("BITMAP");
    })
    .on("error", function (err: any) {
      console.log("error", err);
    })
    .on("ERROR", function (err: any) {
    console.log("ERRRROOOOOOOR")
  } );
  // console.log(client);
  client.connect();
  return new Response(undefined, { status: 200 });
}
