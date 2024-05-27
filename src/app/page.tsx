"use client";

import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

export default function () {
  // const [host, setHost] = useState("192.168.122.227");
  const [host, setHost] = useState("192.168.122.120");
  const [port, setPort] = useState(3389);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");

  const connect = async () => {
    const url = new URL("/api/", document.location.origin)
    url.searchParams.append("host", host)
    url.searchParams.append("port", port.toString())
    url.searchParams.append("username", username)
    url.searchParams.append("password", password)
    url.searchParams.append("domain", domain)
    await fetch(url);
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
    </Stack>
  );
}
