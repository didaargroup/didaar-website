

import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import InvitationValidateForm from "./form";
import { headers } from "next/headers";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function SignUpPage({ params }: Props) {

  const { session } = await getCurrentSession()
  const { locale } = await params

  if (!session) {
    // Get the current full path to redirect back after login
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || `/${locale}/invitation/validate`;
    redirect(`/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've successfully authenticated with GitHub. Enter your invitation code to complete registration.
            </p>
          </div>

          {/* Invitation Form */}
          <InvitationValidateForm />

          {/* Help Text */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">Need an invitation?</strong> Contact an administrator to request access.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure invitation-based registration powered by GitHub OAuth
          </p>
        </div>
      </div>
    </div>
  );
}
