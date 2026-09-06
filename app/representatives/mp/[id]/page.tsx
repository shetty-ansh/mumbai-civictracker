import MPClient from "../mp-client";
import { getMumbaiMPDataById, getMumbaiMPsList } from "@/lib/services/mpService";
import { notFound } from "next/navigation";

export const dynamic = 'force-static';
export const revalidate = 604800; // 7 days

export async function generateStaticParams() {
  const { data: mps } = await getMumbaiMPsList();
  return (mps || []).map((mp) => ({
    id: mp.id,
  }));
}

export default async function MPRepresentativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [data, { data: mpsList }] = await Promise.all([
    getMumbaiMPDataById(id),
    getMumbaiMPsList()
  ]);

  if (!data) {
    notFound();
  }

  return <MPClient initialData={data} mpsList={mpsList} />;
}
