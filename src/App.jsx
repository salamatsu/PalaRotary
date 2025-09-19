import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntProvider, ConfigProvider } from "antd";
import RootRoutes from "./routes";
import "@ant-design/v5-patch-for-react-19";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AntProvider>
        <RootRoutes />
      </AntProvider>
    </QueryClientProvider>
  );
};

export default App;
