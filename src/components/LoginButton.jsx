import { useAuth } from '../contexts/AuthContext';

const LoginButton = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  const handleAuth = async () => {
    try {
      if (user) {
        await logout();
      } else {
        await signInWithGoogle();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <button
      onClick={handleAuth}
      className="flex items-center gap-2 px-4 py-2 bg-[#2c2c35] hover:bg-[#3c3c45] text-white rounded-lg transition-colors"
    >
      {user ? (
        <>
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-6 h-6 rounded-full"
          />
          <span>Sign Out</span>
        </>
      ) : (
        <>
          <img
            src="/images/google.png"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  );
};

export default LoginButton;
