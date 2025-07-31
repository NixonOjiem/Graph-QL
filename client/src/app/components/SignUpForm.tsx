"use client";
import React from "react"; // Import React to access React.FormEvent
import { useMutation, gql } from "@apollo/client";
import Image from "next/image";

// 1. Define interfaces for your GraphQL types
interface User {
  id: string;
  fullName: string;
  email: string;
}

interface LocalSignupResponse {
  localSignup: {
    token: string;
    user: User;
  };
}

interface LocalSignupInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string; // Optional based on form/schema
  location?: string; // Optional based form/schema
}

interface LocalSignupMutationVariables {
  input: LocalSignupInput;
}

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
  // 2. Apply types to useMutation hook
  const [signup, { loading, error }] = useMutation<
    LocalSignupResponse,
    LocalSignupMutationVariables
  >(LOCAL_SIGNUP_MUTATION);

  // 3. Explicitly type the 'e' parameter
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget); // Use currentTarget for form events

    try {
      const { data } = await signup({
        variables: {
          input: {
            fullName: formData.get("fullName") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            phone: formData.get("phone") as string, // Cast to string
            location: formData.get("location") as string, // Cast to string
          },
        },
      });

      // 4. Add a null/undefined check for 'data'
      if (data && data.localSignup && typeof window !== "undefined") {
        localStorage.setItem("token", data.localSignup.token);
        console.log(data.localSignup.token);
        window.location.href = "/"; // Redirect after successful signup
        console.log("Signup successful!", data.localSignup.user);
      } else {
        console.error("Signup failed: Unexpected empty data response.");
        // You might want to display a more specific error message to the user here
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Signup error:", err);
      // Apollo errors will typically fall here
      // You can refine this to check for err.message or specific GraphQL errors
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl border border-gray-200">
        {/* Optional vector image */}
        <div className="flex justify-center mb-6">
          <Image
            src="/signup-vector.svg"
            alt="Signup illustration"
            width={80}
            height={80}
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
              Signup failed. Please try again. {error.message}{" "}
              {/* Show error message for debugging */}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
