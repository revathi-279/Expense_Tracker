import Header from "./Header";
import { Outlet } from "react-router";

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="grow">
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;