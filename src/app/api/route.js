const client = createClient({
    domain: domain,
    userName: username,
    password: password,
    enablePerf: true,
    autoLogin: true,
    decompress: false,
    screen: { width: 800, height: 600 },
    locale: "en",
    logLevel: "INFO",
  })
    .on("connect", function () {})
    .on("close", function () {})
    .on("bitmap", function (bitmap: any) {})
    .on("error", function (err: any) {})
    .connect(host, port);
