// Create a new component: LoadingScreen.jsx
export const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="w-full h-screen flex items-center justify-center bg-black">
    <div className="text-center">
      <div className="inline-flex items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
        <span className="text-white text-xl">{message}</span>
      </div>
    </div>
  </div>
);