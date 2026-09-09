function UploadCard({ title, onChange }) {
  return (
    <div className="bg-white shadow-md p-5 rounded">
      <h2 className="text-lg font-semibold">{title}</h2>

      <input
        type="file"
        onChange={onChange}
        className="mt-3"
      />

      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-3">
        Upload
      </button>
    </div>
  );
}

export default UploadCard;