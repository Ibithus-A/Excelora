import { AuthPasswordForm } from "@/components/auth-password-form";

export default function SetPasswordPage() {
  return (
    <AuthPasswordForm
      title="Set Up Your Account"
      description="Create your password to activate your Excelora student portal."
      successMessage="Account activated. Redirecting to sign in..."
      expectedRole="student"
      clearExistingSessionFirst
    />
  );
}
