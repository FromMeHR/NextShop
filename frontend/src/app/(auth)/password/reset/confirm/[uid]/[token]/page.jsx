import { RestorePasswordPage } from "@/features/RestorePasswordPage/RestorePasswordPage";

export const metadata = { title: "Відновлення паролю | Voltio" };

export default async function Page({ params }) {
  const { uid, token } = await params;
  return <RestorePasswordPage uid={uid} token={token} />;
}
