"use client";
import { useMutation, gql } from "@apollo/client";

const LOCAL_SIGNUP_MUTATION = gql`
  mutation LocalSignup($input: LocalSignupInput!) {
    localSignup(input: $input) {
      token
      user {
        id
        fullName
        email
      }
    }
  }
`;

export default function SignupForm() {
  const [signup, { loading, error }] = useMutation(LOCAL_SIGNUP_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const { data } = await signup({
        variables: {
          input: {
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            password: formData.get("password"),
            phone: formData.get("phone"),
            location: formData.get("location"),
          },
        },
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.localSignup.token);
        console.log("Signup successful!", data.localSignup.user);
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl border border-gray-200">
        {/* Optional vector image */}
        <div className="flex justify-center mb-6">
          <img
            src="/signup-vector.svg"
            alt="Signup illustration"
            className="w-20 h-20"
          />
        </div>
        <h2 className="text-center text-2xl font-bold text-red-600 mb-4">
          Create Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              name="location"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          {error && (
            <p className="text-sm text-red-500 mt-2">
              Signup failed. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
