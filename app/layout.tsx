import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PasswordResetRedirect } from './components/auth/PasswordResetRedirect';
import { EmailConfirmationRedirect } from './components/auth/EmailConfirmationRedirect';

export const metadata = {
  title: "ChatNotePadAi",
  description: "AI-powered note editing and transformation with natural language commands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <PasswordResetRedirect />
            <EmailConfirmationRedirect />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
