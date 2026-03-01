import { AuthPasswordForm } from "@/components/auth-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthPasswordForm
      title="Reset Password"
      description="Enter your new password for Excelora."
      successMessage="Password updated. Redirecting to sign in..."
    />
  );
}
