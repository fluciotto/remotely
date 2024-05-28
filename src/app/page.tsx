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
  const [width, setWidth] = useState(256);
  const [height, setHeight] = useState(256);
  const [bitsPerPixel, setBitsPerPixel] = useState(32);

  const connect = async () => {
    const url = new URL("/api/", document.location.origin);
    url.searchParams.append("host", host);
    url.searchParams.append("port", port.toString());
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);
    url.searchParams.append("domain", domain);
    url.searchParams.append("width", width.toString());
    url.searchParams.append("height", height.toString());
    url.searchParams.append("bitsPerPixel", bitsPerPixel.toString());
    // await fetch(url);
    while (true) {
      const it = streamingFetch(url);
      let toparse = "";
      for await (let chunk of it) {
        try {
          console.log("Chunk size", chunk.length);
          toparse += chunk;
          console.log("To parse size", toparse.length);
          const parsed = JSON.parse(toparse);
          toparse = "";
          console.log("Parsed size", parsed.buffer.data.length);
          // console.log("Parsed", parsed.buffer.data);
          // BGRA -> RGBA
          const arr = new Uint8ClampedArray(4 * parsed.w * parsed.h);
          for (let i = 0; i < parsed.buffer.data.length; i += 4) {
            arr[i + 0] = parsed.buffer.data[i + 2];
            arr[i + 1] = parsed.buffer.data[i + 1];
            arr[i + 2] = parsed.buffer.data[i];
            arr[i + 3] = parsed.buffer.data[i + 3];
          }
          // console.log("arr", arr);
          const imageData = new ImageData(arr, parsed.w, parsed.h);
          // console.log("imageData", imageData);
          canvasRef.current
            ?.getContext("2d")
            ?.putImageData(imageData, parsed.x, parsed.y);
        } catch (e) {
          // console.log(e);
          const lol =
            toparse.substring(0, 10) +
            " ... " +
            toparse.substring(toparse.length - 10, toparse.length);
          // console.log(lol);
          // console.log(chunk)
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
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          label="port"
          value={port}
          onChange={(event) => setPort(parseInt(event.target.value))}
          sx={{ flex: 1 }}
        />
      </Stack>
      <Stack direction="row" gap={2}>
        <TextField
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          sx={{ flex: 1 }}
        />
      </Stack>
      <TextField
        label="Domain"
        value={domain}
        onChange={(event) => setDomain(event.target.value)}
      />
      <Button onClick={() => connect()}>Connect</Button>

      <canvas ref={canvasRef} width={width} height={height} />
    </Stack>
  );
}
