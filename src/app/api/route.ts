import { NextRequest } from "next/server";
import { Session } from "freerdp3";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const [hostParam, portParam, usernameParam, passwordParam, domainParam] = [
    searchParams.get("host"),
    searchParams.get("port"),
    searchParams.get("username"),
    searchParams.get("password"),
    searchParams.get("domain"),
  ];

  const [host, port, username, password, domain] = [
    hostParam,
    parseInt(portParam || "3389"),
    usernameParam,
    passwordParam,
    domainParam,
  ];

  console.log(
    "host, port, username, password, domain",
    host,
    port,
    username,
    password,
    domain
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

  const client = new Session({
    host,
    port,
    username,
    password,
    domain: domain || undefined,
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
      // client.
    })
    .on("close", function () {
      console.log("CLOSED");
    })
    .on("bitmap", function (bitmap: any) {
      console.log("BITMAP", bitmap);
    })
    .on("error", function (err: any) {
      console.log("error", err);
    })
    .on("ERROR", function (err: any) {
      console.log("ERRRROOOOOOOR");
    });
  // console.log(client);
  client.connect();
  return new Response(undefined, { status: 200 });
}
