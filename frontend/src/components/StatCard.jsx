export default function StatCard({
  title,
  value,
  description,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm text-gray-500">
        {title}
      </h3>

      <h2 className="text-3xl font-semibold mt-2">
        {value}
      </h2>

      <p className="text-sm text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}