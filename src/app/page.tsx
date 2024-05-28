"use client";

import { Button, Stack, TextField } from "@mui/material";
import { useRef, useState } from "react";

async function* streamingFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }
  const decoder = new TextDecoder("utf-8");

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    try {
      const v = decoder.decode(value);
      // console.log("value", v);
      yield decoder.decode(value);
      // console.log("value", value);
      // yield value;
    } catch (e: any) {
      console.warn(e.message);
    }
  }
}

export default function () {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [host, setHost] = useState("192.168.122.227");
  const [host, setHost] = useState("192.168.122.120");
  const [port, setPort] = useState(3389);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");

  const connect = async () => {
    const url = new URL("/api/", document.location.origin);
    url.searchParams.append("host", host);
    url.searchParams.append("port", port.toString());
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);
    url.searchParams.append("domain", domain);
    // await fetch(url);
    while (true) {
      const it = streamingFetch(url);
      for await (let value of it) {
        try {
          console.log("v", value);
          const chunk = JSON.parse(value);
          console.log("chunk", chunk.buffer.data.length);
          const lol = new Uint8ClampedArray(4 * chunk.w * chunk.h);
          for (let i = 0; i < chunk.buffer.data.length; i += 4) {
            lol[i + 0] = chunk.buffer.data[i];
            lol[i + 1] = chunk.buffer.data[i + 1];
            lol[i + 2] = chunk.buffer.data[i + 2];
            lol[i + 3] = chunk.buffer.data[i + 3];
          }
          console.log("lol", lol);
          // var buffer32 = new Uint32Array(chunk.buffer),
          //   len = buffer32.length;
          // while (len--) buffer32[len] = chunk.buffer[len];
          canvasRef.current
            ?.getContext("2d")
            ?.putImageData(new ImageData(lol, chunk.w, chunk.h), chunk.x, chunk.y);
          // setData((prev) => [...prev, chunk]);
        } catch (e: any) {
          console.warn(e.message);
        }
      }
    }
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
      <Stack direction="row" gap={2}>
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
      </Stack>
      <TextField
        label="Domain"
        value={domain}
        onChange={(event) => setDomain(event.target.value)}
      />
      <Button onClick={() => connect()}>Connect</Button>

      <canvas ref={canvasRef} width={1024} height={768} />
    </Stack>
  );
}
