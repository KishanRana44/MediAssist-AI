function DashboardCards({ title, value }) {
  return (
    <div className="bg-white shadow p-5 rounded">
      <h2>{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default DashboardCards;