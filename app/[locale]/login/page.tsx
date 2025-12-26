import LoginForm from "./login-form";

export default async function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Card Container */}
				<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							Welcome Back
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Sign in to continue to your account
						</p>
					</div>

					{/* GitHub Login Button */}
					<LoginForm />

					{/* Footer Text */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							By signing in, you agree to our Terms of Service and Privacy Policy
						</p>
					</div>
				</div>

				{/* Bottom Info */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Secure authentication powered by GitHub OAuth
					</p>
				</div>
			</div>
		</div>
	);
}