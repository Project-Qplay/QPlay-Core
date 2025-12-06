import React, { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google"; //Used in your LoginWithGoogle component:
import { toast } from "react-hot-toast"; //Used for showing success or error messages:
import { CredentialResponse } from "@react-oauth/google"; //Used to type the credential response from Google:

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

//  Google Login Button Component integrated with AuthContext
// Handles sign-in via Google OAuth and stores session centrally
const LoginWithGoogle: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signInWithGoogle } = useAuth(); //  Use auth context method for centralized login logic

  //  Handles Google login success
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    const credential = credentialResponse.credential;

    //  Check if credential is present
    if (!credential) {
      toast.error("Missing Google credential");
      return;
    }

    try {
      //  Pass credential to context for backend login + token handling
      await signInWithGoogle(credential); //Authcontext hhandles storage.

      //  Success feedback
      toast.success("Welcome to Quantum Quest!");

      //  Close modal on success
      onClose();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      toast.error("Google Login Failed");
    }
  };
  return (
    //  Google login UI button
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => toast.error("Google Login Failed")}
    />
  );
};

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, loading } = useAuth();

  // Modal transition state
  const [visible, setVisible] = useState(isOpen);

  React.useEffect(() => {
    if (isOpen) setVisible(true);
    else {
      // Delay unmount for transition
      const timeout = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Accessibility: trap focus when modal is open
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length) focusable[0].focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (mode === "signin") {
        await signIn(formData.email, formData.password);
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          full_name: undefined,
        });
      }
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Authentication failed" });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setErrors({});
    setFormData({ email: "", password: "", username: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-2xl border border-gray-700 max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-orbitron font-bold">
              {mode === "signin" ? "Welcome Back" : "Join Quantum Quest"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {mode === "signin"
                ? "Sign in to continue your quantum journey"
                : "Create your account to start exploring"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                         focus:border-purple-400 focus:outline-none transition-colors duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Username (signup only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                           focus:border-purple-400 focus:outline-none transition-colors duration-200"
                  placeholder="Choose a username"
                  required
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>
          )}

          {/* Full Name field removed to make sign up form shorter */}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                         focus:border-purple-400 focus:outline-none transition-colors duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
            {mode === "signup" && (
              <p className="text-gray-500 text-xs mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-900/30 border border-red-500 rounded-xl">
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500
                     hover:from-purple-400 hover:to-violet-400 disabled:opacity-50
                     disabled:cursor-not-allowed rounded-xl font-semibold
                     transition-all duration-300 transform hover:scale-105
                     flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </span>
              </>
            ) : (
              <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
            )}
          </button>

          {/* Mode Switch */}
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </form>

        {/* Or sign in with Google */}
        <div className="mt-6 flex justify-center [&>div]:mx-auto">
          <LoginWithGoogle onClose={onClose} />
        </div>

        {/* Features Preview section removed to make sign up form shorter */}
      </div>
    </div>
  );
};

export default AuthModal;
