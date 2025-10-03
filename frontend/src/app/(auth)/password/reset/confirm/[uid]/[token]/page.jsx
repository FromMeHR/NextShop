import { RestorePasswordPage } from "@/features/RestorePasswordPage/RestorePasswordPage";

export default async function Page({ params }) {
  const { uid, token } = await params;
  return <RestorePasswordPage uid={uid} token={token} />;
}
