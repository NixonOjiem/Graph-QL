"use client";
import React from "react";
import { useMutation, gql } from "@apollo/client";
import Image from "next/image";

// Define interfaces right here, at the top of the file
// so they are accessible by the LoginForm component.
interface User {
  id: string;
  fullName: string;
  email: string;
}

interface LoginResponse {
  login: {
    token: string;
    user: User;
  };
}

interface LoginInput {
  email: string;
  password?: string;
}

interface LoginMutationVariables {
  input: LoginInput;
}

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        fullName
        email
      }
    }
  }
`;

export default function LoginForm() {
  const [login, { loading, error }] = useMutation<
    LoginResponse,
    LoginMutationVariables
  >(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data } = await login({
        variables: {
          input: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
        },
      });

      if (data && data.login && typeof window !== "undefined") {
        localStorage.setItem("token", data.login.token);
        window.location.href = "/";
        console.log("Login successful!", localStorage.token);
      } else {
        console.error("Login failed: Unexpected empty data response.");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="w-full max-w-md p-8 shadow-lg rounded-xl bg-white border border-gray-200">
        <div className="flex justify-center mb-6">
          <Image
            src="/login-vector.svg"
            alt="Login illustration"
            className="w-24 h-24"
            height={96}
            width={96}
          />
        </div>
        <h2 className="text-center text-2xl font-bold text-red-600 mb-4">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <p className="text-sm text-red-500 mt-2">
              Login failed. Please try again. {error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
