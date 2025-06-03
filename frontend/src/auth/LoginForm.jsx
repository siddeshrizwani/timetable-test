import React, { useState } from "react";
import Input from "../ui/Input"; // Assuming Input component is well-styled
import Button from "../ui/Button"; // Assuming Button component is well-styled

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Basic validation
    if (!email || !password) {
      setError("Please enter both Student ID/Email and Password.");
      return;
    }
    // --- TODO: Implement actual login logic here ---
    console.log("Logging in with:", { email, password });
    setTimeout(() => {
      onLoginSuccess();
    }, 500);
  };

  return (
    // Main container:
    // - Increased padding slightly from p-8 to p-10 for a bit more breathing room.
    // - Kept shadow-xl for a strong card effect, rounded-lg for soft corners.
    // - Added a subtle border (border-slate-200) to define the card edge, especially if the background is also light.
    <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md border border-slate-200">
      {/* Title:
          - Changed text-gray-800 to text-slate-700 for a slightly softer, modern feel.
          - Kept text-2xl, font-bold, text-center, and mb-8 as they are effective. */}
      <h2 className="text-2xl font-bold text-center text-slate-700 mb-8">
        Student Login
      </h2>

      {/* Error Message:
          - Added a light red background (bg-red-50) and slightly darker red text (text-red-700) for better contrast and prominence.
          - Added padding (p-3) and rounded corners (rounded-md) to make it look more like a notice.
          - Adjusted bottom margin to mb-6 to ensure good spacing. */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-6 text-center">
          {error}
        </div>
      )}

      {/* Form:
          - Kept space-y-6 for consistent vertical spacing between form elements. */}
      <form onSubmit={handleSubmit} className="space-y-6 " >
        <div >
          {/* Label is sr-only, relying on placeholder. Ensure Input component has good styling. */}
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 sr-only"
          >
             Email
          </label>
          <Input
            type="text"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Recommended: Ensure your Input component itself has classes for focus states, padding, border, etc.
            // e.g., className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          {/* Label is sr-only. Ensure Input component has good styling. */}
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 sr-only"
          >
            Password
          </label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Recommended: Similar styling considerations as the Email Input.
          />
        </div>

        <div>
          {/* Button:
              - Kept w-full. The variant="primary" implies styling comes from the Button component.
              - Ensure the Button component has good hover, focus, and active states. */}
          <Button type="submit" variant="primary" className="w-full">
            Login
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
