const Loader = () => {
  return (
    <div className="flex flex-col h-[60vh] items-center justify-center bg-white dark:bg-black">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mb-4"></div>
      <p className="text-gray-700 dark:text-gray-300 text-lg">
        Loading, please wait...
      </p>
    </div>
  );
};

export default Loader;
