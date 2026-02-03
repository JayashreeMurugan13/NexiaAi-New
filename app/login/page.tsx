import { AuthForm } from "@/components/auth/auth-form";
import { Navbar } from "@/components/ui/navbar";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
            <Navbar />
            <div className="relative z-10 w-full max-w-md">
                <AuthForm type="login" />
            </div>
        </main>
    );
}
