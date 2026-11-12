"use client";

import Link from "next/link";

const ErrorPage = ({ error }: { error: Error }) => {
  return (
    <div className="h-[calc(100vh-var(--header-height))] w-full flex flex-col gap-8 p-8 items-center justify-center">
      <span className="text-center text-5xl text-foreground-lighter">
        Sorry, something went wrong
      </span>
      <div className="flex flex-row items-center gap-4">
        <Link href="/" className="w-fit p-4 text-lg border">
          Return to homepage
        </Link>
        <button
          className="w-fit p-4 text-lg border"
          onClick={() => location.reload()}
        >
          Refresh page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
