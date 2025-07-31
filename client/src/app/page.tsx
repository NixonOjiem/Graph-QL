"use client";
import LandingComponent from "./components/LandingComponent";
import GetCity from "./components/GetCity";
export default function Home() {
  return (
    <div>
      {/* <LandingComponent /> */}
      <GetCity />
    </div>
  );
}
// export const metadata = {
//   title: "GraphQL Countries",
//   description: "A simple app to display countries using GraphQL",
// };
// export const dynamic = "force-dynamic"; // Ensure this page is always server-rendered
