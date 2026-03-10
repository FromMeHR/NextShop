import { ErrorPage404 } from "../features/ErrorPage/ErrorPage404";

export const metadata = { title: "Сторінка не знайдена | Voltio" };

export default function CustomNotFound() {
  return <ErrorPage404 />;
}
