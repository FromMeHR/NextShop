"use client";

import { useEffect } from "react";
import { ErrorPage404 } from "../features/ErrorPage/ErrorPage404";

export const metadata = { title: "Помилка" };

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPage404 />;
}
