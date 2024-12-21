"use client";

import { Button, Stack, TextField } from "@mui/material";
import { MouseEvent, useRef, useState } from "react";
import { EventEmitter } from "stream";

async function* streamingFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw response;
    // return response;
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw response;
    // return response;
  }

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }

  // const decoder = new TextDecoder("utf-8");
  // for (;;) {
  //   const { done, value } = await reader.read();
  //   if (done) break;
  //   try {
  //     console.log("value", value);
  //     const decodedValue = decoder.decode(value);
  //     // console.log("decodedValue", decodedValue);
  //     yield decodedValue;
  //     // yield value;
  //   } catch (e: any) {
  //     console.warn(e.message);
  //   }
  // }
}

export default function () {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [host, setHost] = useState("192.168.122.227");
  const [host, setHost] = useState("192.168.122.120");
  const [port, setPort] = useState(3389);
  const [username, setUsername] = useState("exovii");
  const [password, setPassword] = useState("exovii");
  const [domain, setDomain] = useState("");
  const [width, setWidth] = useState(256);
  const [height, setHeight] = useState(128);
  const [bitsPerPixel, setBitsPerPixel] = useState(32);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Response>();

  const connect = async () => {
    setError(undefined);
    let error: Response | undefined = undefined;
    const url = new URL(`/api/`, document.location.origin);
    url.searchParams.append("host", host);
    url.searchParams.append("port", port.toString());
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);
    url.searchParams.append("domain", domain);
    url.searchParams.append("width", width.toString());
    url.searchParams.append("height", height.toString());
    url.searchParams.append("bitsPerPixel", bitsPerPixel.toString());
    while (!error) {
      try {
        const it = streamingFetch(url);
        console.log("it", it);
        let data = new Uint8Array([]);
        for await (let chunk of it) {
          console.log("Chunk size", chunk.length);
          console.log("Chunk", chunk);

          // data = new Uint8Array(Buffer.concat([data, chunk]).buffer);
          data = new Uint8Array([...data, ...chunk]);
          console.log("Current data size", data.length);

          if (data.length < (width * height * bitsPerPixel) / 4 + 9) {
            continue;
          }

          const parsed = {
            x: Buffer.from(data.slice(0, 2)).readInt16LE(),
            y: Buffer.from(data.slice(2, 4)).readInt16LE(),
            w: Buffer.from(data.slice(4, 6)).readInt16LE(),
            h: Buffer.from(data.slice(6, 8)).readInt16LE(),
            bpp: data[8],
            buffer: { data: Buffer.from(data.slice(9)) },
          };
          console.log("Parsed", parsed);
          console.log("Parsed size", parsed.buffer.data.length);

          data = new Uint8Array([]);

          // BGRA -> RGBA
          const imageArr = new Uint8ClampedArray(4 * parsed.w * parsed.h);
          for (let i = 0; i < parsed.buffer.data.length; i += 4) {
            imageArr[i + 0] = parsed.buffer.data[i + 2];
            imageArr[i + 1] = parsed.buffer.data[i + 1];
            imageArr[i + 2] = parsed.buffer.data[i + 0];
            imageArr[i + 3] = parsed.buffer.data[i + 3];
          }
          console.log("imageArr", imageArr);
          const imageData = new ImageData(imageArr, parsed.w, parsed.h);
          // console.log("imageData", imageData);
          canvasRef.current
            ?.getContext("2d")
            ?.putImageData(imageData, parsed.x, parsed.y);
        }
      } catch (e) {
        console.log("ERROR", e);
        if (e instanceof Response) {
          error = e;
          setError(e);
        }
      }
    }
  };

  const onMouseMove = async (event: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    // console.log("event", event);
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    // console.log("pos", pos);
    const url = new URL("/api/mouse", document.location.origin);
    url.searchParams.append("x", pos.x.toString());
    url.searchParams.append("y", pos.y.toString());
    const response = await fetch(url, { method: "POST" });
  };

  const onMouseDown = async (event: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    // console.log("event", event);
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    // console.log("pos", pos);
    const url = new URL("/api/mouse", document.location.origin);
    url.searchParams.append("x", pos.x.toString());
    url.searchParams.append("y", pos.y.toString());
    url.searchParams.append("pressLeft", "true");
    const response = await fetch(url, { method: "POST" });
  };

  const onMouseUp = async (event: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    // console.log("event", event);
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    // console.log("pos", pos);
    const url = new URL("/api/mouse", document.location.origin);
    url.searchParams.append("x", pos.x.toString());
    url.searchParams.append("y", pos.y.toString());
    url.searchParams.append("pressLeft", "false");
    const response = await fetch(url, { method: "POST" });
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
      {error ? <span>{error.status}</span> : null}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        // onMouseMove={(event: MouseEvent<HTMLCanvasElement>) =>
        //   onMouseMove(event)
        // }
        // onMouseDown={(event: MouseEvent<HTMLCanvasElement>) =>
        //   onMouseDown(event)
        // }
        // onMouseUp={(event: MouseEvent<HTMLCanvasElement>) => onMouseUp(event)}
        style={{ outline: "1px solid red" }}
      />
    </Stack>
  );
}
