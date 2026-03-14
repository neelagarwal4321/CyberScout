import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider } from "./context/ChatContext";
import { CourseProvider } from "./context/CourseContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <ChatProvider>
            <div className="h-screen overflow-hidden bg-[#0A0E1A]">
              <RouterProvider router={router} />
            </div>
          </ChatProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
