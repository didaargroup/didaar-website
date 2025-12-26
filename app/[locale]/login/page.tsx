import LoginForm from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Login Card */}
				<Card className="shadow-xl">
					<CardHeader className="text-center space-y-4">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto shadow-lg">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div>
							<CardTitle className="text-3xl">Welcome Back</CardTitle>
							<CardDescription className="text-base mt-2">
								Sign in to continue to your account
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						{/* GitHub Login Button */}
						<LoginForm />

						{/* Footer Text */}
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								By signing in, you agree to our Terms of Service and Privacy Policy
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Bottom Info */}
				<div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Secure authentication powered by GitHub OAuth
					</p>
				</div>
			</div>
		</div>
	);
}