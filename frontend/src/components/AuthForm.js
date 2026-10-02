import { useState } from "react";
import { Alert, Button, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import * as api from "../api";

const { Title, Text } = Typography;

/**
 * AuthForm - one form that switches between "Log in" and "Sign up".
 *
 * Uses Ant Design's <Form>: each <Form.Item> has a "name" (the field key) and
 * "rules" (validation). The form checks the rules itself, shows messages under
 * the fields, and only calls onFinish(values) when everything is valid.
 *
 * Props:
 *   onAuthSuccess - called with (user, isNewAccount) after a successful login/signup
 */
export default function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [error, setError] = useState(""); // error from the server, e.g. wrong password
  const [submitting, setSubmitting] = useState(false); // shows a spinner on the button

  const isSignup = mode === "signup";

  // Runs only after all field rules pass. `values` = { name, email, password }
  const handleFinish = async ({ name, email, password }) => {
    setError("");
    setSubmitting(true);

    try {
      // Both endpoints return { token, user }
      const { token, user } = isSignup
        ? await api.register(name, email, password)
        : await api.login(email, password);

      api.setToken(token); // save the token so future requests are authenticated
      onAuthSuccess(user, isSignup); // tell App.js who is logged in (and if they just signed up)
    } catch (err) {
      setError(err.message); // e.g. "Invalid email or password"
      setSubmitting(false);
    }
  };

  // Switch between login and signup, clearing any old error
  const toggleMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
  };

  return (
    <div>
      <Title level={4} style={{ textAlign: "center", marginTop: 0 }}>
        {isSignup ? "Create an account" : "Welcome back"}
      </Title>

      {/* requiredMark={false} hides the red asterisks; size="large" for all inputs */}
      <Form layout="vertical" size="large" requiredMark={false} onFinish={handleFinish}>
        {/* The name field only appears when signing up */}
        {isSignup && (
          <Form.Item name="name" rules={[{ required: true, whitespace: true, message: "Please enter your name" }]}>
            <Input prefix={<UserOutlined aria-hidden />} placeholder="Name" autoComplete="name" />
          </Form.Item>
        )}

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input prefix={<MailOutlined aria-hidden />} placeholder="Email" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            // The minimum length rule only applies when creating an account
            ...(isSignup ? [{ min: 6, message: "Password must be at least 6 characters" }] : []),
          ]}
        >
          {/* Input.Password adds the "show/hide password" eye icon */}
          <Input.Password
            prefix={<LockOutlined aria-hidden />}
            placeholder={isSignup ? "Password (min 6 characters)" : "Password"}
            // Lets password managers know whether to suggest a new or saved password
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </Form.Item>

        {/* Errors from the server (field errors are shown by the form itself) */}
        {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

        <Button type="primary" htmlType="submit" block loading={submitting}>
          {isSignup ? "Sign up" : "Log in"}
        </Button>
      </Form>

      <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Button type="link" onClick={toggleMode} style={{ padding: 0 }}>
          {isSignup ? "Log in" : "Sign up"}
        </Button>
      </Text>
    </div>
  );
}
