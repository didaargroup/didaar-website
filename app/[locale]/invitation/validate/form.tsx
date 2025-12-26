"use client";

import { submitInvitation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

const initialState = {
    error: "",
    success: false,
};

export default function InvitationValidateForm() {
    const [state, formAction, isPending] = useActionState(submitInvitation, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="code">Invitation Code</Label>
                <Input
                    type="text"
                    id="code"
                    name="code"
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    disabled={isPending}
                    required
                    className="text-center text-lg tracking-widest uppercase font-mono"
                    autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                    Enter the 12-character invitation code you received (format: XXXX-XXXX-XXXX)
                </p>
            </div>

            {state.error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{state.error}</span>
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