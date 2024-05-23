import { NextRequest } from "next/server";
import { createClient } from "../../node-rdpjs-2";

export async function GET(request: NextRequest) {
  const host = "192.168.1.2";
  const port = 3389;
  const domain = "domain";
  const username = "username";
  const password = "password";
  const client = createClient({
    domain: domain,
    userName: username,
    password: password,
    enablePerf: true,
    autoLogin: true,
    decompress: false,
    screen: { width: 800, height: 600 },
    locale: "en",
    logLevel: "DEBUG",
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
    });
  // console.log(client);
  client.connect(host, port);
  return new Response(undefined, { status: 200 });
}
