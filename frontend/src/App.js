import { useCallback, useEffect, useState } from "react";
import { App as AntApp, Button, Card, ConfigProvider, Flex, Layout, Spin, Tooltip, Typography, theme as antdTheme } from "antd";
import { LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import "./App.css";
import * as api from "./api";
import AuthForm from "./components/AuthForm";
import TodoPage from "./components/TodoPage";
import useTheme from "./hooks/useTheme";

const { Title, Text } = Typography;

/**
 * App - sets up Ant Design for the whole app:
 *   - <ConfigProvider> applies the theme: brand color + light/dark algorithm.
 *     Ant Design ships a ready-made dark theme (darkAlgorithm), so every
 *     component switches colors automatically.
 *   - <AntApp> enables App.useApp(), which gives components a `message` API
 *     for pop-up notifications that follow the current theme.
 */
function App() {
  const { theme, toggleTheme } = useTheme(); // "light" | "dark"

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: "#4f46e5", borderRadius: 8 }, // our purple brand color
      }}
    >
      <AntApp>
        <Main theme={theme} toggleTheme={toggleTheme} />
      </AntApp>
    </ConfigProvider>
  );
}

/**
 * Main - decides what to show based on whether someone is logged in:
 *   - checking the saved token -> loading spinner
 *   - not logged in            -> login / signup form
 *   - logged in                -> header with logout + the todo page
 * It lives inside <AntApp> so it can use App.useApp().
 */
function Main({ theme, toggleTheme }) {
  const { message } = AntApp.useApp(); // message.success(...) / message.error(...)
  const [user, setUser] = useState(null); // the logged-in user, or null
  // Start in "checking" mode only if a token was saved from a previous visit
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(api.getToken()));

  // Log out: forget the token and the user. Nothing to tell the server, because
  // a JWT isn't stored on the server - deleting it on our side is enough.
  // useCallback keeps the same function between renders (it's used in useEffect below).
  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  // Clicking "Log out"
  const handleLogout = () => {
    logout();
    message.success("Logged out");
  };

  // Called by AuthForm after a successful login or signup
  const handleAuthSuccess = (loggedInUser, isNewAccount) => {
    setUser(loggedInUser);
    message.success(isNewAccount ? `Welcome, ${loggedInUser.name}!` : `Welcome back, ${loggedInUser.name}!`);
  };

  useEffect(() => {
    // If the server ever rejects our token (e.g. expired), api.js calls this.
    // The fixed "key" stops the same message from showing twice.
    api.setUnauthorizedHandler(() => {
      logout();
      message.error({ content: "Your session has expired. Please log in again.", key: "session-expired" });
    });

    // On page load, if a token was saved, ask the server who it belongs to.
    // This keeps the user logged in across refreshes.
    if (!api.getToken()) return;
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // If the token is still saved, the 401 handler above didn't run, so the
        // problem is the server itself (e.g. backend not running)
        if (api.getToken()) {
          message.error({ content: "Could not connect to the server. Is the backend running?", key: "server-down" });
        }
        logout();
      })
      .finally(() => setCheckingAuth(false));
  }, [logout, message]);

  const isDark = theme === "dark";

  return (
    // Layout gives the page its background color from the theme
    <Layout className="page">
      <Card className="app-card">
        {/* Theme switch in the top-right corner. Shows the icon of the theme you'll switch TO. */}
        <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          <Button
            className="theme-toggle"
            shape="circle"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          />
        </Tooltip>

        <Flex vertical align="center" gap={4} className="app-header">
          <Title level={2} style={{ margin: 0, color: "#4f46e5" }}>
            Todo App
          </Title>
          {/* Greeting + logout button, only when logged in */}
          {user && (
            <Flex align="center" gap={8}>
              <Text type="secondary">Hi, {user.name}</Text>
              <Button type="link" size="small" icon={<LogoutOutlined aria-hidden />} onClick={handleLogout}>
                Log out
              </Button>
            </Flex>
          )}
        </Flex>

        {checkingAuth ? (
          <Flex justify="center" style={{ padding: 32 }}>
            <Spin />
          </Flex>
        ) : user ? (
          // "key" makes React create a fresh TodoPage (with fresh state) for each user
          <TodoPage key={user.id} />
        ) : (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        )}
      </Card>
    </Layout>
  );
}

export default App;
