export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold">Booking: {id}</h1>
      <p className="mt-2 text-muted-foreground">Booking details and contractual info.</p>
    </div>
  );
}
