export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold">Tour: {id}</h1>
      <p className="mt-2 text-muted-foreground">Tour dates and details.</p>
    </div>
  );
}
