"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { AuthLayout } from "../layouts/auth-layout";
import { SignInView } from "../views/sign-in-view";
import { useLottie } from "lottie-react";
import LoadingAnimation from "../../../../public/lottie/kW7Rv9wrfr.json";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const options = {
    animationData: LoadingAnimation,
    loop: true,
  };

  const { View } = useLottie(options);

  return (
    <>
      <AuthLoading>
        <AuthLayout>{View}</AuthLayout>
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </>
  );
}
