export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold">Artist: {slug}</h1>
      <p className="mt-2 text-muted-foreground">Artist calendar and details.</p>
    </div>
  );
}
