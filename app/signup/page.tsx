import { AuthForm } from "@/components/auth/auth-form";
import { Navbar } from "@/components/ui/navbar";

export default function SignupPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-background to-background" />
            <Navbar />
            <div className="relative z-10 w-full max-w-md">
                <AuthForm type="signup" />
            </div>
        </main>
    );
}
