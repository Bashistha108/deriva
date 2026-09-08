export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form className="p-8 bg-white rounded-xl shadow-md flex flex-col gap-4 w-96">
        <h1 className="text-2xl font-bold">Register</h1>
        <input placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Password" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Sign Up</button>
      </form>
    </div>
  );
}
