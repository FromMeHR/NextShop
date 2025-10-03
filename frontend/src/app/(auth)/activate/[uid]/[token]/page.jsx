import { ActivateUserPage } from "@/features/ActivateUserPage/ActivateUserPage";

export default async function Page({ params }) {
  const { uid, token } = await params;
  return <ActivateUserPage uid={uid} token={token} />;
}
