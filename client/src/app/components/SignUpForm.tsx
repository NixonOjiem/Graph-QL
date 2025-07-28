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

      // Save token to localStorage
      localStorage.setItem("token", data.localSignup.token);
      console.log("Signup successful!", data.localSignup.user);

      // Redirect or update UI
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Full Name</label>
        <input name="fullName" type="text" required />
      </div>

      <div>
        <label>Email</label>
        <input name="email" type="email" required />
      </div>

      <div>
        <label>Password</label>
        <input name="password" type="password" required />
      </div>

      <div>
        <label>Phone</label>
        <input name="phone" type="tel" />
      </div>

      <div>
        <label>Location</label>
        <input name="location" type="text" />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {error && <p>Error: {error.message}</p>}
    </form>
  );
}
