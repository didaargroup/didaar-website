"use client";

import { submitInvitation } from "@/app/_actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useActionState, useState } from "react";

const initialState = {
    errors: undefined,
};

export default function InvitationValidateForm({ userId }: { userId: number }) {
    const submitInvitationWithUserId = submitInvitation.bind(null, userId);
    const [state, formAction, isPending] = useActionState(submitInvitationWithUserId, initialState);
    const [value, setValue] = useState("");

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-3">
                <Label htmlFor="code">Invitation Code</Label>
                <InputOTP
                    maxLength={12}
                    value={value}
                    onChange={(value) => setValue(value)}
                    containerClassName="w-full justify-between gap-1"
                >
                    <InputOTPGroup className="flex-1 justify-between gap-1">
                        <InputOTPSlot index={0} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={1} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={2} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={3} className="flex-1 h-12 text-lg" />
                    </InputOTPGroup>
                    <InputOTPSeparator  />
                    <InputOTPGroup className="flex-1 justify-between gap-1">
                        <InputOTPSlot index={4} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={5} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={6} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={7} className="flex-1 h-12 text-lg" />
                    </InputOTPGroup>
                    <InputOTPSeparator  />
                    <InputOTPGroup className="flex-1 justify-between gap-1">
                        <InputOTPSlot index={8} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={9} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={10} className="flex-1 h-12 text-lg" />
                        <InputOTPSlot index={11} className="flex-1 h-12 text-lg" />
                    </InputOTPGroup>
                </InputOTP>
                <Input
                    value={value}
                    type="hidden"
                    id="code"
                    name="code"
                    required
                    autoComplete="off"
                />

            </div>

            {/* Field-level errors (from Zod validation) */}
            {state.errors?.fieldErrors?.code && Array.isArray(state.errors.fieldErrors.code) && state.errors.fieldErrors.code.length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{state.errors.fieldErrors.code[0]}</span>
                    </div>
                </div>
            )}

            {/* Form-level errors (from business logic) */}
            {state.errors?.formErrors && Array.isArray(state.errors.formErrors) && state.errors.formErrors.length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{state.errors.formErrors[0]}</span>
                    </div>
                </div>
            )}

            <Button
                type="submit"
                disabled={isPending}
                className="w-full"
                size="lg"
            >
                {isPending ? "Verifying..." : "Complete Registration"}
            </Button>
        </form>
    );
}