"use client";

import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { createClient } from "node-rdpjs-2";

export default function () {
  const [host, setHost] = useState("192.168.1.2");
  const [port, setPort] = useState(3389);
  const [username, setUsername] = useState("usename");
  const [password, setPassword] = useState("password");
  const [domain, setDomain] = useState("domain");

  const connect = () => {
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
  };

  return (
    <Stack gap={2}>
      <Stack direction="row" gap={2}>
        <TextField
          label="host"
          value={host}
          onChange={(event) => setHost(event.target.value)}
        />
        <TextField
          type="number"
          label="port"
          value={port}
          onChange={(event) => setPort(parseInt(event.target.value))}
        />
      </Stack>
      <TextField
        label="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <TextField
        type="password"
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextField
        label="Domain"
        value={domain}
        onChange={(event) => setDomain(event.target.value)}
      />
      <Button onClick={() => connect()}>Connect</Button>
    </Stack>
  );
}
