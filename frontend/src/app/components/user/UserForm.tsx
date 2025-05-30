// src/components/user/UserForm.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { User } from "../../types";

interface UserFormProps {
  initialData?: User;
  onSubmit: (user: Omit<User, "id"> | User) => void;
  onCancel: () => void;
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState<User["role"]>(initialData?.role || "viewer");
  const [password, setPassword] = useState("");

  const [displayNameError, setDisplayNameError] = useState(false);
  const [displayNameHelperText, setDisplayNameHelperText] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [usernameHelperText, setUsernameHelperText] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState("");

  useEffect(() => {
    if (initialData) {
      setPassword("");
      setUsername(initialData.username || "");
      setName(initialData.name || "");
    }
  }, [initialData]);

  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      setDisplayNameError(true);
      setDisplayNameHelperText("ชื่อที่แสดงห้ามว่างเปล่า");
      isValid = false;
    } else {
      setDisplayNameError(false);
      setDisplayNameHelperText("");
    }

    if (!username.trim()) {
      setUsernameError(true);
      setUsernameHelperText("ชื่อผู้ใช้งานห้ามว่างเปล่า");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameHelperText("");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(true);
      setEmailHelperText("อีเมลห้ามว่างเปล่า");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailHelperText("รูปแบบอีเมลไม่ถูกต้อง");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailHelperText("");
    }

    if (!initialData) {
      if (!password.trim()) {
        setPasswordError(true);
        setPasswordHelperText("รหัสผ่านห้ามว่างเปล่า");
        isValid = false;
      } else if (password.length < 6) {
        setPasswordError(true);
        setPasswordHelperText("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        isValid = false;
      } else {
        setPasswordError(false);
        setPasswordHelperText("");
      }
    } else {
      if (password.trim() !== "" && password.length < 6) {
        setPasswordError(true);
        setPasswordHelperText("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
        isValid = false;
      } else {
        setPasswordError(false);
        setPasswordHelperText("");
      }
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Always include the password property in the payload for both add and edit.
    // The backend's UserRepository.UpdateAsync will handle preserving the old hash if 'password' is an empty string.
    const userData: Omit<User, "id"> | User = {
      username,
      name,
      email,
      role,
      password: password, // IMPORTANT CHANGE: Always include password property
    };

    if (initialData) {
      onSubmit({ ...initialData, ...userData });
    } else {
      onSubmit(userData);
    }
  };

  return (
    <Box
      component="form"
      sx={{ "& .MuiTextField-root": { m: 1, width: "100%" }, p: 2 }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        {initialData ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
      </Typography>
      {!initialData && (
        <TextField
          id="user-id"
          label="รหัสผู้ใช้งาน (สร้างอัตโนมัติ)"
          defaultValue="สร้างอัตโนมัติ"
          InputProps={{
            readOnly: true,
          }}
          variant="filled"
          disabled
        />
      )}
      <TextField
        id="user-username"
        label="ชื่อผู้ใช้งาน (สำหรับเข้าสู่ระบบ)"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (usernameError && e.target.value.trim()) {
            setUsernameError(false);
            setUsernameHelperText("");
          }
        }}
        required
        error={usernameError}
        helperText={usernameHelperText}
      />
      <TextField
        id="user-password"
        label="รหัสผ่าน"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError && e.target.value.length >= 6) {
            setPasswordError(false);
            setPasswordHelperText("");
          }
        }}
        required={!initialData}
        error={passwordError}
        helperText={
          initialData
            ? passwordHelperText || "ปล่อยว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
            : passwordHelperText
        }
      />

      <TextField
        id="user-display-name"
        label="ชื่อที่แสดง"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (displayNameError && e.target.value.trim()) {
            setDisplayNameError(false);
            setDisplayNameHelperText("");
          }
        }}
        required
        error={displayNameError}
        helperText={displayNameHelperText}
      />
      <TextField
        id="user-email"
        label="อีเมล"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (
            emailError &&
            e.target.value.trim() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
          ) {
            setEmailError(false);
            setEmailHelperText("");
          }
        }}
        required
        error={emailError}
        helperText={emailHelperText}
      />

      <FormControl fullWidth sx={{ m: 1 }}>
        <InputLabel id="user-role-label">บทบาท</InputLabel>
        <Select
          labelId="user-role-label"
          id="user-role"
          value={role}
          label="บทบาท"
          onChange={(e) => setRole(e.target.value as User["role"])}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
          <MenuItem value="viewer">Viewer</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {initialData ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้งาน"}
        </Button>
      </Box>
    </Box>
  );
}
