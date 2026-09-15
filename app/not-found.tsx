"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:py-32">
      <p className="eyebrow text-primary">Error 404</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
        This shelf is empty
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you were looking for has moved or never existed. The catalogue is
        still here, and so are the gift boxes.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/shop">
          <Button className="press h-11 px-7" data-testid="button-404-shop">
            Browse all products
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="press h-11 px-7" data-testid="button-404-home">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
