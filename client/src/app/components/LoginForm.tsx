import { useMutation, gql } from "@apollo/client";

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
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const { data } = await login({
        variables: {
          input: {
            email: formData.get("email"),
            password: formData.get("password"),
          },
        },
      });

      localStorage.setItem("token", data.login.token);
      console.log("Login successful!", data.login.user);

      // Redirect or update UI
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>{/* Form fields similar to signup */}</form>
  );
}
