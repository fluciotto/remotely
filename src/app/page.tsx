"use client";

import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

export default function () {
  const [host, setHost] = useState("192.168.1.2");
  const [port, setPort] = useState(3389);
  const [username, setUsername] = useState("usename");
  const [password, setPassword] = useState("password");
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
      <Button>Connect</Button>
    </Stack>
  );
}
